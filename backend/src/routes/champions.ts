import { FastifyInstance } from 'fastify'
import { getChampions } from '../services/championService'

interface ChampionQuery {
  lane?: string
}

const VALID_LANES = new Set(['top', 'jungle', 'mid', 'adc', 'support'])

export async function championRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ChampionQuery }>(
    '/champions',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            lane: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { lane } = request.query

      if (lane && !VALID_LANES.has(lane)) {
        return reply.status(400).send({ error: `Invalid lane. Must be one of: ${[...VALID_LANES].join(', ')}` })
      }

      const champions = await getChampions({ lane })
      return reply.send({ champions })
    },
  )
}
