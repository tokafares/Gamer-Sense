import { useState, useCallback, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'
import { useScenarioVideo } from '../hooks/useScenarioVideo'
import { useIsMobile } from '../hooks/useIsMobile'
import { toYouTubeEmbed } from '../lib/youtube'
import { apiGet, apiPost } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useLevelUpStore } from '../store/levelUpStore'
import QuestionMedia from '../components/QuestionMedia'
import type { Question } from '../types/question'

import SeparatorLine  from '../assets/Rectangle 6.svg'

import TopLaneSvg    from '../assets/Group 259.svg'
import JungleSvg     from '../assets/Group 258.svg'
import MidLaneSvg    from '../assets/Group 260.svg'
import ADCSvg        from '../assets/Group 261.svg'
import SupportSvg    from '../assets/Group 262.svg'

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

const PANEL_W = Math.round(557 * SCALE)

const Q_H       = Math.round(163 * SCALE)
const Q_ANS_GAP = 16
const ANS_TOP   = Q_H + Q_ANS_GAP

const ANS_H = Math.round(332 * SCALE)

const HINT_TOP = Math.round(560 * SCALE)
const HINT_H   = PANEL_H - HINT_TOP

const ANSWER_REGIONS = [
  { id: 'A', top: 0,                        height: Math.round(96  * SCALE) },
  { id: 'B', top: Math.round(118 * SCALE),  height: Math.round(96  * SCALE) },
  { id: 'C', top: Math.round(236 * SCALE),  height: Math.round(96  * SCALE) },
]

const LABEL_CLS = 'font-beaufort font-bold bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent'
const PARA_CLS  = 'font-beaufort font-medium bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent'

export default function Page3() {
  const reduced  = useReducedMotion()
  const isMobile = useIsMobile()
  const [activeLane,     setActiveLane]     = useState('top')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [locked,         setLocked]         = useState(false)

  // Batch question state
  const [laneQuestions,  setLaneQuestions]  = useState<Question[]>([])
  const [questionIdx,    setQuestionIdx]    = useState(0)
  const [fetchLoading,   setFetchLoading]   = useState(false)
  const [fetchError,     setFetchError]     = useState<string | null>(null)
  const [laneComplete,   setLaneComplete]   = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionPoints,  setSessionPoints]  = useState(0)

  const { video: scenarioVideo } = useScenarioVideo(activeLane)
  const { addPoints, submitAnswer: recordAnswer, currentRound } = useGameStore()

  const scenarioYt      = toYouTubeEmbed(scenarioVideo?.url)
  const isYouTube       = !!scenarioYt
  const isCloudinaryVid = scenarioVideo?.url.includes('cloudinary.com') && scenarioVideo?.url.endsWith('.mp4')

  // Fetch all questions for the active lane whenever lane changes
  useEffect(() => {
    if (!import.meta.env.VITE_API_URL) return
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

    apiGet<{ questions: Question[] }>(`/questions?type=scenario&lane=${activeLane}&limit=10`)
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
  }, [activeLane])

  const question = laneQuestions[questionIdx] ?? null
  const loading  = fetchLoading

  // Manual advance — the player controls when to move on (no slow auto-advance),
  // so the correct/incorrect highlight + explanation stay visible until they're ready.
  const goNext = useCallback(() => {
    const nextIdx = questionIdx + 1
    if (nextIdx >= laneQuestions.length && laneQuestions.length > 0) {
      setLaneComplete(true)
    } else {
      setQuestionIdx(nextIdx)
      setSelectedAnswer(null)
      setLocked(false)
    }
  }, [questionIdx, laneQuestions.length])

  const handleLockIn = useCallback(async () => {
    if (!selectedAnswer || locked || loading || !question) return
    setLocked(true)
    let earned = 0
    let correct = false
    if (import.meta.env.VITE_API_URL) {
      try {
        const res = await apiPost<{ correct: boolean; correctAnswer: string; pointsEarned: number; totalPoints: number; explanation: string }>('/answers/submit', {
          questionId: question.id,
          selectedAnswer,
        })
        earned = res.pointsEarned
        correct = res.correct
        addPoints(res.pointsEarned)
        recordAnswer({ round: currentRound, selectedId: selectedAnswer, correctId: res.correctAnswer, isCorrect: res.correct, pointsEarned: res.pointsEarned })
        useLevelUpStore.getState().checkLevelUp(res.totalPoints, res.pointsEarned)
      } catch { /* submit failed silently */ }
    } else {
      correct = selectedAnswer === question.correctAnswer
      earned = correct ? 100 : 10
    }
    if (correct) setSessionCorrect(c => c + 1)
    setSessionPoints(p => p + earned)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, locked, loading, question, currentRound])

  const handleLaneSelect = (key: string) => {
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
    setActiveLane(nextKey)   // triggers useEffect → fetches next lane's questions
  }

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>

        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: isMobile ? '16px 14px 56px' : '16px 79px 80px',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Scenarios heading ── */}
          <div style={{ marginBottom: '14px' }}>
            <h1
              className="font-beaufort font-bold"
              style={{
                display: 'inline-block',
                fontSize: isMobile ? '36px' : '54px', lineHeight: 1, margin: 0, paddingBottom: '6px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Scenarios
            </h1>
          </div>

          {/* ── 3-column layout (stacks vertically on mobile) ── */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start', gap: isMobile ? '12px' : '16px', height: isMobile ? 'auto' : `${PANEL_H}px` }}>

            {/* LEFT — lane buttons (horizontal row on mobile) */}
            <motion.div
              variants={staggerCards}
              initial={reduced ? false : 'hidden'}
              animate="show"
              style={{
                display: 'flex', flexDirection: isMobile ? 'row' : 'column',
                gap: isMobile ? '6px' : `${LANE_GAP}px`, flexShrink: 0,
                width: isMobile ? '100%' : `${LANE_W}px`, height: isMobile ? 'auto' : '100%',
                order: isMobile ? 2 : 0,
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
                    width: isMobile ? 'auto' : '100%',
                    flex: isMobile ? 1 : undefined,
                    height: isMobile ? '46px' : `${LANE_H}px`,
                    padding: 0, background: 'none', border: 'none',
                    cursor: 'pointer', outline: 'none', flexShrink: isMobile ? 1 : 0,
                    minWidth: 0,
                  }}
                >
                  <img src={svg} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
                  {activeLane === key && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: '2px solid #3AF9FF', pointerEvents: 'none',
                    }} />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* CENTER — scenario video panel */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : undefined, minWidth: 0, height: isMobile ? '210px' : '100%', position: 'relative', background: '#060F1E', borderRadius: 6, overflow: 'hidden', border: '1px solid #1E3A5F', order: isMobile ? 1 : 0 }}
            >
              <QuestionMedia
                imageUrl={question?.imageUrl}
                fallback={
                  scenarioVideo && isYouTube ? (
                    <iframe
                      key={scenarioVideo.id}
                      src={`${scenarioYt}?rel=0&modestbranding=1&autoplay=1&mute=1`}
                      title="Scenario"
                      width="100%"
                      height="100%"
                      style={{ display: 'block', border: 'none', position: 'absolute', inset: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : scenarioVideo && isCloudinaryVid ? (
                    <video
                      key={scenarioVideo.id}
                      src={scenarioVideo.url}
                      autoPlay muted loop controls
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : scenarioVideo ? (
                    <img
                      key={scenarioVideo.id}
                      src={scenarioVideo.url}
                      alt=""
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#060F1E' }} />
                  )
                }
              />
            </motion.div>

            {/* RIGHT — Q&A panel or Lane Complete panel */}
            {laneComplete ? (
              <motion.div
                key="lane-complete"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  width: isMobile ? '100%' : `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0,
                  order: isMobile ? 3 : 0,
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
                    NEXT SCENARIO
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                style={{ width: isMobile ? '100%' : `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0, position: 'relative', order: isMobile ? 3 : 0 }}
              >
                {/* Group 270.svg: single background covering Q box + Hint box */}
                <img src={Group270Svg} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

                {/* Question text overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: `${Q_H}px`,
                  padding: '14px 20px', boxSizing: 'border-box',
                }}>
                  <p className={LABEL_CLS} style={{ fontSize: '18px', lineHeight: 1.25, margin: '0 0 7px' }}>
                    Question {laneQuestions.length > 0 ? `${questionIdx + 1} / ${laneQuestions.length}` : ''}
                  </p>
                  <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                    {loading ? 'Loading question…' : fetchError ? fetchError : (question?.text ?? '')}
                  </p>
                </div>

                {/* Answer buttons */}
                <div style={{
                  position: 'absolute', top: `${ANS_TOP}px`, left: 0,
                  width: '100%', height: `${ANS_H}px`,
                }}>
                  <img src={AnswerBtnsSvg} alt=""
                    style={{ display: 'block', width: '100%', height: '100%' }} />

                  {question && ANSWER_REGIONS.map(({ id, top, height }) => {
                    const ans = question.options.find(a => a.id === id)
                    if (!ans) return null
                    const isCorrect = locked && question.correctAnswer === id
                    const isWrong   = locked && selectedAnswer === id && question.correctAnswer !== id
                    return (
                      <div
                        key={`ans-text-${id}`}
                        style={{
                          position: 'absolute', top: `${top + 2}px`, left: '2px',
                          width: 'calc(100% - 4px)', height: `${height - 4}px`,
                          display: 'flex', alignItems: 'center',
                          padding: '0 20px', pointerEvents: 'none',
                          background: isCorrect ? '#0E3A30' : isWrong ? '#3A1E22' : '#0D1F3C',
                          transition: 'background 0.3s',
                        }}
                      >
                        <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                          {id}.&nbsp;{ans.text}{isCorrect ? '  ✓' : isWrong ? '  ✗' : ''}
                        </p>
                      </div>
                    )
                  })}

                  {question && ANSWER_REGIONS.map(({ id, top, height }, i) => {
                    const isCorrect = locked && question.correctAnswer === id
                    const isWrong   = locked && selectedAnswer === id && question.correctAnswer !== id
                    return (
                    <motion.div
                      key={id}
                      role="button"
                      tabIndex={locked ? -1 : 0}
                      onClick={() => !locked && !loading && setSelectedAnswer(id)}
                      onKeyDown={e => e.key === 'Enter' && !locked && setSelectedAnswer(id)}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                      style={{
                        position: 'absolute', top: `${top}px`, left: 0,
                        width: '100%', height: `${height}px`,
                        cursor: locked ? 'default' : 'pointer',
                      }}
                      aria-label={`Answer ${id}`}
                    >
                      {!locked && selectedAnswer === id && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          border: '2px solid #3AF9FF',
                          background: 'rgba(58,249,255,0.07)',
                          pointerEvents: 'none',
                        }} />
                      )}
                      {isCorrect && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #00C9A7', pointerEvents: 'none' }} />
                      )}
                      {isWrong && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #ef4444', pointerEvents: 'none' }} />
                      )}
                    </motion.div>
                    )
                  })}
                </div>

                {/* Hint text overlay */}
                <div style={{
                  position: 'absolute', top: `${HINT_TOP}px`, left: 0,
                  width: '100%', height: `${HINT_H}px`,
                  padding: '14px 20px', boxSizing: 'border-box',
                }}>
                  <p className={LABEL_CLS} style={{ fontSize: '18px', lineHeight: 1.25, margin: '0 0 7px' }}>
                    Hint:
                  </p>
                  <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0, fontStyle: 'italic' }}>
                    {question?.hint ? `"${question.hint}"` : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Lock-in button → Next Scenario button after answering (hidden when lane complete) ── */}
          {!laneComplete && !locked && (
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

          {!laneComplete && locked && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: '16px' }}
            >
              <button
                onClick={goNext}
                className="font-beaufort font-bold"
                style={{
                  display: 'block', cursor: 'pointer',
                  padding: '14px 48px', border: 'none', borderRadius: 6,
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  color: '#060F1E', fontSize: 17, letterSpacing: '0.08em',
                }}
              >
                Next Scenario →
              </button>
            </motion.div>
          )}

          {/* ── Answer reveal — shown after lock-in ── */}
          {locked && question && (() => {
            const correctAns = question.options.find(a => a.id === question.correctAnswer)
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
                  {question.correctAnswer}.&nbsp;{correctAns?.text ?? ''}
                </p>
                <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                  {question.explanation}
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
