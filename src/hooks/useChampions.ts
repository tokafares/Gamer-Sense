import { useState, useEffect } from 'react'
import type { Champion } from '../types/champion'
import { getChampions, getCachedChampions } from '../utils/championData'

export function useChampions() {
  const initial = getCachedChampions()
  const [champions, setChampions] = useState<Champion[]>(initial ?? [])
  const [loading,   setLoading]   = useState(initial === null)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (getCachedChampions() !== null) return
    let cancelled = false
    getChampions()
      .then(data => { if (!cancelled) { setChampions(data); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError('Failed to load champion data'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return { champions, loading, error }
}
