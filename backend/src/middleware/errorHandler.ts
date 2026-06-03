import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = error.statusCode ?? 500
  const message = statusCode === 500 ? 'Internal server error' : error.message
  if (statusCode === 500) console.error('[Error]', error)
  reply.status(statusCode).send({ error: message })
}
