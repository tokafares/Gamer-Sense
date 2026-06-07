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
  imageUrl: string
  votedRank: string
  correctRank: string
  totalVotes: number
  percentages: Record<string, number>
}

export interface MatchQuestion {
  id: string
  text: string
  options: { id: string; text: string }[]
}

interface GameState {
  currentRound: number
  totalRounds: number
  points: number
  answers: AnswerRecord[]
  opponentScore: number
  gtrResult: GTRResultData | null
  // 1v1 match state
  matchId: string | null
  matchQuestions: MatchQuestion[]
}

interface GameActions {
  submitAnswer: (answer: AnswerRecord) => void
  addPoints: (pts: number) => void
  setGTRResult: (data: GTRResultData) => void
  setMatchStart: (matchId: string, questions: MatchQuestion[]) => void
  clearMatch: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState & GameActions>()((set) => ({
  currentRound: 1,
  totalRounds: 3,
  points: 0,
  answers: [],
  opponentScore: 0,
  gtrResult: null,
  matchId: null,
  matchQuestions: [],

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

  setMatchStart: (matchId, questions) =>
    set({ matchId, matchQuestions: questions, totalRounds: questions.length }),

  clearMatch: () =>
    set({ matchId: null, matchQuestions: [] }),

  resetGame: () =>
    set({
      currentRound: 1,
      points: 0,
      answers: [],
      opponentScore: 0,
      gtrResult: null,
      matchId: null,
      matchQuestions: [],
    }),
}))
