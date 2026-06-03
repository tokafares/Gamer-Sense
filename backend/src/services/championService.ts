import prisma from '../lib/prisma'

export interface ChampionFilters {
  lane?: string
}

export async function getChampions(filters: ChampionFilters) {
  return prisma.champion.findMany({
    where: filters.lane ? { lane: filters.lane } : {},
    orderBy: { name: 'asc' },
  })
}
