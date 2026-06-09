import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/index'
import {
  loadState,
  saveState,
  initMatchState,
  finalizeMatch,
  finalizeGTRMatch,
  MatchState,
} from '../services/matchService'
import prisma from '../lib/prisma'
import { invalidateLeaderboardCache } from '../services/leaderboardService'

// socket.id → { userId, matchId }
const socketMeta = new Map<string, { userId: string; matchId: string }>()

// matchId → Set<userId> — tracks unique connected users (not socket instances)
const matchUsers = new Map<string, Set<string>>()

// socketId → userId — for disconnect cleanup
const matchSocketToUser = new Map<string, string>()

// Per-match async mutex — serialises concurrent round:answer writes to prevent lost-update
const matchLocks = new Map<string, Promise<void>>()

// GTR duel vote tracking — matchId → { userId → pointsEarned }
const gtrVotes = new Map<string, Map<string, number>>()

// GTR vote timeout handles — fires match:end if second vote never arrives
const gtrVoteTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function withMatchLock<T>(matchId: string, fn: () => Promise<T>): Promise<T> {
  const current = matchLocks.get(matchId) ?? Promise.resolve()
  let unlock!: () => void
  const next = new Promise<void>((r) => { unlock = r })
  matchLocks.set(matchId, next)
  return current.then(fn).finally(() => {
    unlock()
    if (matchLocks.get(matchId) === next) matchLocks.delete(matchId)
  })
}

function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env['JWT_SECRET']
    if (!secret) return null
    return jwt.verify(token, secret) as JwtPayload
  } catch {
    return null
  }
}

function roomId(matchId: string) {
  return `match:${matchId}`
}

export function registerMatchHandler(io: Server) {
  io.on('connection', (socket: Socket) => {
    // ── match:join ─────────────────────────────────────────────────────────
    socket.on('match:join', async (payload: { token: string; userId: string }) => {
      const { token, userId } = payload ?? {}

      const jwtToken = (socket.handshake.auth?.token as string | undefined) ?? token
      const claims = verifyToken(jwtToken ?? '')
      if (!claims || claims.userId !== userId) {
        socket.emit('match:error', { message: 'Unauthorized' })
        return
      }

      // Resolve invite token → matchId via Redis
      const { tokenKey } = await import('../services/matchService.js')
      const { default: redis } = await import('../lib/redis.js')
      const matchId = await redis.get(tokenKey(token))

      if (!matchId) {
        // Token already consumed by HTTP join — look up by userId in DB
        const match = await prisma.match.findFirst({
          where: {
            status: 'active',
            OR: [{ hostId: userId }, { invitedId: userId }],
          },
          orderBy: { createdAt: 'desc' },
        })
        if (!match) {
          socket.emit('match:error', { message: 'Token expired or invalid' })
          return
        }
        await handleJoin(io, socket, match.id, userId)
        return
      }

      await handleJoin(io, socket, matchId, userId)
    })

    // ── round:answer ───────────────────────────────────────────────────────
    socket.on(
      'round:answer',
      async (payload: { matchId: string; roundIndex: number; answer: string }) => {
        const { matchId, roundIndex, answer } = payload ?? {}
        const meta = socketMeta.get(socket.id)
        if (!meta || meta.matchId !== matchId) return

        await withMatchLock(matchId, async () => {
          const state = await loadState(matchId)
          if (!state || state.status !== 'active' || state.mode !== 'trivia') return
          if (roundIndex !== state.currentRound) return

          const { userId } = meta

          if (!state.answers[roundIndex]) state.answers[roundIndex] = {}
          if (state.answers[roundIndex][userId]) return

          state.answers[roundIndex][userId] = answer
          await saveState(state)

          const question = state.questions[roundIndex]
          const bothAnswered =
            state.answers[roundIndex][state.hostId] !== undefined &&
            state.answers[roundIndex][state.invitedId] !== undefined

          if (!bothAnswered) return

          const hostAnswer = state.answers[roundIndex][state.hostId]
          const invitedAnswer = state.answers[roundIndex][state.invitedId]
          if (hostAnswer === question.correctAnswer) state.hostScore++
          if (invitedAnswer === question.correctAnswer) state.invitedScore++

          io.to(roomId(matchId)).emit('round:result', {
            roundIndex,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            hostScore: state.hostScore,
            invitedScore: state.invitedScore,
          })

          state.currentRound++

          if (state.currentRound >= state.questions.length) {
            state.status = 'completed'
            await saveState(state)
            await finalizeMatch(state)
            await invalidateLeaderboardCache()

            const winnerId =
              state.hostScore >= state.invitedScore ? state.hostId : state.invitedId
            io.to(roomId(matchId)).emit('match:end', {
              winnerId,
              hostScore: state.hostScore,
              invitedScore: state.invitedScore,
            })
          } else {
            await saveState(state)
            const next = state.questions[state.currentRound]
            io.to(roomId(matchId)).emit('round:question', {
              roundIndex: state.currentRound,
              question: {
                id: next.id,
                text: next.text,
                imageUrl: next.imageUrl ?? null,
                lane: next.lane,
                options: next.options,
              },
            })
          }
        })
      },
    )

    // ── gtr:vote — GTR duel mode: fired after each player submits their rank vote ──
    socket.on(
      'gtr:vote',
      async (payload: { matchId: string; pointsEarned: number }) => {
        const { matchId, pointsEarned } = payload ?? {}
        const meta = socketMeta.get(socket.id)
        if (!meta || meta.matchId !== matchId) return

        await withMatchLock(matchId, async () => {
          const match = await prisma.match.findUnique({ where: { id: matchId } })
          if (!match || match.mode !== 'gtr' || !match.invitedId) return

          // Skip if already finalized
          if (match.status === 'completed') return

          if (!gtrVotes.has(matchId)) gtrVotes.set(matchId, new Map())
          const votes = gtrVotes.get(matchId)!

          // Record score once per player
          if (!votes.has(meta.userId)) {
            votes.set(meta.userId, pointsEarned)
          }

          const resolveMatch = async (hScore: number, iScore: number) => {
            if (gtrVoteTimeouts.has(matchId)) {
              clearTimeout(gtrVoteTimeouts.get(matchId)!)
              gtrVoteTimeouts.delete(matchId)
            }
            gtrVotes.delete(matchId)

            await finalizeGTRMatch(matchId, match.hostId, match.invitedId!, hScore, iScore)
            await invalidateLeaderboardCache()

            const winnerId = hScore >= iScore ? match.hostId : match.invitedId!
            io.to(roomId(matchId)).emit('match:end', { winnerId, hostScore: hScore, invitedScore: iScore })
          }

          // Both players voted — resolve immediately
          if (votes.has(match.hostId) && votes.has(match.invitedId)) {
            await resolveMatch(votes.get(match.hostId)!, votes.get(match.invitedId)!)
            return
          }

          // First vote arrived — start fallback timeout for missing player (15s)
          if (!gtrVoteTimeouts.has(matchId)) {
            gtrVoteTimeouts.set(matchId, setTimeout(() => {
              void withMatchLock(matchId, async () => {
                const currentVotes = gtrVotes.get(matchId)
                if (!currentVotes) return // already resolved
                const hScore = currentVotes.get(match.hostId) ?? 0
                const iScore = currentVotes.get(match.invitedId!) ?? 0
                await resolveMatch(hScore, iScore)
              })
            }, 15_000))
          }
        })
      },
    )

    // ── match:rematch ──────────────────────────────────────────────────────
    socket.on('match:rematch', async (payload: { matchId: string }) => {
      const { matchId } = payload ?? {}
      const meta = socketMeta.get(socket.id)
      if (!meta || meta.matchId !== matchId) return

      const oldMatch = await prisma.match.findUnique({ where: { id: matchId } })
      if (!oldMatch || oldMatch.status !== 'completed') return
      if (oldMatch.hostId !== meta.userId) {
        socket.emit('match:error', { message: 'Only the host can request a rematch' })
        return
      }

      const { v4: uuidv4 } = await import('uuid')
      const { default: redis } = await import('../lib/redis.js')
      const { tokenKey } = await import('../services/matchService.js')

      const newToken = uuidv4()
      const newMatch = await prisma.match.create({
        data: { hostId: oldMatch.hostId, inviteToken: newToken, mode: oldMatch.mode },
      })
      await redis.setex(tokenKey(newToken), 600, newMatch.id)

      io.to(roomId(matchId)).emit('match:rematch', {
        matchId: newMatch.id,
        inviteToken: newToken,
      })
    })

    // ── disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const meta = socketMeta.get(socket.id)
      const userId = matchSocketToUser.get(socket.id)
      if (meta) {
        // Only remove user from matchUsers if no other socket for the same user+match is active
        if (userId) {
          const hasOtherSocket = [...socketMeta.entries()].some(
            ([sid, m]) => sid !== socket.id && m.matchId === meta.matchId && m.userId === userId,
          )
          if (!hasOtherSocket) {
            matchUsers.get(meta.matchId)?.delete(userId)
            if ((matchUsers.get(meta.matchId)?.size ?? 0) === 0) {
              matchUsers.delete(meta.matchId)
              // Both players disconnected — cancel any pending GTR vote timeout
              if (gtrVoteTimeouts.has(meta.matchId)) {
                clearTimeout(gtrVoteTimeouts.get(meta.matchId)!)
                gtrVoteTimeouts.delete(meta.matchId)
              }
              gtrVotes.delete(meta.matchId)
            }
          }
          matchSocketToUser.delete(socket.id)
        }
        socketMeta.delete(socket.id)
      }
    })
  })
}

// ── Shared join logic ─────────────────────────────────────────────────────────

async function handleJoin(io: Server, socket: Socket, matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) {
    socket.emit('match:error', { message: 'Match not found' })
    return
  }

  const isParticipant = match.hostId === userId || match.invitedId === userId
  if (!isParticipant) {
    socket.emit('match:error', { message: 'You are not a participant in this match' })
    return
  }

  socket.join(roomId(matchId))
  socketMeta.set(socket.id, { userId, matchId })
  matchSocketToUser.set(socket.id, userId)

  if (!matchUsers.has(matchId)) matchUsers.set(matchId, new Set())
  matchUsers.get(matchId)!.add(userId)

  const connectedUsers = matchUsers.get(matchId)!.size

  if (connectedUsers === 1) {
    socket.emit('match:waiting', { matchId })
    return
  }

  // Both unique users connected — check if resuming a game already in progress
  const state = await loadState(matchId)

  if (state && state.status === 'active' && state.currentRound > 0) {
    // Mid-game reconnect — restore state without restarting
    const current = state.questions[state.currentRound]
    io.to(roomId(matchId)).emit('match:resume', {
      matchId,
      currentRound: state.currentRound,
      hostScore: state.hostScore,
      invitedScore: state.invitedScore,
      question: { id: current.id, text: current.text, imageUrl: current.imageUrl ?? null, lane: current.lane, options: current.options },
    })
    return
  }

  // Fresh start — init state if not already present
  let freshState = state
  if (!freshState) {
    if (!match.invitedId) {
      socket.emit('match:error', { message: 'Waiting for opponent to join via invite link' })
      return
    }
    freshState = await initMatchState(matchId, match.hostId, match.invitedId, match.mode)
  }

  const safeQuestions = freshState.questions.map((q) => ({
    id: q.id,
    text: q.text,
    imageUrl: q.imageUrl ?? null,
    lane: q.lane,
    options: q.options,
  }))

  io.to(roomId(matchId)).emit('match:start', {
    matchId,
    questions: safeQuestions,
    gtrRoundIds: freshState.gtrRoundIds ?? [],
  })

  // Only push round:question for trivia mode (GTR players fetch rounds via REST)
  if (match.mode === 'trivia' && freshState.questions.length > 0) {
    const current = freshState.questions[freshState.currentRound]
    io.to(roomId(matchId)).emit('round:question', {
      roundIndex: freshState.currentRound,
      question: { id: current.id, text: current.text, imageUrl: current.imageUrl ?? null, lane: current.lane, options: current.options },
    })
  }
}
