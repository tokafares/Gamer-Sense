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

export function useGTRRound() {
  const [round,   setRound]   = useState<GTRRound | null>(null)
  const [stats,   setStats]   = useState<GTRStats | null>(null)
  const [voted,   setVoted]   = useState(false)
  const [result,  setResult]  = useState<VoteResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!import.meta.env.VITE_API_URL) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    apiGet<GTRRound>('/gtr/round')
      .then(data => { if (!cancelled) { setRound(data); setLoading(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `Server error (${err.status})` : 'Network error')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  const submitVote = useCallback(async (votedRank: string) => {
    if (!round || voted) return
    try {
      const res = await apiPost<VoteResult>(`/gtr/${round.id}/vote`, { votedRank })
      setResult(res)
      setVoted(true)
      // Fetch stats after voting
      const s = await apiGet<GTRStats>(`/gtr/${round.id}/stats`)
      setStats(s)
    } catch (err) {
      setError(err instanceof ApiError ? `Server error (${err.status})` : 'Network error')
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
