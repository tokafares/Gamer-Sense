// ── Experience / Level system ───────────────────────────────────────────────
// XP === the player's lifetime points (the same `points` they earn in games),
// so every correct answer / GTR guess / match win also advances their level.
//
// Curve:  XP required to *reach* level L  =  100 * (L - 1)^2
//         => level(points) = floor( sqrt(points / 100) ) + 1
//
// The cost to go from level L to L+1 is 100*(2L-1), i.e. it grows by 200 XP
// each level: 100, 300, 500, 700 … so early levels are quick and later ones
// take sustained play. The curve is open-ended (no level cap).

const XP_PER_LEVEL_BASE = 100

/** XP needed to have *reached* a given level (the level's lower boundary). */
export function levelFloorXp(level: number): number {
  if (level <= 1) return 0
  return XP_PER_LEVEL_BASE * (level - 1) ** 2
}

/** Current level for a given lifetime points/XP total. */
export function levelFromPoints(points: number): number {
  if (points <= 0) return 1
  return Math.floor(Math.sqrt(points / XP_PER_LEVEL_BASE)) + 1
}

export interface LevelProgress {
  level: number
  xp: number              // lifetime XP (== points)
  xpIntoLevel: number     // XP earned since the current level started
  xpForNextLevel: number  // total XP span of the current level
  xpToNextLevel: number   // XP still needed to hit the next level
}

/** Full level breakdown for progress bars. */
export function levelProgress(points: number): LevelProgress {
  const xp = Math.max(0, Math.floor(points))
  const level = levelFromPoints(xp)
  const currentFloor = levelFloorXp(level)
  const nextFloor = levelFloorXp(level + 1)
  return {
    level,
    xp,
    xpIntoLevel: xp - currentFloor,
    xpForNextLevel: nextFloor - currentFloor,
    xpToNextLevel: nextFloor - xp,
  }
}
