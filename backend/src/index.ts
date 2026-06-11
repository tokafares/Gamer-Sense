import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma'
import redis from './lib/redis'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { questionRoutes } from './routes/questions'
import { championRoutes } from './routes/champions'
import { answerRoutes } from './routes/answers'
import { gtrRoutes } from './routes/gtr'
import { matchRoutes } from './routes/matches'
import { profileRoutes } from './routes/profile'
import { leaderboardRoutes } from './routes/leaderboard'
import { adminRoutes } from './routes/admin'
import { createSocketServer } from './sockets/index'

async function main() {
  const app = Fastify({ logger: true })

  app.setErrorHandler(errorHandler)

  // Allow POST routes to be called without a Content-Type header (empty body)
  app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_req, _body, done) => done(null, {}))

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env['FRONTEND_URL'],
    process.env['ADMIN_URL'],
  ].filter(Boolean) as string[]

  // Allow any *.up.railway.app / *.railway.app origin so renaming a service
  // (which changes its domain) never breaks the deployed frontend/admin.
  const isAllowedOrigin = (origin: string) =>
    allowedOrigins.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.(up\.)?railway\.app$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)

  await app.register(cors, {
    origin: (origin, cb) => {
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true)
      if (isAllowedOrigin(origin)) return cb(null, true)
      cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
  })

  await app.register(authRoutes)
  await app.register(questionRoutes)
  await app.register(championRoutes)
  await app.register(answerRoutes)
  await app.register(gtrRoutes)
  await app.register(matchRoutes)
  await app.register(profileRoutes)
  await app.register(leaderboardRoutes)
  await app.register(adminRoutes)

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  await redis.connect()
  await prisma.$connect()
  console.log('[Prisma] connected')

  const PORT = Number(process.env['PORT'] ?? 3000)

  // Fastify must be ready before we access its underlying Node http.Server
  await app.ready()
  createSocketServer(app.server)

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`[Server] listening on port ${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
