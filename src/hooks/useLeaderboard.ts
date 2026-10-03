import { useState, useEffect } from 'react'
import { HAS_API } from '../lib/env'
import { apiGet, ApiError } from '../lib/api'
import type { LeaderboardEntry } from '../types/leaderboard'

const hasBackend = HAS_API

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(hasBackend)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!hasBackend) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    apiGet<{ leaderboard: LeaderboardEntry[] }>('/leaderboard')
      .then(data => {
        if (!cancelled) {
          setEntries(data.leaderboard)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `Server error (${err.status})` : 'Network error')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  return { entries, loading, error }
}
