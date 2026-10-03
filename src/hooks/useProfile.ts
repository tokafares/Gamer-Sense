import { useState, useEffect } from 'react'
import { HAS_API } from '../lib/env'
import { apiGet, ApiError } from '../lib/api'
import type { UserProfile } from '../types/profile'

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(!!userId && HAS_API)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !HAS_API) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    apiGet<UserProfile>(`/profile/${userId}`)
      .then(data => {
        if (!cancelled) {
          setProfile(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? `Server error (${err.status})`
              : 'Network error'
          setError(message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [userId])

  return { profile, loading, error }
}
