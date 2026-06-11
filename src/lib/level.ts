// Mirror of backend/src/lib/level.ts — XP === lifetime points.
//   level(points) = floor(sqrt(points / 100)) + 1
const XP_PER_LEVEL_BASE = 100

export function levelFromPoints(points: number): number {
  if (points <= 0) return 1
  return Math.floor(Math.sqrt(points / XP_PER_LEVEL_BASE)) + 1
}
