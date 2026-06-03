import { create } from 'zustand'

export interface AnswerRecord {
  round: number
  selectedId: string
  correctId: string
  isCorrect: boolean
  pointsEarned: number
}

export interface GTRResultData {
  roundId: string
  votedRank: string
  correctRank: string
  totalVotes: number
  percentages: Record<string, number>
}

interface GameState {
  currentRound: number
  totalRounds: number
  points: number
  answers: AnswerRecord[]
  opponentScore: number
  gtrResult: GTRResultData | null
}

interface GameActions {
  submitAnswer: (answer: AnswerRecord) => void
  addPoints: (pts: number) => void
  setGTRResult: (data: GTRResultData) => void
  resetGame: () => void
}

export const useGameStore = create<GameState & GameActions>()((set) => ({
  currentRound: 1,
  totalRounds: 3,
  points: 0,
  answers: [],
  opponentScore: 0,
  gtrResult: null,

  submitAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentRound:
        state.currentRound < state.totalRounds
          ? state.currentRound + 1
          : state.currentRound,
    })),

  addPoints: (pts) =>
    set((state) => ({ points: state.points + pts })),

  setGTRResult: (data) => set({ gtrResult: data }),

  resetGame: () =>
    set({ currentRound: 1, points: 0, answers: [], opponentScore: 0, gtrResult: null }),
}))
