import { useState, useEffect } from 'react'
import { apiGet, ApiError } from '../lib/api'

interface ScenarioVideo {
  id: string
  url: string
  lane: string
  type: string
}

export function useScenarioVideo(lane: string) {
  const [video,   setVideo]   = useState<ScenarioVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!lane) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ type: 'scenario', lane })
    apiGet<{ videos: ScenarioVideo[] }>(`/videos?${params.toString()}`)
      .then(data => {
        if (!cancelled) {
          setVideo(data.videos[0] ?? null)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? `Error ${err.status}` : 'Network error')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [lane])

  return { video, loading, error }
}
