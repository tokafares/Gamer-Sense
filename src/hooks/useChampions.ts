import { useState, useEffect } from 'react'
import type { Champion, ChampionsData } from '../types/champion'

let cache: Champion[] | null = null
const listeners: Array<(c: Champion[]) => void> = []

export function useChampions() {
  const [champions, setChampions] = useState<Champion[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache !== null) return

    const handleData = (data: Champion[]) => {
      setChampions(data)
      setLoading(false)
    }
    listeners.push(handleData)

    if (listeners.length === 1) {
      fetch('/data/champions.json')
        .then(r => {
          if (!r.ok) throw new Error('Failed to load')
          return r.json() as Promise<ChampionsData>
        })
        .then(data => {
          cache = data.champions
          for (const fn of listeners) fn(data.champions)
          listeners.length = 0
        })
        .catch(() => {
          setError('Failed to load champion data')
          setLoading(false)
          listeners.length = 0
        })
    }

    return () => {
      const idx = listeners.indexOf(handleData)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  return { champions, loading, error }
}
