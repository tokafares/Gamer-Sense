import { FastifyInstance } from 'fastify'
import { adminGuard } from '../middleware/adminGuard'
import prisma from '../lib/prisma'

interface QuestionBody {
  type: string
  lane: string
  text: string
  hint?: string
  imageUrl?: string
  options: { id: string; text: string }[]
  correctAnswer: string
  explanation: string
}

interface QuestionParams { id: string }
interface UserParams { id: string }
interface RoleBody { role: string }

interface GTRRoundBody {
  imageUrl: string
  correctRank: string
}

export async function adminRoutes(app: FastifyInstance) {
  // ── Questions ──────────────────────────────────────────────────────────────

  app.post<{ Body: QuestionBody }>(
    '/admin/questions',
    {
      preHandler: adminGuard,
      schema: {
        body: {
          type: 'object',
          required: ['type', 'lane', 'text', 'options', 'correctAnswer', 'explanation'],
          properties: {
            type: { type: 'string' },
            lane: { type: 'string' },
            text: { type: 'string' },
            hint: { type: 'string' },
            imageUrl: { type: 'string' },
            options: { type: 'array' },
            correctAnswer: { type: 'string' },
            explanation: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const question = await prisma.question.create({ data: request.body })
      return reply.status(201).send(question)
    },
  )

  app.put<{ Params: QuestionParams; Body: Partial<QuestionBody> }>(
    '/admin/questions/:id',
    { preHandler: adminGuard },
    async (request, reply) => {
      try {
        const question = await prisma.question.update({
          where: { id: request.params.id },
          data: request.body,
        })
        return reply.send(question)
      } catch {
        return reply.status(404).send({ error: 'Question not found' })
      }
    },
  )

  app.delete<{ Params: QuestionParams }>(
    '/admin/questions/:id',
    { preHandler: adminGuard },
    async (request, reply) => {
      try {
        await prisma.question.delete({ where: { id: request.params.id } })
        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ error: 'Question not found' })
      }
    },
  )

  // ── GTR Rounds ─────────────────────────────────────────────────────────────

  app.post<{ Body: GTRRoundBody }>(
    '/admin/gtr/rounds',
    {
      preHandler: adminGuard,
      schema: {
        body: {
          type: 'object',
          required: ['imageUrl', 'correctRank'],
          properties: {
            imageUrl: { type: 'string' },
            correctRank: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const round = await prisma.gTRRound.create({ data: request.body })
      return reply.status(201).send(round)
    },
  )

  app.get('/admin/gtr/rounds', { preHandler: adminGuard }, async (_request, reply) => {
    const rounds = await prisma.gTRRound.findMany({ orderBy: { createdAt: 'desc' } })
    return reply.send({ rounds })
  })

  // ── Users ──────────────────────────────────────────────────────────────────

  app.get('/admin/users', { preHandler: adminGuard }, async (_request, reply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        level: true,
        membershipTier: true,
        createdAt: true,
        stats: { select: { points: true, quizCompleted: true, triviaPlayed: true, gtrCompleted: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ users })
  })

  app.put<{ Params: UserParams; Body: RoleBody }>(
    '/admin/users/:id/role',
    {
      preHandler: adminGuard,
      schema: {
        body: {
          type: 'object',
          required: ['role'],
          properties: { role: { type: 'string', enum: ['user', 'admin'] } },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.update({
          where: { id: request.params.id },
          data: { role: request.body.role },
          select: { id: true, username: true, email: true, role: true },
        })
        return reply.send(user)
      } catch {
        return reply.status(404).send({ error: 'User not found' })
      }
    },
  )

  // ── All Questions (for admin list) ─────────────────────────────────────────

  app.get('/admin/questions', { preHandler: adminGuard }, async (_request, reply) => {
    const questions = await prisma.question.findMany({ orderBy: { createdAt: 'desc' } })
    return reply.send({ questions })
  })
}
