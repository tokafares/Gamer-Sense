export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  tier: string
}
