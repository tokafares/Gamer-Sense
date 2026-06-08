import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'
import { useQuestions } from '../hooks/useQuestions'
import { apiPost } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { getSocket, connectSocket } from '../lib/socket'

import SeparatorLine  from '../assets/Rectangle 6.svg'

import TopLaneSvg    from '../assets/Group 259.svg'
import JungleSvg     from '../assets/Group 258.svg'
import MidLaneSvg    from '../assets/Group 260.svg'
import ADCSvg        from '../assets/Group 261.svg'
import SupportSvg    from '../assets/Group 262.svg'

import DialogBgSvg   from '../assets/DialogBg.svg'
import GameArtwork   from '../assets/Gemini_Generated_Image_hye8c0hye8c0hye8 1.webp'
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
}

export default function Page8() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const [activeLane,      setActiveLane]      = useState('top')
  const [selectedAnswer,  setSelectedAnswer]  = useState<string | null>(null)
  const [locked,          setLocked]          = useState(false)
  const [roundResult,     setRoundResult]     = useState<RoundResult | null>(null)
  const [waitingOpponent, setWaitingOpponent] = useState(false)
  const [refreshKey,      setRefreshKey]      = useState(0)
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { matchId, matchQuestions, currentRound, totalRounds, addPoints, submitAnswer: recordAnswer, setMatchStart: _, clearMatch } = useGameStore()
  const isMatchMode = !!matchId && matchQuestions.length > 0

  // Auto-advance 2 s after locking in — cycle to next lane (solo mode only)
  useEffect(() => {
    if (!locked || isMatchMode) return
    const t = setTimeout(() => {
      setActiveLane(prev => {
        const idx = LANES.findIndex(l => l.key === prev)
        return LANES[(idx + 1) % LANES.length].key
      })
      setSelectedAnswer(null)
      setLocked(false)
      setRefreshKey(k => k + 1)
    }, 2000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, isMatchMode])

  // Solo mode question fetch — disabled when in match mode
  const { question: soloQuestion, loading, error } = useQuestions(
    isMatchMode ? '' : 'trivia',
    isMatchMode ? '' : activeLane,
    refreshKey
  )

  // In match mode, derive question from store
  const matchQuestion = isMatchMode ? (matchQuestions[currentRound - 1] ?? null) : null
  const question = isMatchMode ? matchQuestion : soloQuestion

  // ── Socket setup for 1v1 match ──
  useEffect(() => {
    if (!isMatchMode) return

    const socket = getSocket() ?? connectSocket()

    const onRoundResult = (data: { correctAnswer: string; yourScore: number; opponentScore: number }) => {
      setRoundResult(data)
      setWaitingOpponent(false)
      addPoints(data.yourScore)

      // Advance to next round after 2.5 s
      advanceRef.current = setTimeout(() => {
        const store = useGameStore.getState()
        if (store.currentRound < store.totalRounds) {
          recordAnswer({
            round:        store.currentRound,
            selectedId:   selectedAnswer ?? '',
            correctId:    data.correctAnswer,
            isCorrect:    selectedAnswer === data.correctAnswer,
            pointsEarned: data.yourScore,
          })
          setSelectedAnswer(null)
          setLocked(false)
          setRoundResult(null)
        }
      }, 2500)
    }

    const onMatchEnd = (data: { winnerId: string; hostScore: number; invitedScore: number }) => {
      clearMatch()
      navigate('/match-winner', { state: data })
    }

    socket.on('round:result', onRoundResult)
    socket.on('match:end',    onMatchEnd)

    return () => {
      socket.off('round:result', onRoundResult)
      socket.off('match:end',    onMatchEnd)
      if (advanceRef.current) clearTimeout(advanceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMatchMode, matchId, selectedAnswer])

  const handleLockIn = useCallback(async () => {
    if (!selectedAnswer || locked || !question) return
    setLocked(true)

    if (isMatchMode) {
      // Emit answer to server — server fires round:result when both players answered
      setWaitingOpponent(true)
      const socket = getSocket() ?? connectSocket()
      socket.emit('answer:submit', { matchId, questionId: question.id, answerId: selectedAnswer })
      return
    }

    // Solo mode — submit via REST
    if (import.meta.env.VITE_API_URL && !isMatchMode) {
      try {
        const res = await apiPost<{ correct: boolean; correctAnswer: string; pointsEarned: number }>('/answers/submit', {
          questionId: question.id,
          selectedAnswer,
        })
        addPoints(res.pointsEarned)
        recordAnswer({ round: currentRound, selectedId: selectedAnswer, correctId: res.correctAnswer, isCorrect: res.correct, pointsEarned: res.pointsEarned })
      } catch { /* silent */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, locked, question, isMatchMode, matchId, currentRound])

  // Round progress indicator for match mode
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
                  onClick={() => {
                    if (isMatchMode) return
                    setActiveLane(key); setSelectedAnswer(null); setLocked(false)
                  }}
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
                  {activeLane === key && !isMatchMode && (
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
              <img src={GameArtwork} alt=""
                style={{ position: 'absolute', inset: '4%', width: '92%', height: '92%', objectFit: 'cover', borderRadius: 4 }} />

              {/* Waiting overlay shown inside artwork panel */}
              <AnimatePresence>
                {waitingOpponent && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(6,15,30,0.75)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 12,
                    }}
                  >
                    <span style={{
                      display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                      background: '#3AF9FF', animation: 'pulse 1.2s ease-in-out infinite',
                    }} />
                    <span className="font-beaufort font-bold" style={{ color: '#3AF9FF', fontSize: 16, letterSpacing: '0.12em' }}>
                      WAITING FOR OPPONENT…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* RIGHT — Q&A panel */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              style={{ width: `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0, position: 'relative' }}
            >
              <img src={Group270Svg} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

              {/* Question text overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: `${Q_H}px`,
                padding: '14px 20px', boxSizing: 'border-box',
              }}>
                <p className={LABEL_CLS} style={{ fontSize: '18px', lineHeight: 1.25, margin: '0 0 7px' }}>
                  Question
                </p>
                <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                  {loading && !isMatchMode ? 'Loading question…' : error ? error : (question?.text ?? '')}
                </p>
              </div>

              {/* Answer buttons */}
              <div style={{
                position: 'absolute', top: `${ANS_TOP}px`, left: 0,
                width: '100%', height: `${ANS_H}px`,
              }}>
                <img src={AnswerBtnsSvg} alt=""
                  style={{ display: 'block', width: '100%', height: '100%' }} />

                {/* Dynamic answer text */}
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

                {/* Staggered entrance */}
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

              {/* Hint text overlay */}
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

              {/* Match mode: correct answer reveal in hint area */}
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
                    Correct answer: {roundResult.correctAnswer}
                  </p>
                  <p style={{ fontSize: '12px', color: '#8FA3C0', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>
                    Your score: {roundResult.yourScore} &nbsp;|&nbsp; Opponent: {roundResult.opponentScore}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* ── Lock-in button ── */}
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

          {/* ── Solo mode answer reveal — auto-advances after 2 s ── */}
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
