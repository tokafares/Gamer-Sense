import { FastifyInstance } from 'fastify'
import * as authService from '../services/authService'

interface RegisterBody {
  username: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 32 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
  },
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>('/auth/register', { schema: registerSchema }, async (request, reply) => {
    const { username, email, password } = request.body
    try {
      const result = await authService.register(username, email, password)
      return reply.status(201).send(result)
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  app.post<{ Body: LoginBody }>('/auth/login', { schema: loginSchema }, async (request, reply) => {
    const { email, password } = request.body
    try {
      const result = await authService.login(email, password)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
