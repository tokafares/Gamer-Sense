import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard'
import { getProfile, updateProfile } from '../services/profileService'

interface ProfileParams {
  userId: string
}

interface UpdateBody {
  username?: string
  avatarUrl?: string
}

export async function profileRoutes(app: FastifyInstance) {
  app.get<{ Params: ProfileParams }>(
    '/profile/:userId',
    { preHandler: authGuard },
    async (request, reply) => {
      try {
        const profile = await getProfile(request.params.userId)
        return reply.send(profile)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )

  app.put<{ Params: ProfileParams; Body: UpdateBody }>(
    '/profile/:userId',
    {
      preHandler: authGuard,
      schema: {
        body: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 32 },
            avatarUrl: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
    async (request, reply) => {
      // Users may only update their own profile
      if (request.user.userId !== request.params.userId) {
        return reply.status(403).send({ error: 'Forbidden' })
      }

      try {
        const updated = await updateProfile(request.params.userId, request.body)
        return reply.send(updated)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )
}
