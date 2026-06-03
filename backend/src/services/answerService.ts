import prisma from '../lib/prisma'
import { tierFromPoints } from '../lib/tier'
import { invalidateLeaderboardCache } from './leaderboardService'

export { tierFromPoints } from '../lib/tier'
export { rankDistance } from '../lib/tier'

// Upsert UserStats and return the updated row
async function upsertStats(userId: string, delta: Partial<{
  points: number
  quizCompleted: number
  triviaPlayed: number
  gtrCompleted: number
}>) {
  return prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      points: delta.points ?? 0,
      quizCompleted: delta.quizCompleted ?? 0,
      triviaPlayed: delta.triviaPlayed ?? 0,
      gtrCompleted: delta.gtrCompleted ?? 0,
    },
    update: {
      ...(delta.points !== undefined ? { points: { increment: delta.points } } : {}),
      ...(delta.quizCompleted ? { quizCompleted: { increment: delta.quizCompleted } } : {}),
      ...(delta.triviaPlayed ? { triviaPlayed: { increment: delta.triviaPlayed } } : {}),
      ...(delta.gtrCompleted ? { gtrCompleted: { increment: delta.gtrCompleted } } : {}),
    },
  })
}

export interface SubmitAnswerInput {
  userId: string
  questionId: string
  selectedAnswer: string
}

export async function submitAnswer(input: SubmitAnswerInput) {
  const question = await prisma.question.findUnique({ where: { id: input.questionId } })
  if (!question) {
    const err = new Error('Question not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  const correct = input.selectedAnswer === question.correctAnswer
  const pointsEarned = correct ? 100 : 10

  const statDelta =
    question.type === 'trivia'
      ? { triviaPlayed: 1, points: pointsEarned }
      : { quizCompleted: 1, points: pointsEarned }

  const stats = await upsertStats(input.userId, statDelta)
  const tier = tierFromPoints(stats.points)

  await invalidateLeaderboardCache()

  return {
    correct,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    pointsEarned,
    totalPoints: stats.points,
    tier,
  }
}
