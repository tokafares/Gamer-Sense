import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard'
import { getQuestions } from '../services/questionService'

interface QuestionQuery {
  type?: string
  lane?: string
  limit?: string
}

const VALID_TYPES = new Set(['scenario', 'blitz', 'trivia'])
const VALID_LANES = new Set(['top', 'jungle', 'mid', 'adc', 'support'])

export async function questionRoutes(app: FastifyInstance) {
  app.get<{ Querystring: QuestionQuery }>(
    '/questions',
    {
      preHandler: authGuard,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            lane: { type: 'string' },
            limit: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { type, lane, limit } = request.query

      if (type && !VALID_TYPES.has(type)) {
        return reply.status(400).send({ error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(', ')}` })
      }
      if (lane && !VALID_LANES.has(lane)) {
        return reply.status(400).send({ error: `Invalid lane. Must be one of: ${[...VALID_LANES].join(', ')}` })
      }

      const parsedLimit = limit ? parseInt(limit, 10) : 10
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return reply.status(400).send({ error: 'limit must be a positive integer' })
      }

      const questions = await getQuestions({ type, lane, limit: parsedLimit })
      return reply.send({ questions })
    },
  )
}
