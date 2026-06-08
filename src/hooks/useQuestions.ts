import { useState, useEffect } from 'react'
import { apiGet, ApiError } from '../lib/api'
import type { Question } from '../types/question'

export function useQuestions(type: string, lane: string, refreshKey = 0) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    if (!type) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ type })
    if (lane) params.set('lane', lane)
    // Cache-bust so each refreshKey/lane combo fetches a fresh question from the server
    params.set('_r', String(refreshKey))

    apiGet<{ questions: Question[] }>(`/questions?${params.toString()}`)
      .then(data => {
        if (!cancelled) {
          setQuestion(data.questions[0] ?? null)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? `Server error (${err.status})`
              : 'Network error — check your connection'
          setError(message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [type, lane, refreshKey])

  return { question, loading, error }
}
