const RANKS = [
  'iron', 'bronze', 'silver', 'gold', 'platinum',
  'emerald', 'diamond', 'master', 'grandmaster', 'challenger',
]

export function tierFromPoints(points: number): string {
  if (points >= 4500) return 'challenger'
  if (points >= 4000) return 'grandmaster'
  if (points >= 3500) return 'master'
  if (points >= 3000) return 'diamond'
  if (points >= 2500) return 'emerald'
  if (points >= 2000) return 'platinum'
  if (points >= 1500) return 'gold'
  if (points >= 1000) return 'silver'
  if (points >= 500) return 'bronze'
  return 'iron'
}

export function rankDistance(a: string, b: string): number {
  return Math.abs(RANKS.indexOf(a) - RANKS.indexOf(b))
}
