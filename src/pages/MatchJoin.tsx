import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type { MatchQuestion } from '../store/gameStore'
import { apiGet } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'
import { ApiError } from '../lib/api'

export default function MatchJoin() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { token: pathToken } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const token = pathToken ?? searchParams.get('token')
  const { user } = useAuthStore()
  const { setMatchStart } = useGameStore()

  const [status,   setStatus]   = useState<'joining' | 'waiting' | 'starting' | 'error'>('joining')
  const [matchMode, setMatchMode] = useState<'trivia' | 'gtr'>('trivia')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !token) return
    let cancelled = false
    let navigating = false

    const run = async () => {
      try {
        const joinRes = await apiGet<{
          matchId: string
          hostId: string
          invitedId: string | null
          mode: string
        }>(`/matches/join/${token}`)
        if (cancelled) return

        const mode = (joinRes.mode === 'gtr' ? 'gtr' : 'trivia') as 'trivia' | 'gtr'
        setMatchMode(mode)
        setStatus('waiting')

        const socket = connectSocket()
        socket.emit('match:join', { token, userId: user.id })

        socket.on('match:waiting', () => {
          if (!cancelled) setStatus('waiting')
        })
        socket.on('match:start', (d: { matchId: string; questions: MatchQuestion[] }) => {
          if (cancelled) return
          navigating = true
          setMatchStart(d.matchId, d.questions, false)
          setStatus('starting')
          // Route based on match mode: GTR → /match, Trivia → /trivia
          navigate(mode === 'gtr' ? '/match' : '/trivia')
        })
        socket.on('match:error', (d: { message: string }) => {
          if (!cancelled) {
            setStatus('error')
            setErrorMsg(d.message)
          }
        })
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setErrorMsg(err instanceof ApiError ? 'Invalid or expired invite link' : 'Network error')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      if (!navigating) disconnectSocket()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id])

  const statusText: Record<string, string> = {
    joining:  'Joining match…',
    waiting:  'Waiting for host…',
    starting: 'Match found! Starting…',
    error:    errorMsg ?? 'Something went wrong',
  }

  const statusColor: Record<string, string> = {
    joining:  '#8FA3C0',
    waiting:  '#8FA3C0',
    starting: '#00C9A7',
    error:    '#ef4444',
  }

  const modeLabel = matchMode === 'gtr' ? 'Guess The Rank Duel' : '1v1 Trivia Match'

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 860,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 24,
              background: '#0D1F3C', border: '1px solid #1E3A5F',
              borderRadius: 12, padding: '48px 32px',
            }}
          >
            <h1
              className="font-beaufort font-bold"
              style={{
                fontSize: 40, lineHeight: 1, margin: 0,
                paddingBottom: '5px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {modeLabel}
            </h1>

            {status !== 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <motion.div
                  animate={reduced ? {} : { rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 20, height: 20,
                    border: '3px solid #1E3A5F',
                    borderTopColor: '#00C9A7',
                    borderRadius: '50%',
                  }}
                />
                <span style={{
                  color: statusColor[status],
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 18, letterSpacing: '0.1em',
                }}>
                  {statusText[status]}
                </span>
              </div>
            )}

            {status === 'error' && (
              <>
                <span style={{ color: '#ef4444', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16 }}>
                  {statusText.error}
                </span>
                <button
                  onClick={() => navigate('/duels')}
                  style={{
                    padding: '12px 32px', background: '#00C9A7', color: '#060F1E',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 15, letterSpacing: '0.1em',
                  }}
                >
                  BACK TO DUELS
                </button>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
