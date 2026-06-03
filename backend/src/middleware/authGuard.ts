import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/index'

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET not configured')

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    request.user = payload
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
