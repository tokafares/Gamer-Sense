import { io, Socket } from 'socket.io-client'
import { getToken } from './api'

let _socket: Socket | null = null

export function getSocket(): Socket {
  if (!_socket) {
    const url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'
    _socket = io(url, {
      auth: { token: getToken() },
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return _socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  // Refresh auth token in case it was set after socket was created
  if (!s.connected) {
    (s.auth as Record<string, string>).token = getToken() ?? ''
    s.connect()
  }
  return s
}

export function disconnectSocket(): void {
  if (_socket?.connected) _socket.disconnect()
}
