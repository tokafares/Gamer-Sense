import prisma from '../lib/prisma'
import { tierFromPoints, rankDistance } from '../lib/tier'
import { invalidateLeaderboardCache } from './leaderboardService'

const ALL_RANKS = [
  'iron', 'bronze', 'silver', 'gold', 'platinum',
  'emerald', 'diamond', 'master', 'grandmaster', 'challenger',
]

export async function getRandomRound() {
  const count = await prisma.gTRRound.count()
  if (count === 0) {
    const err = new Error('No GTR rounds available') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }
  const skip = Math.floor(Math.random() * count)
  const rounds = await prisma.gTRRound.findMany({ take: 1, skip })
  return rounds[0]
}

export async function getRoundStats(roundId: string) {
  const round = await prisma.gTRRound.findUnique({
    where: { id: roundId },
    include: { votes: true },
  })
  if (!round) {
    const err = new Error('Round not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  const total = round.votes.length
  const breakdown: Record<string, number> = {}
  ALL_RANKS.forEach((r) => { breakdown[r] = 0 })
  round.votes.forEach((v) => {
    if (breakdown[v.votedRank] !== undefined) breakdown[v.votedRank]++
  })

  const percentages: Record<string, number> = {}
  ALL_RANKS.forEach((r) => {
    percentages[r] = total > 0 ? Math.round((breakdown[r] / total) * 100) : 0
  })

  return { roundId, correctRank: round.correctRank, totalVotes: total, percentages }
}

export interface SubmitVoteInput {
  userId: string
  roundId: string
  votedRank: string
}

export async function submitVote(input: SubmitVoteInput) {
  const round = await prisma.gTRRound.findUnique({ where: { id: input.roundId } })
  if (!round) {
    const err = new Error('Round not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  if (!ALL_RANKS.includes(input.votedRank)) {
    const err = new Error(`Invalid rank. Must be one of: ${ALL_RANKS.join(', ')}`) as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  try {
    await prisma.gTRVote.create({
      data: { roundId: input.roundId, userId: input.userId, votedRank: input.votedRank },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      const err = new Error('You have already voted on this round') as Error & { statusCode: number }
      err.statusCode = 409
      throw err
    }
    throw e
  }

  const dist = rankDistance(input.votedRank, round.correctRank)
  const correct = dist === 0
  const pointsEarned = dist === 0 ? 150 : dist === 1 ? 75 : 0

  const stats = await prisma.userStats.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId, points: pointsEarned, gtrCompleted: 1 },
    update: {
      gtrCompleted: { increment: 1 },
      ...(pointsEarned > 0 ? { points: { increment: pointsEarned } } : {}),
    },
  })

  if (pointsEarned > 0) {
    await invalidateLeaderboardCache()
  }

  return {
    correct,
    correctRank: round.correctRank,
    votedRank: input.votedRank,
    pointsEarned,
    totalPoints: stats.points,
    tier: tierFromPoints(stats.points),
  }
}
