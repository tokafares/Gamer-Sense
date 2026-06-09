import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, ApiError } from '../lib/api'

export interface GTRRound {
  id: string
  imageUrl: string
  correctRank: string
}

export interface GTRStats {
  roundId: string
  correctRank: string
  totalVotes: number
  percentages: Record<string, number>
}

export interface VoteResult {
  correct: boolean
  correctRank: string
  votedRank: string
  pointsEarned: number
  totalPoints: number
  tier: string
}

// roundIndex (1-based) triggers a new fetch whenever it changes
export function useGTRRound(roundIndex: number) {
  const [round,   setRound]   = useState<GTRRound | null>(null)
  const [stats,   setStats]   = useState<GTRStats | null>(null)
  const [voted,   setVoted]   = useState(false)
  const [result,  setResult]  = useState<VoteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setRound(null)
    setStats(null)
    setVoted(false)
    setResult(null)
    setError(null)

    if (!import.meta.env.VITE_API_URL) { setLoading(false); return }

    let cancelled = false
    setLoading(true)

    apiGet<GTRRound>('/gtr/round')
      .then(data => { if (!cancelled) { setRound(data); setLoading(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `Server error (${err.status})` : 'Network error')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [roundIndex])

  const submitVote = useCallback(async (votedRank: string) => {
    if (!round || voted) return
    try {
      const res = await apiPost<VoteResult>(`/gtr/${round.id}/vote`, { votedRank })
      setResult(res)
      setVoted(true)
      const s = await apiGet<GTRStats>(`/gtr/${round.id}/stats`)
      setStats(s)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setVoted(true)
        setResult({
          correct: false,
          correctRank: round.correctRank,
          votedRank,
          pointsEarned: 0,
          totalPoints: 0,
          tier: '',
        })
        try {
          const s = await apiGet<GTRStats>(`/gtr/${round.id}/stats`)
          setStats(s)
        } catch { /* silent */ }
      } else {
        setError(err instanceof ApiError ? `Server error (${err.status})` : 'Network error')
      }
    }
  }, [round, voted])

  const fetchStats = useCallback(async (roundId: string) => {
    try {
      const s = await apiGet<GTRStats>(`/gtr/${roundId}/stats`)
      setStats(s)
    } catch { /* silent */ }
  }, [])

  return { round, stats, voted, result, loading, error, submitVote, fetchStats }
}
