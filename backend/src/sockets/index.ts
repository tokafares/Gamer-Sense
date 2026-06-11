import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { registerMatchHandler } from './matchHandler'

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      // Allow localhost, the configured frontend, and any Railway/Vercel domain
      // so renaming a service never breaks the live duels (sockets).
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        const ok =
          origin === 'http://localhost:5173' ||
          origin === 'http://localhost:4173' ||
          origin === process.env['FRONTEND_URL'] ||
          /^https:\/\/[a-z0-9-]+\.(up\.)?railway\.app$/i.test(origin) ||
          /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
        cb(ok ? null : new Error('Not allowed by CORS'), ok)
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  registerMatchHandler(io)

  console.log('[Socket.io] server attached')
  return io
}
