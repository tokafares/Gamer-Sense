import { FastifyRequest, FastifyReply } from 'fastify'
import { authGuard } from './authGuard'

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  await authGuard(request, reply)
  if (reply.sent) return
  if (request.user.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden: admin only' })
  }
}
