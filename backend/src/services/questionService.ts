import prisma from '../lib/prisma'

export interface QuestionFilters {
  type?: string
  lane?: string
  limit?: number
}

export async function getQuestions(filters: QuestionFilters) {
  const { type, lane, limit = 10 } = filters
  return prisma.question.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(lane ? { lane } : {}),
    },
    take: Math.min(limit, 50),
    orderBy: { createdAt: 'asc' },
  })
}
