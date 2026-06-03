import Redis from 'ioredis'

const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379'

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err: Error) => {
  console.error('[Redis] connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] connected')
})

export default redis
