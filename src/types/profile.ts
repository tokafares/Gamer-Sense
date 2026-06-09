export interface UserProfile {
  id: string
  username: string
  avatarUrl: string | null
  level: number
  membershipTier: string
  totalPoints?: number
  tier?: string
  gtrCompleted?: number
  triviaPlayed?: number
  quizCompleted?: number
  laneRanks?: {
    top: string
    jungle: string
    mid: string
    adc: string
    support: string
  } | null
}
