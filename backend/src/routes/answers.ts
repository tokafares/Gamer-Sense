import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard'
import { submitAnswer } from '../services/answerService'

interface SubmitBody {
  questionId: string
  selectedAnswer: string
}

export async function answerRoutes(app: FastifyInstance) {
  app.post<{ Body: SubmitBody }>(
    '/answers/submit',
    {
      preHandler: authGuard,
      schema: {
        body: {
          type: 'object',
          required: ['questionId', 'selectedAnswer'],
          properties: {
            questionId: { type: 'string' },
            selectedAnswer: { type: 'string', minLength: 1, maxLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await submitAnswer({
          userId: request.user.userId,
          questionId: request.body.questionId,
          selectedAnswer: request.body.selectedAnswer,
        })
        return reply.send(result)
      } catch (err: unknown) {
        const e = err as Error & { statusCode?: number }
        return reply.status(e.statusCode ?? 500).send({ error: e.message })
      }
    },
  )
}
