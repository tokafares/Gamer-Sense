import { create } from 'zustand'
import { levelFromPoints } from '../lib/level'

interface LevelUpState {
  level: number | null
  trigger: (newLevel: number) => void
  // Convenience: given the lifetime total after a reward and the amount just
  // earned, fire the popup only when a level boundary was crossed.
  checkLevelUp: (totalPoints: number, earned: number) => void
  clear: () => void
}

export const useLevelUpStore = create<LevelUpState>((set) => ({
  level: null,
  trigger: (newLevel) => set({ level: newLevel }),
  checkLevelUp: (totalPoints, earned) => {
    if (!totalPoints || earned <= 0) return
    const newLevel = levelFromPoints(totalPoints)
    const oldLevel = levelFromPoints(totalPoints - earned)
    if (newLevel > oldLevel) set({ level: newLevel })
  },
  clear: () => set({ level: null }),
}))
