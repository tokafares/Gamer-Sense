import prisma from '../lib/prisma'
import { tierFromPoints } from '../lib/tier'
import { levelProgress } from '../lib/level'

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { stats: true },
  })

  if (!user) {
    const err = new Error('User not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  const stats = user.stats
  const prog = levelProgress(stats?.points ?? 0)

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    level: prog.level,
    xp: prog.xp,
    xpIntoLevel: prog.xpIntoLevel,
    xpForNextLevel: prog.xpForNextLevel,
    xpToNextLevel: prog.xpToNextLevel,
    membershipTier: user.membershipTier,
    createdAt: user.createdAt,
    totalPoints: stats?.points ?? 0,
    tier: stats ? tierFromPoints(stats.points) : 'iron',
    gtrCompleted: stats?.gtrCompleted ?? 0,
    triviaPlayed: stats?.triviaPlayed ?? 0,
    quizCompleted: stats?.quizCompleted ?? 0,
    laneRanks: stats
      ? {
          top: stats.topLaneRank,
          jungle: stats.jungleRank,
          mid: stats.midLaneRank,
          adc: stats.adcRank,
          support: stats.supportRank,
        }
      : null,
  }
}

export interface UpdateProfileInput {
  username?: string
  avatarUrl?: string
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (!input.username && input.avatarUrl === undefined) {
    const err = new Error('Nothing to update') as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  if (input.username) {
    const conflict = await prisma.user.findFirst({
      where: { username: input.username, NOT: { id: userId } },
    })
    if (conflict) {
      const err = new Error('username already taken') as Error & { statusCode: number }
      err.statusCode = 409
      throw err
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.username ? { username: input.username } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  })

  return {
    id: updated.id,
    username: updated.username,
    avatarUrl: updated.avatarUrl,
    level: updated.level,
    membershipTier: updated.membershipTier,
  }
}
