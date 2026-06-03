import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard'
import { createMatch, joinMatch } from '../services/matchService'

interface JoinParams {
  token: string
}

export async function matchRoutes(app: FastifyInstance) {
  app.post(
    '/matches/create',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const result = await createMatch(request.user.userId)
        return reply.status(201).send(result)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )

  app.get<{ Params: JoinParams }>(
    '/matches/join/:token',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const result = await joinMatch(request.params.token, request.user.userId)
        return reply.send(result)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )
}
