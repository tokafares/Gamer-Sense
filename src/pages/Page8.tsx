import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'
import { apiGet, apiPost } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { connectSocket } from '../lib/socket'
import QuestionMedia from '../components/QuestionMedia'
import type { Question } from '../types/question'

import SeparatorLine  from '../assets/Rectangle 6.svg'

import TopLaneSvg    from '../assets/Group 259.svg'
import JungleSvg     from '../assets/Group 258.svg'
import MidLaneSvg    from '../assets/Group 260.svg'
import ADCSvg        from '../assets/Group 261.svg'
import SupportSvg    from '../assets/Group 262.svg'

import DialogBgSvg   from '../assets/DialogBg.svg'
import Group270Svg   from '../assets/Group 270.svg'
import AnswerBtnsSvg from '../assets/Group 269.svg'
import LockInBtnSvg  from '../assets/Group 312.svg'

const LANES = [
  { key: 'top',     label: 'Top Lane', svg: TopLaneSvg  },
  { key: 'jungle',  label: 'Jungle',   svg: JungleSvg   },
  { key: 'mid',     label: 'Mid Lane', svg: MidLaneSvg  },
  { key: 'adc',     label: 'ADC',      svg: ADCSvg      },
  { key: 'support', label: 'Support',  svg: SupportSvg  },
]

const PANEL_H = 600
const SCALE   = PANEL_H / 702

const LANE_H   = Math.round(116 * SCALE)
const LANE_W   = Math.round(149 * SCALE)
const LANE_GAP = Math.round((PANEL_H - 5 * LANE_H) / 4)
const PANEL_W  = Math.round(557 * SCALE)
const Q_H      = Math.round(163 * SCALE)
const Q_ANS_GAP = 16
const ANS_TOP  = Q_H + Q_ANS_GAP
const ANS_H    = Math.round(332 * SCALE)
const HINT_TOP = Math.round(560 * SCALE)
const HINT_H   = PANEL_H - HINT_TOP

const ANSWER_REGIONS = [
  { id: 'A', top: 0,                        height: Math.round(96  * SCALE) },
  { id: 'B', top: Math.round(118 * SCALE),  height: Math.round(96  * SCALE) },
  { id: 'C', top: Math.round(236 * SCALE),  height: Math.round(96  * SCALE) },
]

const LABEL_CLS = 'font-beaufort font-bold bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent'
const PARA_CLS  = 'font-beaufort font-medium bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent'

interface RoundResult {
  correctAnswer: string
  yourScore:     number
  opponentScore: number
  explanation:   string
}

export default function Page8() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { matchId, matchQuestions, isHost, currentRound, totalRounds, addPoints, submitAnswer: recordAnswer, clearMatch } = useGameStore()
  const isMatchMode = !!matchId
  const [activeLane,      setActiveLane]      = useState(() => isMatchMode ? (matchQuestions[0]?.lane ?? 'top') : 'top')
  const [selectedAnswer,  setSelectedAnswer]  = useState<string | null>(null)
  const [locked,          setLocked]          = useState(false)
  const [roundResult,     setRoundResult]     = useState<RoundResult | null>(null)
  const [waitingOpponent, setWaitingOpponent] = useState(false)
  // Live match scores
  const [yourScore,       setYourScore]       = useState(0)
  const [oppScore,        setOppScore]        = useState(0)
  const advanceRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lockedAnswerRef   = useRef<string | null>(null)
  // Tracks the current 0-based round index as told by the server, used for round:answer emit.
  // Must NOT use the store's currentRound because it increments 2500ms after round:result,
  // causing answers for the next round to be sent with the wrong (already-used) index.
  const matchRoundIndexRef = useRef<number>(0)

  // Solo mode — batch question state
  const [laneQuestions,  setLaneQuestions]  = useState<Question[]>([])
  const [questionIdx,    setQuestionIdx]    = useState(0)
  const [fetchLoading,   setFetchLoading]   = useState(false)
  const [fetchError,     setFetchError]     = useState<string | null>(null)
  const [laneComplete,   setLaneComplete]   = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionPoints,  setSessionPoints]  = useState(0)

  // Current question in match mode — updated by round:question socket events
  const [currentMatchQuestion, setCurrentMatchQuestion] = useState<{ id: string; text: string; imageUrl?: string | null; lane: string; options: { id: string; text: string }[] } | null>(
    matchQuestions[0] ?? null
  )

  const selectedAnswerRef = useRef<string | null>(null)
  useEffect(() => { selectedAnswerRef.current = selectedAnswer }, [selectedAnswer])

  // Solo mode: fetch all questions for the lane whenever lane changes
  useEffect(() => {
    if (isMatchMode || !import.meta.env.VITE_API_URL) return
    let cancelled = false
    setFetchLoading(true)
    setFetchError(null)
    setLaneQuestions([])
    setQuestionIdx(0)
    setSessionCorrect(0)
    setSessionPoints(0)
    setLaneComplete(false)
    setSelectedAnswer(null)
    setLocked(false)

    apiGet<{ questions: Question[] }>(`/questions?type=trivia&lane=${activeLane}&limit=10`)
      .then(data => {
        if (!cancelled) {
          setLaneQuestions(data.questions)
          setFetchLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError('Network error — check your connection')
          setFetchLoading(false)
        }
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLane, isMatchMode])

  // Derived question / loading for each mode
  const soloQuestion = laneQuestions[questionIdx] ?? null
  const loading  = !isMatchMode && fetchLoading
  const question = isMatchMode ? currentMatchQuestion : soloQuestion

  // Solo mode: advance to next question 2 s after locking in
  useEffect(() => {
    if (!locked || isMatchMode) return
    const t = setTimeout(() => {
      const nextIdx = questionIdx + 1
      if (nextIdx >= laneQuestions.length && laneQuestions.length > 0) {
        setLaneComplete(true)
      } else {
        setQuestionIdx(nextIdx)
        setSelectedAnswer(null)
        setLocked(false)
      }
    }, 2000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, isMatchMode, questionIdx, laneQuestions.length])

  // ── Socket setup for 1v1 match ──
  useEffect(() => {
    if (!isMatchMode) return

    const socket = connectSocket()

    const onMatchResume = (data: { matchId: string; currentRound: number; hostScore: number; invitedScore: number; question: { id: string; text: string; imageUrl?: string | null; lane: string; options: { id: string; text: string }[] } }) => {
      const mine   = isHost ? data.hostScore : data.invitedScore
      const theirs = isHost ? data.invitedScore : data.hostScore
      matchRoundIndexRef.current = data.currentRound
      setCurrentMatchQuestion(data.question)
      setActiveLane(data.question.lane)
      setYourScore(mine)
      setOppScore(theirs)
      setSelectedAnswer(null)
      setLocked(false)
      setRoundResult(null)
      setWaitingOpponent(false)
      lockedAnswerRef.current = null
    }

    const onRoundQuestion = (data: { roundIndex: number; question: { id: string; text: string; imageUrl?: string | null; lane: string; options: { id: string; text: string }[] } }) => {
      matchRoundIndexRef.current = data.roundIndex
      setCurrentMatchQuestion(data.question)
      setActiveLane(data.question.lane)
      setSelectedAnswer(null)
      setLocked(false)
      setRoundResult(null)
      setWaitingOpponent(false)
      lockedAnswerRef.current = null
    }

    const onRoundResult = (data: { roundIndex: number; correctAnswer: string; explanation: string; hostScore: number; invitedScore: number }) => {
      const mine = isHost ? data.hostScore : data.invitedScore
      const theirs = isHost ? data.invitedScore : data.hostScore
      const result: RoundResult = { correctAnswer: data.correctAnswer, yourScore: mine, opponentScore: theirs, explanation: data.explanation }
      setRoundResult(result)
      setWaitingOpponent(false)
      setYourScore(mine)
      setOppScore(theirs)
      addPoints(mine)

      advanceRef.current = setTimeout(() => {
        const store = useGameStore.getState()
        recordAnswer({
          round:        store.currentRound,
          selectedId:   selectedAnswerRef.current ?? '',
          correctId:    data.correctAnswer,
          isCorrect:    selectedAnswerRef.current === data.correctAnswer,
          pointsEarned: mine,
        })
      }, 2500)
    }

    const onMatchEnd = (data: { winnerId: string; hostScore: number; invitedScore: number }) => {
      if (advanceRef.current) clearTimeout(advanceRef.current)
      const capturedIsHost = useGameStore.getState().isHost
      clearMatch()
      navigate('/match-winner', { state: { ...data, isHost: capturedIsHost, gameType: 'trivia' } })
    }

    socket.on('match:resume',   onMatchResume)
    socket.on('round:question', onRoundQuestion)
    socket.on('round:result',   onRoundResult)
    socket.on('match:end',      onMatchEnd)

    return () => {
      socket.off('match:resume',   onMatchResume)
      socket.off('round:question', onRoundQuestion)
      socket.off('round:result',   onRoundResult)
      socket.off('match:end',      onMatchEnd)
      if (advanceRef.current) clearTimeout(advanceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMatchMode, matchId])

  const handleLockIn = useCallback(async () => {
    if (!selectedAnswer || locked || !question) return
    setLocked(true)

    if (isMatchMode) {
      lockedAnswerRef.current = selectedAnswer
      setWaitingOpponent(true)
      const socket = connectSocket()
      socket.emit('round:answer', { matchId, roundIndex: matchRoundIndexRef.current, answer: selectedAnswer })
      return
    }

    // Solo mode
    let earned = 0
    let correct = false
    if (import.meta.env.VITE_API_URL) {
      try {
        const res = await apiPost<{ correct: boolean; correctAnswer: string; pointsEarned: number }>('/answers/submit', {
          questionId: question.id,
          selectedAnswer,
        })
        earned = res.pointsEarned
        correct = res.correct
        addPoints(res.pointsEarned)
        recordAnswer({ round: currentRound, selectedId: selectedAnswer, correctId: res.correctAnswer, isCorrect: res.correct, pointsEarned: res.pointsEarned })
      } catch { /* silent */ }
    } else {
      correct = selectedAnswer === soloQuestion?.correctAnswer
      earned = correct ? 100 : 10
    }
    if (correct) setSessionCorrect(c => c + 1)
    setSessionPoints(p => p + earned)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, locked, question, isMatchMode, matchId, currentRound])

  const handleLaneSelect = (key: string) => {
    if (isMatchMode) return
    setActiveLane(key)
  }

  const handleTryAnother = () => {
    const nextKey = LANES[(LANES.findIndex(l => l.key === activeLane) + 1) % LANES.length].key
    setLaneComplete(false)
    setQuestionIdx(0)
    setSessionCorrect(0)
    setSessionPoints(0)
    setSelectedAnswer(null)
    setLocked(false)
    setActiveLane(nextKey)
  }

  const roundLabel = isMatchMode ? `Round ${currentRound} / ${totalRounds}` : null

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '16px 79px 80px',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Heading ── */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            <h1
              className="font-beaufort font-bold"
              style={{
                fontSize: '54px', lineHeight: 1, margin: 0, paddingBottom: '6px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Trivia
            </h1>

            {roundLabel && (
              <span
                className="font-beaufort font-medium"
                style={{ fontSize: '18px', color: '#8FA3C0', marginBottom: '10px' }}
              >
                {roundLabel}
              </span>
            )}
          </div>

          {/* ── 1v1 live scoreboard ── */}
          {isMatchMode && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'flex', alignItems: 'center',
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 8, padding: '12px 24px',
                marginBottom: '16px', gap: 0,
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', color: '#8FA3C0' }}>YOU</span>
                <span className="font-beaufort font-bold" style={{
                  fontSize: 28, lineHeight: 1,
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {user?.username ?? 'Player'}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em' }}>
                  {yourScore} correct
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
                <span className="font-beaufort font-bold" style={{
                  fontSize: 32, fontStyle: 'italic',
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>VS</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#8FA3C0', letterSpacing: '0.1em' }}>
                  ROUND {currentRound}/{totalRounds}
                </span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {Array.from({ length: totalRounds }, (_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < currentRound - 1 ? '#00C9A7' : i === currentRound - 1 ? '#3AF9FF' : '#1E3A5F',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', color: '#8FA3C0' }}>OPPONENT</span>
                <span className="font-beaufort font-bold" style={{ fontSize: 28, lineHeight: 1, color: '#E8EDF5' }}>
                  Challenger
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em' }}>
                  {oppScore} correct
                </span>
              </div>
            </motion.div>
          )}

          {/* ── 3-column layout ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', height: `${PANEL_H}px` }}>

            {/* LEFT — lane buttons */}
            <motion.div
              variants={staggerCards}
              initial={reduced ? false : 'hidden'}
              animate="show"
              style={{
                display: 'flex', flexDirection: 'column',
                gap: `${LANE_GAP}px`, flexShrink: 0,
                width: `${LANE_W}px`, height: '100%',
              }}
            >
              {LANES.map(({ key, label, svg }) => (
                <motion.button
                  key={key}
                  variants={cardItemAnim}
                  onClick={() => handleLaneSelect(key)}
                  aria-label={label}
                  style={{
                    position: 'relative',
                    width: '100%', height: `${LANE_H}px`,
                    padding: 0, background: 'none', border: 'none',
                    cursor: isMatchMode ? 'default' : 'pointer',
                    outline: 'none', flexShrink: 0,
                  }}
                >
                  <img src={svg} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
                  {activeLane === key && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: '2px solid #3AF9FF', pointerEvents: 'none',
                    }} />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* CENTER — panel with artwork */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative' }}
            >
              <img src={DialogBgSvg} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', inset: '4%', width: '92%', height: '92%', overflow: 'hidden', borderRadius: 4 }}>
                <QuestionMedia
                  imageUrl={isMatchMode ? (currentMatchQuestion?.imageUrl ?? undefined) : soloQuestion?.imageUrl}
                  fallback={<div style={{ width: '100%', height: '100%', background: '#060F1E' }} />}
                />
              </div>

              {/* Waiting overlay */}
              <AnimatePresence>
                {waitingOpponent && !roundResult && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(6,15,30,0.82)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 16,
                    }}
                  >
                    <motion.div
                      animate={reduced ? {} : { scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: 18, height: 18, borderRadius: '50%', background: '#3AF9FF' }}
                    />
                    <span className="font-beaufort font-bold" style={{ color: '#3AF9FF', fontSize: 18, letterSpacing: '0.14em' }}>
                      ANSWER LOCKED IN
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#8FA3C0', letterSpacing: '0.1em' }}>
                      Waiting for opponent…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Round result overlay */}
              <AnimatePresence>
                {roundResult && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(6,15,30,0.95)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 18,
                      padding: '24px', boxSizing: 'border-box',
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <span className="font-beaufort font-bold" style={{
                        fontSize: 28, letterSpacing: '0.12em',
                        color: lockedAnswerRef.current === roundResult.correctAnswer ? '#00C9A7' : '#ef4444',
                      }}>
                        {lockedAnswerRef.current === roundResult.correctAnswer ? '✓ CORRECT!' : '✗ WRONG'}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      style={{
                        background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.4)',
                        borderRadius: 6, padding: '8px 16px', textAlign: 'center',
                      }}
                    >
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: '#8FA3C0', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                        CORRECT ANSWER
                      </span>
                      <span className="font-beaufort font-medium" style={{ fontSize: 15, color: '#00C9A7' }}>
                        {roundResult.correctAnswer}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 0, width: '100%',
                        background: '#0D1F3C', border: '1px solid #1E3A5F',
                        borderRadius: 8, padding: '12px 20px',
                      }}
                    >
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#8FA3C0', letterSpacing: '0.1em' }}>YOU</div>
                        <div className="font-beaufort font-bold" style={{
                          fontSize: 36, lineHeight: 1,
                          background: 'linear-gradient(to right, #3AF9FF, #00C9A7)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>{roundResult.yourScore}</div>
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, color: '#1E3A5F', padding: '0 12px', fontStyle: 'italic' }}>VS</div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#8FA3C0', letterSpacing: '0.1em' }}>OPP</div>
                        <div className="font-beaufort font-bold" style={{ fontSize: 36, lineHeight: 1, color: '#E8EDF5' }}>{roundResult.opponentScore}</div>
                      </div>
                    </motion.div>

                    {roundResult.explanation && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 12, color: '#8FA3C0', fontStyle: 'italic',
                          textAlign: 'center', margin: 0, lineHeight: 1.5,
                        }}
                      >
                        {roundResult.explanation}
                      </motion.p>
                    )}

                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#1E3A5F', letterSpacing: '0.1em' }}
                    >
                      Next round loading…
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* RIGHT — Q&A panel or Lane Complete panel */}
            {!isMatchMode && laneComplete ? (
              <motion.div
                key="lane-complete"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  width: `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0,
                  background: '#0D1F3C', border: '1px solid #1E3A5F',
                  borderTop: '3px solid #00C9A7', borderRadius: 6,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 20, padding: '32px 24px', boxSizing: 'border-box',
                }}
              >
                <h2
                  className="font-beaufort font-bold"
                  style={{
                    fontSize: 32, margin: 0, textAlign: 'center',
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  Lane Complete!
                </h2>
                <p
                  className="font-beaufort font-bold"
                  style={{ fontSize: 16, color: '#8FA3C0', margin: 0, letterSpacing: '0.1em' }}
                >
                  {LANES.find(l => l.key === activeLane)?.label.toUpperCase()}
                </p>
                <div style={{ textAlign: 'center' }}>
                  <p className="font-beaufort font-bold" style={{ fontSize: 22, color: '#E8EDF5', margin: '0 0 6px' }}>
                    {sessionCorrect} / {laneQuestions.length} correct
                  </p>
                  <p className="font-beaufort font-bold" style={{ fontSize: 16, color: '#00C9A7', margin: 0 }}>
                    +{sessionPoints} points earned
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <button
                    onClick={handleTryAnother}
                    style={{
                      background: 'linear-gradient(to right, #00C9A7, #0090A7)',
                      border: 'none', borderRadius: 4, padding: '12px 0',
                      color: '#060F1E', cursor: 'pointer', width: '100%',
                      fontFamily: "'Beaufort for LOL', 'Beaufort', serif",
                      fontWeight: 700, fontSize: 14, letterSpacing: '0.1em',
                    }}
                  >
                    TRY ANOTHER LANE
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    style={{
                      background: 'none', border: '1px solid #1E3A5F',
                      borderRadius: 4, padding: '12px 0',
                      color: '#8FA3C0', cursor: 'pointer', width: '100%',
                      fontFamily: "'Beaufort for LOL', 'Beaufort', serif",
                      fontWeight: 700, fontSize: 14, letterSpacing: '0.1em',
                    }}
                  >
                    VIEW PROFILE
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                style={{ width: `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0, position: 'relative' }}
              >
                <img src={Group270Svg} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: `${Q_H}px`,
                  padding: '14px 20px', boxSizing: 'border-box',
                }}>
                  <p className={LABEL_CLS} style={{ fontSize: '18px', lineHeight: 1.25, margin: '0 0 7px' }}>
                    {isMatchMode ? 'Question' : `Question ${laneQuestions.length > 0 ? `${questionIdx + 1} / ${laneQuestions.length}` : ''}`}
                  </p>
                  <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                    {isMatchMode && !currentMatchQuestion ? 'Waiting for question…' : loading ? 'Loading question…' : fetchError ? fetchError : (question?.text ?? '')}
                  </p>
                </div>

                <div style={{
                  position: 'absolute', top: `${ANS_TOP}px`, left: 0,
                  width: '100%', height: `${ANS_H}px`,
                }}>
                  <img src={AnswerBtnsSvg} alt=""
                    style={{ display: 'block', width: '100%', height: '100%' }} />

                  {question && ANSWER_REGIONS.map(({ id, top, height }) => {
                    const ans = question.options.find(a => a.id === id)
                    if (!ans) return null
                    const isSelected = selectedAnswer === id
                    const isCorrect  = roundResult?.correctAnswer === id
                    const isWrong    = roundResult && isSelected && !isCorrect

                    return (
                      <div
                        key={`ans-text-${id}`}
                        style={{
                          position: 'absolute', top: `${top + 2}px`, left: '2px',
                          width: 'calc(100% - 4px)', height: `${height - 4}px`,
                          display: 'flex', alignItems: 'center',
                          padding: '0 20px', pointerEvents: 'none',
                          background: isCorrect && roundResult
                            ? 'rgba(0,201,167,0.18)'
                            : isWrong
                              ? 'rgba(239,68,68,0.15)'
                              : '#0D1F3C',
                          transition: 'background 0.3s',
                        }}
                      >
                        <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                          {id}.&nbsp;{ans.text}
                          {isCorrect && roundResult ? ' ✓' : isWrong ? ' ✗' : ''}
                        </p>
                      </div>
                    )
                  })}

                  {!reduced && ANSWER_REGIONS.map(({ id, top, height }, i) => (
                    <motion.div
                      key={`entrance-${id}`}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.38, delay: 0.32 + i * 0.13, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', top: `${top}px`, left: 0,
                        width: '100%', height: `${height}px`,
                        background: '#060F1E', pointerEvents: 'none', zIndex: 1,
                      }}
                    />
                  ))}

                  {ANSWER_REGIONS.map(({ id, top, height }) => (
                    <motion.div
                      key={id}
                      role="button"
                      tabIndex={locked ? -1 : 0}
                      onClick={() => !locked && !loading && setSelectedAnswer(id)}
                      onKeyDown={e => e.key === 'Enter' && !locked && setSelectedAnswer(id)}
                      whileHover={reduced || locked ? {} : {
                        borderColor: 'rgba(58,249,255,0.55)',
                        boxShadow: '0 0 14px rgba(58,249,255,0.32)',
                        transition: { duration: 0.25, ease: 'easeOut' },
                      }}
                      style={{
                        position: 'absolute', top: `${top}px`, left: 0,
                        width: '100%', height: `${height}px`,
                        cursor: locked ? 'default' : 'pointer',
                        outline: 'none', boxSizing: 'border-box', zIndex: 2,
                        borderWidth: '2px', borderStyle: 'solid', borderColor: 'transparent',
                        boxShadow: '0 0 0px rgba(58,249,255,0)',
                      }}
                      aria-label={`Answer ${id}`}
                    >
                      <AnimatePresence>
                        {selectedAnswer === id && (
                          <motion.div
                            key="sel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{
                              position: 'absolute', inset: 0,
                              border: `2px solid ${roundResult
                                ? (roundResult.correctAnswer === id ? '#00C9A7' : '#ef4444')
                                : '#3AF9FF'}`,
                              background: roundResult
                                ? (roundResult.correctAnswer === id ? 'rgba(0,201,167,0.12)' : 'rgba(239,68,68,0.12)')
                                : 'rgba(58,249,255,0.07)',
                              boxShadow: roundResult
                                ? 'none'
                                : '0 0 20px rgba(58,249,255,0.4), inset 0 0 8px rgba(58,249,255,0.06)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {soloQuestion?.hint && !isMatchMode && (
                  <div style={{
                    position: 'absolute', top: `${HINT_TOP}px`, left: 0,
                    width: '100%', height: `${HINT_H}px`,
                    padding: '14px 20px', boxSizing: 'border-box',
                  }}>
                    <p className={LABEL_CLS} style={{ fontSize: '18px', lineHeight: 1.25, margin: '0 0 7px' }}>
                      Hint:
                    </p>
                    <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0, fontStyle: 'italic' }}>
                      "{soloQuestion.hint}"
                    </p>
                  </div>
                )}

                {isMatchMode && locked && !roundResult && (
                  <div style={{
                    position: 'absolute', top: `${HINT_TOP}px`, left: 0,
                    width: '100%', height: `${HINT_H}px`,
                    padding: '14px 20px', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: '#3AF9FF', flexShrink: 0,
                      animation: 'pulse 1.2s ease-in-out infinite',
                    }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em', color: '#8FA3C0' }}>
                      Answer locked — waiting for opponent…
                    </span>
                  </div>
                )}

                {isMatchMode && roundResult && (
                  <motion.div
                    variants={scrollFadeIn}
                    initial={reduced ? false : 'hidden'}
                    animate="show"
                    style={{
                      position: 'absolute', top: `${HINT_TOP}px`, left: 0,
                      width: '100%', height: `${HINT_H}px`,
                      padding: '14px 20px', boxSizing: 'border-box',
                    }}
                  >
                    <p className={LABEL_CLS} style={{ fontSize: '14px', lineHeight: 1.25, margin: '0 0 4px' }}>
                      Correct: {roundResult.correctAnswer} &nbsp;|&nbsp; You {roundResult.yourScore} — Opp {roundResult.opponentScore}
                    </p>
                    {roundResult.explanation && (
                      <p className={PARA_CLS} style={{ fontSize: '12px', lineHeight: '16px', margin: 0, fontStyle: 'italic' }}>
                        {roundResult.explanation}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── Lock-in button (hidden when lane is complete in solo mode) ── */}
          {!((!isMatchMode) && laneComplete) && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{
                marginTop: '16px',
                opacity: selectedAnswer && !loading ? 1 : 0.45,
              }}
            >
              <button
                onClick={() => { void handleLockIn() }}
                aria-label="Lock in answer"
                style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: selectedAnswer && !locked && !loading ? 'pointer' : 'default',
                  display: 'block',
                }}
              >
                <img src={LockInBtnSvg} alt="Lock In Answer"
                  style={{ display: 'block', width: '300px', height: 'auto' }} />
              </button>
            </motion.div>
          )}

          {/* ── Solo mode answer reveal ── */}
          {!isMatchMode && locked && soloQuestion && (() => {
            const correctAns = soloQuestion.options.find(a => a.id === soloQuestion.correctAnswer)
            return (
              <motion.div
                variants={scrollFadeIn}
                initial={reduced ? false : 'hidden'}
                animate="show"
                style={{
                  marginTop: '16px',
                  background: '#0D1F3C',
                  border: '1px solid #1E3A5F',
                  borderLeft: '3px solid #00C9A7',
                  borderRadius: 4,
                  padding: '14px 20px',
                }}
              >
                <p className={LABEL_CLS} style={{ fontSize: '14px', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                  {soloQuestion.correctAnswer}.&nbsp;{correctAns?.text ?? ''}
                </p>
                <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                  {soloQuestion.explanation}
                </p>
              </motion.div>
            )
          })()}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
