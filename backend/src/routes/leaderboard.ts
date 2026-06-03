import { FastifyInstance } from 'fastify'
import { getLeaderboard } from '../services/leaderboardService'

interface LeaderboardQuery {
  limit?: string
}

export async function leaderboardRoutes(app: FastifyInstance) {
  app.get<{ Querystring: LeaderboardQuery }>(
    '/leaderboard',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const raw = request.query.limit
      const limit = raw ? parseInt(raw, 10) : 10

      if (isNaN(limit) || limit < 1) {
        return reply.status(400).send({ error: 'limit must be a positive integer' })
      }

      try {
        const entries = await getLeaderboard(limit)
        return reply.send({ leaderboard: entries })
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )
}
