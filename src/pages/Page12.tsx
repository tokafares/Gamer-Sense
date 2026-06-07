import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import { useGameStore } from '../store/gameStore'
import type { MatchQuestion } from '../store/gameStore'
import { useAuthStore }  from '../store/authStore'
import { apiGet } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

// ── Round Results dialog SVG frames ────────────────────────────────────────
import ResultsBar      from '../assets/Group 370.svg'
import CloseBtn        from '../assets/Group 369.svg'
import YourAnswerCard  from '../assets/Group 375.svg'
import PointsCard      from '../assets/Group 349.svg'
import CorrectCard     from '../assets/Group 373.svg'

// ── Voting statistics ───────────────────────────────────────────────────────
import VotingBg        from '../assets/voting statisticsBg.svg'
import ViewResultBtn   from '../assets/view result button 359.svg'

import Line2 from '../assets/Line 2.svg'

// ── Rank tiles ──────────────────────────────────────────────────────────────
import RankTile1 from '../assets/Group _337.svg'
import RankTile2 from '../assets/Group _338.svg'
import RankTile3 from '../assets/Group _339.svg'
import RankTile4 from '../assets/Group _340.svg'
import RankTile5 from '../assets/Group _341.svg'
import RankTile6 from '../assets/Group _342.svg'
import RankTile7 from '../assets/Group 354.svg'
import RankTile8 from '../assets/Group 355.svg'
import RankTile9 from '../assets/Group 356.svg'

const VOTING_BG_RATIO  = 519  / 1266
const RESULTS_BAR_H    = 69

const RANK_TILES = [
  RankTile1, RankTile2, RankTile3, RankTile4, RankTile5,
  RankTile6, RankTile7, RankTile8, RankTile9,
]

const RANKS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger']

const BAR_RENDER_MAX = 290

// ── Guest Join UI ───────────────────────────────────────────────────────────

function GuestJoin({ token }: { token: string }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setMatchStart } = useGameStore()
  const reduced = useReducedMotion()

  const [status, setStatus] = useState<'joining' | 'waiting' | 'starting' | 'error'>('joining')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    let navigating = false

    const run = async () => {
      try {
        // HTTP join — registers this user as invitedId on the match
        await apiGet<{ matchId: string; hostId: string; invitedId: string }>(
          `/matches/join/${token}`
        )
        if (cancelled) return
        setStatus('waiting')

        // Socket join — triggers match:start when both players are in the room
        const socket = connectSocket()
        socket.emit('match:join', { token, userId: user.id })

        socket.on('match:waiting', () => {
          if (!cancelled) setStatus('waiting')
        })
        socket.on('match:start', (d: { matchId: string; questions: MatchQuestion[] }) => {
          if (cancelled) return
          navigating = true
          setMatchStart(d.matchId, d.questions)
          setStatus('starting')
          navigate('/page1')
        })
        socket.on('match:error', (d: { message: string }) => {
          if (!cancelled) {
            setStatus('error')
            setErrorMsg(d.message)
          }
        })
      } catch {
        if (!cancelled) {
          setStatus('error')
          setErrorMsg('Invalid or expired invite link')
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

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        gap: 20,
      }}
    >
      <h1
        className="font-beaufort font-bold"
        style={{
          fontSize: 48,
          lineHeight: 1,
          background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
        }}
      >
        1v1 Trivia Match
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
          <span style={{ color: statusColor[status], fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, letterSpacing: '0.1em' }}>
            {statusText[status]}
          </span>
        </div>
      )}

      {status === 'error' && (
        <span style={{ color: '#ef4444', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15 }}>
          {statusText.error}
        </span>
      )}
    </motion.div>
  )
}

// ── GTR Results UI ──────────────────────────────────────────────────────────

function GTRResults() {
  const reduced = useReducedMotion()
  const { points, answers, currentRound, gtrResult } = useGameStore()
  const completedRound = answers.length || currentRound

  const votedRank   = gtrResult?.votedRank   ?? ''
  const correctRank = gtrResult?.correctRank ?? ''
  const totalVotes  = gtrResult?.totalVotes  ?? 0
  const percentages = gtrResult?.percentages ?? {}

  const bars = useMemo(() => {
    const maxPct = Math.max(...RANKS.map(r => percentages[r] ?? 0), 1)
    return RANKS.map(rank => {
      const pct = percentages[rank] ?? 0
      return {
        rank,
        pct,
        height: Math.round((pct / maxPct) * BAR_RENDER_MAX),
        isVoted:   rank.toLowerCase() === votedRank.toLowerCase(),
        isCorrect: rank.toLowerCase() === correctRank.toLowerCase(),
      }
    })
  }, [percentages, votedRank, correctRank])

  return (
    <>
      {/* ── Round Results dialog ─────────────────────────────────── */}
      <motion.div
        style={{ marginBottom: '10px' }}
        initial={reduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={ResultsBar}
            alt=""
            style={{ display: 'block', width: '100%', height: `${RESULTS_BAR_H}px`, objectFit: 'fill' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span
              className="font-beaufort font-bold"
              style={{
                fontSize: 30, lineHeight: 1,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Round {completedRound} Results
            </span>
          </div>
          <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)' }}>
            <motion.div
              style={{ cursor: 'pointer' }}
              whileHover={reduced ? {} : { scale: 1.15, transition: { duration: 0.18 } }}
            >
              <img src={CloseBtn} alt="Close" style={{ display: 'block', width: '45px', height: '45px' }} />
            </motion.div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
          {/* Your Answer */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={YourAnswerCard} alt="Your Answer" style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10%', gap: 6, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 31.31, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Your Answer</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 35, lineHeight: 1, textTransform: 'capitalize',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{votedRank || '—'}</span>
            </div>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={PointsCard} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 50, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Points</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 50, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFCA3A, #AD7600)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{points}</span>
            </div>
          </motion.div>

          {/* Correct Answer */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={CorrectCard} alt="Correct Answer" style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10%', gap: 6, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 31.31, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Correct Answer</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 35, lineHeight: 1, textTransform: 'capitalize',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{correctRank || '—'}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Voting Statistics ──────────────────────────────────────── */}
      <motion.div
        style={{ position: 'relative', width: '100%', paddingTop: `${VOTING_BG_RATIO * 100}%` }}
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <img src={VotingBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          padding: '14px 22px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '14px', flexShrink: 0, marginBottom: '6px' }}>
            <span className="font-beaufort font-bold" style={{
              fontSize: '35px', lineHeight: 1,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Voting Statistics</span>
            <span className="font-beaufort font-bold" style={{
              fontSize: '35px', lineHeight: 1,
              background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{totalVotes > 0 ? `${totalVotes} votes` : '— votes'}</span>
          </div>

          <img src={Line2} alt="" style={{ display: 'block', width: '100%', height: '2px', flexShrink: 0, marginBottom: '8px' }} />

          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '10px', minHeight: 0 }}>
            {RANK_TILES.map((tileSrc, i) => {
              const bar = bars[i]
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {bar && bar.height > 0 && (
                    <>
                      <span className="font-beaufort font-bold" style={{ fontSize: '11px', lineHeight: 1, marginBottom: '3px', color: '#E8EDF5', letterSpacing: '0.02em' }}>
                        {bar.pct}%
                      </span>
                      <div style={{
                        width: '82%', height: '6px', borderRadius: '2px 2px 0 0',
                        background: bar.isVoted ? '#00C9A7' : bar.isCorrect ? '#C9A227' : '#8FA3C0',
                      }} />
                      <motion.div
                        style={{
                          width: '82%', height: `${bar.height}px`,
                          background: bar.isVoted
                            ? 'linear-gradient(to top, #007A67, #00C9A7)'
                            : bar.isCorrect
                              ? 'linear-gradient(to top, #8B6F1A, #C9A227)'
                              : 'linear-gradient(to top, #0D1F3C, #1E3A5F)',
                          borderRadius: '0 0 2px 2px',
                        }}
                        initial={reduced ? false : { scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.055, ease: 'easeOut' }}
                      />
                    </>
                  )}
                  <motion.img
                    src={tileSrc}
                    alt=""
                    style={{ display: 'block', width: '90%', height: 'auto', maxWidth: '120px' }}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.55 + i * 0.04 }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── View Results button ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <motion.button
            whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
          >
            <img src={ViewResultBtn} alt="View Results" style={{ display: 'block', width: '353px', height: '65px' }} />
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}

// ── Page12 ──────────────────────────────────────────────────────────────────

export default function Page12() {
  const token = new URLSearchParams(window.location.search).get('token')

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        <div style={{
          maxWidth: '1440px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '16px 79px 48px',
          position: 'relative',
          zIndex: 1,
        }}>
          {token ? <GuestJoin token={token} /> : <GTRResults />}
        </div>
      </main>

      <img
        src={SeparatorLine}
        alt=""
        style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }}
      />
      <Footer />
    </>
  )
}
