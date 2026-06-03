export interface UserProfile {
  id: string
  username: string
  avatarUrl: string
  level: number
  membershipTier: string
  // stats — populated when backend includes UserStats in profile response
  gtrCompleted?: number
  triviaPlayed?: number
  quizCompleted?: number
  quizTotal?: number
}
