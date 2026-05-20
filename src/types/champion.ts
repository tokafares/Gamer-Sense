export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

export interface ChampionStats {
  damage: number
  burstPotential: number
  durability: number
  crowdControl: number
  mobility: number
  rangeControl: number
}

export interface Champion {
  id: string
  key: string
  name: string
  title: string
  role: Role
  tags: string[]
  difficulty: number
  description: string
  strengths: string[]
  weaknesses: string[]
  gameSenseTip: string
  color: string
  splashUrl: string
  portraitUrl: string
  stats: ChampionStats
}

export interface ChampionsData {
  version: string
  lastUpdated: string
  totalChampions: number
  champions: Champion[]
}
