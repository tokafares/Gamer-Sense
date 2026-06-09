import { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
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
interface PasswordBody { password: string }

interface GTRRoundBody {
  imageUrl: string
  correctRank: string
}

interface GTRRoundParams { id: string }
interface GTRRoundUpdateBody {
  imageUrl?: string | null
  correctRank?: string
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
            hint: { type: ['string', 'null'] },
            imageUrl: { type: ['string', 'null'] },
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('Record to update not found') || msg.includes('P2025')) {
          return reply.status(404).send({ error: 'Question not found' })
        }
        return reply.status(500).send({ error: msg || 'Failed to update question' })
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

  app.put<{ Params: GTRRoundParams; Body: GTRRoundUpdateBody }>(
    '/admin/gtr/rounds/:id',
    {
      preHandler: adminGuard,
      schema: {
        body: {
          type: 'object',
          properties: {
            imageUrl: { type: ['string', 'null'] },
            correctRank: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const round = await prisma.gTRRound.update({
          where: { id: request.params.id },
          data: {
            ...(request.body.imageUrl !== undefined ? { imageUrl: request.body.imageUrl ?? '' } : {}),
            ...(request.body.correctRank !== undefined ? { correctRank: request.body.correctRank } : {}),
          },
        })
        return reply.send(round)
      } catch {
        return reply.status(404).send({ error: 'Round not found' })
      }
    },
  )

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

  app.put<{ Params: UserParams; Body: PasswordBody }>(
    '/admin/users/:id/password',
    {
      preHandler: adminGuard,
      schema: {
        body: {
          type: 'object',
          required: ['password'],
          properties: { password: { type: 'string', minLength: 8 } },
        },
      },
    },
    async (request, reply) => {
      try {
        const passwordHash = await bcrypt.hash(request.body.password, 12)
        const user = await prisma.user.update({
          where: { id: request.params.id },
          data: { passwordHash },
          select: { id: true, username: true, email: true },
        })
        return reply.send({ ...user, message: 'Password updated' })
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
