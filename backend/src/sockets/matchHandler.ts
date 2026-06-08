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

// matchId → Set<socketId>
const matchSockets = new Map<string, Set<string>>()

// Per-match async mutex — serialises concurrent round:answer writes to prevent lost-update
const matchLocks = new Map<string, Promise<void>>()

// GTR duel vote tracking — matchId → { userId → pointsEarned }
const gtrVotes = new Map<string, Map<string, number>>()

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

          if (!gtrVotes.has(matchId)) gtrVotes.set(matchId, new Map())
          const votes = gtrVotes.get(matchId)!

          // Record score once per player
          if (!votes.has(meta.userId)) {
            votes.set(meta.userId, pointsEarned)
          }

          // When both players have voted, resolve match
          if (votes.has(match.hostId) && votes.has(match.invitedId)) {
            const hostScore    = votes.get(match.hostId)!
            const invitedScore = votes.get(match.invitedId)!
            gtrVotes.delete(matchId)

            await finalizeGTRMatch(matchId, match.hostId, match.invitedId, hostScore, invitedScore)
            await invalidateLeaderboardCache()

            const winnerId = hostScore >= invitedScore ? match.hostId : match.invitedId
            io.to(roomId(matchId)).emit('match:end', {
              winnerId,
              hostScore,
              invitedScore,
            })
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
      if (meta) {
        const sockets = matchSockets.get(meta.matchId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) matchSockets.delete(meta.matchId)
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

  if (!matchSockets.has(matchId)) matchSockets.set(matchId, new Set())
  matchSockets.get(matchId)!.add(socket.id)

  const connected = matchSockets.get(matchId)!.size

  if (connected === 1) {
    socket.emit('match:waiting', { matchId })
    return
  }

  // Both players connected — start or resume
  let state = await loadState(matchId)

  if (!state) {
    if (!match.invitedId) {
      socket.emit('match:error', { message: 'Waiting for opponent to join via invite link' })
      return
    }
    state = await initMatchState(matchId, match.hostId, match.invitedId, match.mode)
  }

  const safeQuestions = state.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
  }))

  io.to(roomId(matchId)).emit('match:start', { matchId, questions: safeQuestions })

  // Only push round:question for trivia mode (GTR players fetch rounds via REST)
  if (match.mode === 'trivia' && state.questions.length > 0) {
    const current = state.questions[state.currentRound]
    io.to(roomId(matchId)).emit('round:question', {
      roundIndex: state.currentRound,
      question: { id: current.id, text: current.text, options: current.options },
    })
  }
}
