// In-browser stand-in for the REST API, used only when VITE_DEMO_MODE=true.
//
// It mirrors the backend's response shapes and rules (backend/src/services/*):
//   - answers: +100 correct / +10 wrong, counted as quiz or trivia
//   - Guess the Rank: +150 exact, +75 one rank away, 0 otherwise
//   - tiers and XP levels use the same formulas as backend/src/lib/{tier,level}.ts
// Progress is kept per browser in localStorage, so points, levels, the profile and
// the leaderboard all move as the guest plays.

import DefaultAvatar from '../../assets/image 21.webp'
import { GTR_ROUNDS, QUESTIONS } from './seedData'

export const DEMO_TOKEN = 'demo-token'

export const GUEST_USER = {
  id: 'demo-guest',
  username: 'Guest Summoner',
  email: 'guest@demo.gamersense',
  // Same default image Page10 shows for accounts without an avatar.
  avatarUrl: DefaultAvatar,
  level: 1,
  membershipTier: 'free' as const,
  role: 'user',
}

const STATE_KEY = 'gs_demo_state'
const NETWORK_DELAY_MS = 180

const RANKS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger']
const LANES = ['top', 'jungle', 'mid', 'adc', 'support']

// ── Rules mirrored from the backend ──────────────────────────────────────────

function tierFromPoints(points: number): string {
  if (points >= 4500) return 'challenger'
  if (points >= 4000) return 'grandmaster'
  if (points >= 3500) return 'master'
  if (points >= 3000) return 'diamond'
  if (points >= 2500) return 'emerald'
  if (points >= 2000) return 'platinum'
  if (points >= 1500) return 'gold'
  if (points >= 1000) return 'silver'
  if (points >= 500) return 'bronze'
  return 'iron'
}

const XP_PER_LEVEL_BASE = 100
const levelFloorXp = (level: number) => (level <= 1 ? 0 : XP_PER_LEVEL_BASE * (level - 1) ** 2)
const levelFromPoints = (points: number) => (points <= 0 ? 1 : Math.floor(Math.sqrt(points / XP_PER_LEVEL_BASE)) + 1)

function levelProgress(points: number) {
  const xp = Math.max(0, Math.floor(points))
  const level = levelFromPoints(xp)
  const floor = levelFloorXp(level)
  const next = levelFloorXp(level + 1)
  return { level, xp, xpIntoLevel: xp - floor, xpForNextLevel: next - floor, xpToNextLevel: next - xp }
}

const rankDistance = (a: string, b: string) => Math.abs(RANKS.indexOf(a) - RANKS.indexOf(b))

// ── Guest progress (localStorage) ───────────────────────────────────────────

interface DemoState {
  points: number
  quizCompleted: number
  triviaPlayed: number
  gtrCompleted: number
  /** roundId → rank the guest voted, folded into the round's vote breakdown. */
  votes: Record<string, string>
  /** Shuffled Guess the Rank round ids still to be dealt, so a game doesn't repeat a clip. */
  gtrBag: string[]
  /** Set from the profile editor. */
  username?: string
  avatarUrl?: string
}

const EMPTY_STATE: DemoState = { points: 0, quizCompleted: 0, triviaPlayed: 0, gtrCompleted: 0, votes: {}, gtrBag: [] }

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    return raw ? { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<DemoState>) } : { ...EMPTY_STATE }
  } catch {
    return { ...EMPTY_STATE }
  }
}

function saveState(state: DemoState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable: progress just isn't kept between visits.
  }
}

// ── Static demo data ────────────────────────────────────────────────────────

const ROUNDS = GTR_ROUNDS.map((r, i) => ({ id: `demo-gtr-${i + 1}`, ...r }))

/** Fictional players so the leaderboard isn't empty. Clearly demo data. */
const DEMO_PLAYERS: [string, number][] = [
  ['RiftWalker', 4620],
  ['BaronBait', 3810],
  ['WardPlacer', 3140],
  ['FlashOnD', 2470],
  ['MacroMind', 1890],
  ['JungleDiff', 1320],
  ['MinionMuncher', 760],
  ['TowerHugger', 340],
]

/**
 * A believable vote spread for a round: most votes near the real rank, tapering off.
 * Deterministic per round, plus the guest's own vote.
 */
function roundStats(round: (typeof ROUNDS)[number], guestVote: string | undefined) {
  const center = RANKS.indexOf(round.correctRank)
  const counts = RANKS.map((_, i) => Math.round(40 / (1 + Math.abs(i - center) ** 1.6)))
  if (guestVote) counts[RANKS.indexOf(guestVote)] = (counts[RANKS.indexOf(guestVote)] ?? 0) + 1
  const total = counts.reduce((a, b) => a + b, 0)
  const percentages: Record<string, number> = {}
  RANKS.forEach((rank, i) => { percentages[rank] = Math.round(((counts[i] ?? 0) / total) * 100) })
  return { roundId: round.id, correctRank: round.correctRank, totalVotes: total, percentages }
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

// ── Request handling ────────────────────────────────────────────────────────

export class DemoHttpError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(status: number, body: unknown) {
    super(`Demo API ${status}`)
    this.status = status
    this.body = body
  }
}

const notFound = (path: string) => new DemoHttpError(404, { error: `Not available in the demo: ${path}` })

function handle(method: string, path: string, body: unknown): unknown {
  const url = new URL(path, 'https://demo.local')
  const p = url.pathname
  const q = url.searchParams
  const input = (body ?? {}) as Record<string, unknown>

  // Auth: any credentials sign in as the guest.
  if (method === 'POST' && (p === '/auth/login' || p === '/auth/register')) {
    const state = loadState()
    return {
      token: DEMO_TOKEN,
      user: {
        ...GUEST_USER,
        username: state.username ?? GUEST_USER.username,
        avatarUrl: state.avatarUrl ?? GUEST_USER.avatarUrl,
        level: levelFromPoints(state.points),
      },
    }
  }

  if (method === 'GET' && p === '/questions') {
    const type = q.get('type')
    const lane = q.get('lane')
    if (lane && !LANES.includes(lane)) throw new DemoHttpError(400, { error: 'Invalid lane' })
    const limit = Math.min(Number(q.get('limit') ?? 10) || 10, 50)
    const questions = QUESTIONS.filter((x) => (!type || x.type === type) && (!lane || x.lane === lane))
      .slice(0, limit)
      .map((x) => ({ ...x, imageUrl: null, hint: x.hint ?? null }))
    return { questions }
  }

  // No scenario videos exist on the backend either; callers fall back to images.
  if (method === 'GET' && p === '/videos') return { videos: [] }

  if (method === 'POST' && p === '/answers/submit') {
    const question = QUESTIONS.find((x) => x.id === input.questionId)
    if (!question) throw new DemoHttpError(404, { error: 'Question not found' })
    const correct = input.selectedAnswer === question.correctAnswer
    const pointsEarned = correct ? 100 : 10
    const state = loadState()
    state.points += pointsEarned
    if (question.type === 'trivia') state.triviaPlayed += 1
    else state.quizCompleted += 1
    saveState(state)
    return {
      correct,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      pointsEarned,
      totalPoints: state.points,
      tier: tierFromPoints(state.points),
    }
  }

  if (method === 'GET' && p === '/gtr/round') {
    const state = loadState()
    if (state.gtrBag.length === 0) state.gtrBag = shuffle(ROUNDS.map((r) => r.id))
    const id = state.gtrBag.shift()
    saveState(state)
    const round = ROUNDS.find((r) => r.id === id) ?? ROUNDS[0]
    if (!round) throw new DemoHttpError(404, { error: 'No GTR rounds available' })
    return round
  }

  const roundMatch = p.match(/^\/gtr\/(?:round\/)?([^/]+)(?:\/(vote|stats))?$/)
  if (roundMatch) {
    const [, id, action] = roundMatch
    const round = ROUNDS.find((r) => r.id === id)
    if (!round) throw new DemoHttpError(404, { error: 'Round not found' })

    if (method === 'GET' && !action && p.startsWith('/gtr/round/')) return round
    if (method === 'GET' && action === 'stats') return roundStats(round, loadState().votes[round.id])

    if (method === 'POST' && action === 'vote') {
      const votedRank = String(input.votedRank ?? '')
      if (!RANKS.includes(votedRank)) throw new DemoHttpError(400, { error: 'Invalid rank' })
      const dist = rankDistance(votedRank, round.correctRank)
      const pointsEarned = dist === 0 ? 150 : dist === 1 ? 75 : 0
      const state = loadState()
      // Unlike production, the demo lets a guest replay a clip, so repeat votes are allowed.
      state.votes[round.id] = votedRank
      state.gtrCompleted += 1
      state.points += pointsEarned
      saveState(state)
      return {
        correct: dist === 0,
        correctRank: round.correctRank,
        votedRank,
        pointsEarned,
        totalPoints: state.points,
        tier: tierFromPoints(state.points),
      }
    }
  }

  if (method === 'GET' && p === '/leaderboard') {
    const state = loadState()
    const rows = DEMO_PLAYERS.map(([username, points]) => ({ userId: `demo-${username}`, username, avatarUrl: null, points }))
    if (state.points > 0) rows.push({ userId: GUEST_USER.id, username: state.username ?? GUEST_USER.username, avatarUrl: null, points: state.points })
    const leaderboard = rows
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((row, i) => ({ rank: i + 1, ...row, tier: tierFromPoints(row.points) }))
    return { leaderboard }
  }

  if (method === 'PUT' && p.startsWith('/profile/')) {
    const state = loadState()
    const username = String(input.username ?? '').trim()
    if (username.length < 3 || username.length > 32) throw new DemoHttpError(400, { error: 'username must be 3-32 characters' })
    state.username = username
    if (typeof input.avatarUrl === 'string') state.avatarUrl = input.avatarUrl
    saveState(state)
    return { id: GUEST_USER.id, username, avatarUrl: state.avatarUrl ?? GUEST_USER.avatarUrl }
  }

  if (method === 'GET' && p.startsWith('/profile/')) {
    const state = loadState()
    const tier = tierFromPoints(state.points)
    return {
      id: GUEST_USER.id,
      username: state.username ?? GUEST_USER.username,
      email: GUEST_USER.email,
      avatarUrl: state.avatarUrl ?? null,
      ...levelProgress(state.points),
      membershipTier: GUEST_USER.membershipTier,
      createdAt: new Date().toISOString(),
      totalPoints: state.points,
      tier,
      gtrCompleted: state.gtrCompleted,
      triviaPlayed: state.triviaPlayed,
      quizCompleted: state.quizCompleted,
      // Lane ranks are only updated by the server's ranked logic; the guest starts at the overall tier.
      laneRanks: { top: tier, jungle: tier, mid: tier, adc: tier, support: tier },
    }
  }

  // Matches, admin and anything else need the real server.
  throw notFound(p)
}

/** Answers an API call in the browser after a short, realistic delay. */
export function demoRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(handle(method, path, body) as T)
      } catch (err) {
        reject(err)
      }
    }, NETWORK_DELAY_MS)
  })
}

export function resetDemoProgress(): void {
  try {
    localStorage.removeItem(STATE_KEY)
  } catch {
    // ignore
  }
}
