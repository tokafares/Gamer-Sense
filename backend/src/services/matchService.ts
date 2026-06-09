import { v4 as uuidv4 } from 'uuid'
import prisma from '../lib/prisma'
import redis from '../lib/redis'
import { getRandomRound } from './gtrService'

const TOKEN_TTL = 600 // 10 minutes
const STATE_TTL = 7200 // 2 hours
const TRIVIA_QUESTION_COUNT = 5
const GTR_ROUND_COUNT = 3

// ── Redis key helpers ─────────────────────────────────────────────────────────

export const tokenKey = (token: string) => `match:${token}`
export const stateKey = (matchId: string) => `match:state:${matchId}`

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MatchQuestion {
  id: string
  text: string
  imageUrl?: string | null
  lane: string
  options: unknown
  correctAnswer: string
  explanation: string
}

export interface MatchState {
  matchId: string
  hostId: string
  invitedId: string
  mode: string
  questions: MatchQuestion[]
  currentRound: number // 0-based index
  hostScore: number
  invitedScore: number
  // answers[roundIndex][userId] = selected answer
  answers: Record<number, Record<string, string>>
  status: 'waiting' | 'active' | 'completed'
  // GTR duel: pre-selected round IDs so both players see the same videos
  gtrRoundIds?: string[]
}

// ── REST handlers ─────────────────────────────────────────────────────────────

export async function createMatch(hostId: string, mode = 'trivia') {
  const inviteToken = uuidv4()

  const match = await prisma.match.create({
    data: { hostId, inviteToken, mode },
  })

  await redis.setex(tokenKey(inviteToken), TOKEN_TTL, match.id)

  return {
    matchId: match.id,
    inviteToken,
    inviteUrl: `${process.env['FRONTEND_URL'] ?? 'http://localhost:5173'}/match/join/${inviteToken}`,
  }
}

export async function joinMatch(token: string, invitedId: string) {
  const matchId = await redis.get(tokenKey(token))
  if (!matchId) {
    const err = new Error('Invite token is invalid or has expired') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) {
    const err = new Error('Match not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }
  if (match.status !== 'waiting') {
    const err = new Error('Match is already active or completed') as Error & { statusCode: number }
    err.statusCode = 409
    throw err
  }
  if (match.hostId === invitedId) {
    const err = new Error('Host cannot join their own match as guest') as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { invitedId, status: 'active' },
  })

  // Token is single-use — delete immediately after successful join
  await redis.del(tokenKey(token))

  return {
    matchId: updated.id,
    hostId: updated.hostId,
    invitedId: updated.invitedId,
    mode: updated.mode,
  }
}

// ── State helpers used by socket handler ─────────────────────────────────────

export async function loadState(matchId: string): Promise<MatchState | null> {
  const raw = await redis.get(stateKey(matchId))
  if (!raw) return null
  const state = JSON.parse(raw) as MatchState
  // Back-compat: old states without mode field default to trivia
  if (!state.mode) state.mode = 'trivia'
  return state
}

export async function saveState(state: MatchState): Promise<void> {
  await redis.setex(stateKey(state.matchId), STATE_TTL, JSON.stringify(state))
}

export async function initMatchState(
  matchId: string,
  hostId: string,
  invitedId: string,
  mode = 'trivia',
): Promise<MatchState> {
  let questions: MatchQuestion[] = []

  let gtrRoundIds: string[] | undefined

  if (mode === 'trivia') {
    // Pull random trivia questions for the match
    const rows = await prisma.question.findMany({
      where: { type: 'trivia' },
      take: TRIVIA_QUESTION_COUNT * 3,
      orderBy: { createdAt: 'asc' },
    })
    const shuffled = rows.sort(() => Math.random() - 0.5).slice(0, TRIVIA_QUESTION_COUNT)
    questions = shuffled.map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      lane: q.lane,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }))
  } else if (mode === 'gtr') {
    // Pre-select rounds so both players watch the same videos
    const rounds: string[] = []
    const seenIds = new Set<string>()
    for (let i = 0; i < GTR_ROUND_COUNT; i++) {
      // Up to 10 attempts to avoid duplicates
      for (let attempt = 0; attempt < 10; attempt++) {
        const r = await getRandomRound()
        if (!seenIds.has(r.id)) { seenIds.add(r.id); rounds.push(r.id); break }
      }
    }
    gtrRoundIds = rounds
  }

  const state: MatchState = {
    matchId,
    hostId,
    invitedId,
    mode,
    questions,
    currentRound: 0,
    hostScore: 0,
    invitedScore: 0,
    answers: {},
    status: 'active',
    gtrRoundIds,
  }

  await saveState(state)
  return state
}

export async function finalizeMatch(state: MatchState): Promise<void> {
  const winnerId = state.hostScore >= state.invitedScore ? state.hostId : state.invitedId

  await prisma.match.update({
    where: { id: state.matchId },
    data: { status: 'completed' },
  })
  await prisma.matchResult.create({
    data: {
      matchId: state.matchId,
      winnerId,
      hostScore: state.hostScore,
      invitedScore: state.invitedScore,
    },
  })

  // Award +200 pts to winner and update triviaPlayed for both players
  await prisma.userStats.upsert({
    where: { userId: winnerId },
    create: { userId: winnerId, points: 200, triviaPlayed: 1 },
    update: { points: { increment: 200 }, triviaPlayed: { increment: 1 } },
  })

  const loserId = winnerId === state.hostId ? state.invitedId : state.hostId
  await prisma.userStats.upsert({
    where: { userId: loserId },
    create: { userId: loserId, points: 0, triviaPlayed: 1 },
    update: { triviaPlayed: { increment: 1 } },
  })

  // Evict match state from Redis
  await redis.del(stateKey(state.matchId))
}

export async function finalizeGTRMatch(
  matchId: string,
  hostId: string,
  invitedId: string,
  hostScore: number,
  invitedScore: number,
): Promise<void> {
  const winnerId = hostScore >= invitedScore ? hostId : invitedId

  await prisma.match.update({
    where: { id: matchId },
    data: { status: 'completed' },
  })
  await prisma.matchResult.create({
    data: { matchId, winnerId, hostScore, invitedScore },
  })

  // Award winner bonus
  await prisma.userStats.upsert({
    where: { userId: winnerId },
    create: { userId: winnerId, points: 200, gtrCompleted: 1 },
    update: { points: { increment: 200 }, gtrCompleted: { increment: 1 } },
  })
  const loserId = winnerId === hostId ? invitedId : hostId
  await prisma.userStats.upsert({
    where: { userId: loserId },
    create: { userId: loserId, points: 0, gtrCompleted: 1 },
    update: { gtrCompleted: { increment: 1 } },
  })
}
