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
  imageUrl?: string | null
  lane: string
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
  isHost: boolean | undefined
  gtrRoundIds: string[]
  opponentUsername: string | null
}

interface GameActions {
  submitAnswer: (answer: AnswerRecord) => void
  addPoints: (pts: number) => void
  advanceRound: () => void
  setGTRResult: (data: GTRResultData) => void
  setMatchStart: (matchId: string, questions: MatchQuestion[], isHost?: boolean, gtrRoundIds?: string[]) => void
  setOpponentUsername: (name: string | null) => void
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
  isHost: undefined,
  gtrRoundIds: [],
  opponentUsername: null,

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

  // Solo GTR: bump to the next round (capped at totalRounds) when the
  // player clicks "Go to Next Round" on the per-round results page.
  advanceRound: () =>
    set((state) => ({
      currentRound: Math.min(state.currentRound + 1, state.totalRounds),
    })),

  setGTRResult: (data) => set({ gtrResult: data }),

  setMatchStart: (matchId, questions, isHost?, gtrRoundIds?) =>
    set({ matchId, matchQuestions: questions, totalRounds: questions.length || 3, isHost, gtrRoundIds: gtrRoundIds ?? [] }),

  setOpponentUsername: (name) => set({ opponentUsername: name }),

  clearMatch: () =>
    set({ matchId: null, matchQuestions: [], isHost: undefined, gtrRoundIds: [], opponentUsername: null }),

  resetGame: () =>
    set({
      currentRound: 1,
      totalRounds: 3,
      points: 0,
      answers: [],
      opponentScore: 0,
      gtrResult: null,
      matchId: null,
      matchQuestions: [],
      isHost: undefined,
      gtrRoundIds: [],
      opponentUsername: null,
    }),
}))
