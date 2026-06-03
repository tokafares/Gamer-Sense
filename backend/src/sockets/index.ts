import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { registerMatchHandler } from './matchHandler'

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: ['https://gamer-sense.vercel.app', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  registerMatchHandler(io)

  console.log('[Socket.io] server attached')
  return io
}
