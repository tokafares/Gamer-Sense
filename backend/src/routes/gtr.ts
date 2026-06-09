import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard'
import { getRandomRound, getRoundStats, submitVote } from '../services/gtrService'
import prisma from '../lib/prisma'

interface VoteBody {
  votedRank: string
}

interface RoundParams {
  roundId: string
}

export async function gtrRoutes(app: FastifyInstance) {
  app.get('/gtr/round', { preHandler: authGuard }, async (_request, reply) => {
    try {
      const round = await getRandomRound()
      return reply.send(round)
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  app.get<{ Params: RoundParams }>(
    '/gtr/round/:roundId',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const round = await prisma.gTRRound.findUnique({ where: { id: request.params.roundId } })
        if (!round) return reply.status(404).send({ error: 'Round not found' })
        return reply.send(round)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )

  app.get<{ Params: RoundParams }>(
    '/gtr/:roundId/stats',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const stats = await getRoundStats(request.params.roundId)
        return reply.send(stats)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )

  app.post<{ Params: RoundParams; Body: VoteBody }>(
    '/gtr/:roundId/vote',
    {
      preHandler: authGuard,
      schema: {
        body: {
          type: 'object',
          required: ['votedRank'],
          properties: {
            votedRank: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await submitVote({
          userId: request.user.userId,
          roundId: request.params.roundId,
          votedRank: request.body.votedRank,
        })
        return reply.send(result)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )
}
