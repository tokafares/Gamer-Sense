import prisma from '../lib/prisma'
import redis from '../lib/redis'
import { tierFromPoints } from './answerService'

const CACHE_KEY = 'leaderboard:top10'
const CACHE_TTL = 60 // seconds

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  tier: string
}

export async function invalidateLeaderboardCache() {
  await redis.del(CACHE_KEY)
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const effectiveLimit = Math.min(limit, 50)

  // Always serve from cache when limit <= 10 (the cached set)
  if (effectiveLimit <= 10) {
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached) as LeaderboardEntry[]
    }
  }

  const rows = await prisma.userStats.findMany({
    where: { points: { gt: 0 } },
    orderBy: { points: 'desc' },
    take: effectiveLimit,
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  })

  const entries: LeaderboardEntry[] = rows.map((row, i) => ({
    rank: i + 1,
    userId: row.user.id,
    username: row.user.username,
    avatarUrl: row.user.avatarUrl,
    points: row.points,
    tier: tierFromPoints(row.points),
  }))

  // Cache only the top-10 result
  if (effectiveLimit <= 10) {
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(entries))
  }

  return entries
}
