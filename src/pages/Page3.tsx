import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'
import { useQuestions } from '../hooks/useQuestions'
import { useScenarioVideo } from '../hooks/useScenarioVideo'
import { apiPost } from '../lib/api'
import { useGameStore } from '../store/gameStore'

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

// Group 270.svg native: 557 × 702 — scale to PANEL_H
const PANEL_H = 600
const SCALE   = PANEL_H / 702              // ≈ 0.855

const LANE_H   = Math.round(116 * SCALE)   // ≈  99 px
const LANE_W   = Math.round(149 * SCALE)   // ≈ 127 px
const LANE_GAP = Math.round((PANEL_H - 5 * LANE_H) / 4) // ≈ 26 px

const PANEL_W = Math.round(557 * SCALE)    // ≈ 476 px

// Question frame: native y = 0 → 163
const Q_H       = Math.round(163 * SCALE)  // ≈ 139 px
const Q_ANS_GAP = 16
const ANS_TOP   = Q_H + Q_ANS_GAP          // ≈ 155 px

// Answer buttons — Group 269.svg native: 557 × 332
const ANS_H = Math.round(332 * SCALE)      // ≈ 284 px

// Hint frame: native y = 560 → 702
const HINT_TOP = Math.round(560 * SCALE)   // ≈ 479 px
const HINT_H   = PANEL_H - HINT_TOP        // ≈ 121 px

// Click regions within Group 269.svg (native coords)
const ANSWER_REGIONS = [
  { id: 'A', top: 0,                        height: Math.round(96  * SCALE) },
  { id: 'B', top: Math.round(118 * SCALE),  height: Math.round(96  * SCALE) },
  { id: 'C', top: Math.round(236 * SCALE),  height: Math.round(96  * SCALE) },
]

const LABEL_CLS = 'font-beaufort font-bold bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent'
const PARA_CLS  = 'font-beaufort font-medium bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent'

export default function Page3() {
  const reduced = useReducedMotion()
  const [activeLane,     setActiveLane]     = useState('top')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [locked,         setLocked]         = useState(false)
  const [refreshKey,     setRefreshKey]     = useState(0)
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { question, loading, error } = useQuestions('scenario', activeLane, refreshKey)
  const { video: scenarioVideo } = useScenarioVideo(activeLane)
  const { addPoints, submitAnswer: recordAnswer, currentRound } = useGameStore()

  const isYouTube       = scenarioVideo?.url.startsWith('https://www.youtube.com/embed/') ?? false
  const isCloudinaryVid = scenarioVideo?.url.includes('cloudinary.com') && scenarioVideo?.url.endsWith('.mp4')

  // Auto-advance 2 s after locking in — cycle to the next lane
  useEffect(() => {
    if (!locked) return
    advanceRef.current = setTimeout(() => {
      setActiveLane(prev => {
        const idx = LANES.findIndex(l => l.key === prev)
        return LANES[(idx + 1) % LANES.length].key
      })
      setSelectedAnswer(null)
      setLocked(false)
      setRefreshKey(k => k + 1)
    }, 2000)
    return () => { if (advanceRef.current) clearTimeout(advanceRef.current) }
  }, [locked])

  const handleLockIn = useCallback(async () => {
    if (!selectedAnswer || locked || loading || !question) return
    setLocked(true)
    if (import.meta.env.VITE_API_URL) {
      try {
        const res = await apiPost<{ correct: boolean; correctAnswer: string; pointsEarned: number; explanation: string }>('/answers/submit', {
          questionId: question.id,
          selectedAnswer,
        })
        addPoints(res.pointsEarned)
        recordAnswer({ round: currentRound, selectedId: selectedAnswer, correctId: res.correctAnswer, isCorrect: res.correct, pointsEarned: res.pointsEarned })
      } catch { /* submit failed silently — locked state still shown */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer, locked, loading, question, currentRound])

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>

        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '16px 79px 80px',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Scenarios heading ── */}
          <div style={{ marginBottom: '14px' }}>
            <h1
              className="font-beaufort font-bold"
              style={{
                display: 'inline-block',
                fontSize: '54px', lineHeight: 1, margin: 0, paddingBottom: '6px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Scenarios
            </h1>
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
                  onClick={() => { setActiveLane(key); setSelectedAnswer(null); setLocked(false) }}
                  aria-label={label}
                  style={{
                    position: 'relative',
                    width: '100%', height: `${LANE_H}px`,
                    padding: 0, background: 'none', border: 'none',
                    cursor: 'pointer', outline: 'none', flexShrink: 0,
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

            {/* CENTER — scenario video panel */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative', background: '#060F1E', borderRadius: 6, overflow: 'hidden', border: '1px solid #1E3A5F' }}
            >
              {scenarioVideo && isYouTube ? (
                <iframe
                  key={scenarioVideo.id}
                  src={`${scenarioVideo.url}?rel=0&modestbranding=1&autoplay=1&mute=1`}
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
                  autoPlay
                  muted
                  loop
                  controls
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
                /* No video configured for this lane yet */
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 36, lineHeight: 1 }}>🎮</span>
                  <span className="font-beaufort font-bold" style={{ fontSize: 16, color: '#8FA3C0', letterSpacing: '0.08em' }}>
                    No Video Set
                  </span>
                  <span style={{ color: '#1E3A5F', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12 }}>
                    Add one via Admin → Videos
                  </span>
                </div>
              )}
            </motion.div>

            {/* RIGHT — Q&A panel (Group 270 as unified background) */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              style={{ width: `${PANEL_W}px`, height: `${PANEL_H}px`, flexShrink: 0, position: 'relative' }}
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
                  Question
                </p>
                <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                  {loading ? 'Loading question…' : error ? error : (question?.text ?? '')}
                </p>
              </div>

              {/* Answer buttons */}
              <div style={{
                position: 'absolute', top: `${ANS_TOP}px`, left: 0,
                width: '100%', height: `${ANS_H}px`,
              }}>
                <img src={AnswerBtnsSvg} alt=""
                  style={{ display: 'block', width: '100%', height: '100%' }} />

                {/* Dynamic answer text overlaid on each button frame — background covers SVG placeholder text */}
                {question && ANSWER_REGIONS.map(({ id, top, height }) => {
                  const ans = question.options.find(a => a.id === id)
                  if (!ans) return null
                  return (
                    <div
                      key={`ans-text-${id}`}
                      style={{
                        position: 'absolute', top: `${top + 2}px`, left: '2px',
                        width: 'calc(100% - 4px)', height: `${height - 4}px`,
                        display: 'flex', alignItems: 'center',
                        padding: '0 20px', pointerEvents: 'none',
                        background: '#0D1F3C',
                      }}
                    >
                      <p className={PARA_CLS} style={{ fontSize: '13px', lineHeight: '18px', margin: 0 }}>
                        {id}.&nbsp;{ans.text}
                      </p>
                    </div>
                  )
                })}

                {ANSWER_REGIONS.map(({ id, top, height }, i) => (
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
                    {selectedAnswer === id && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        border: '2px solid #3AF9FF',
                        background: 'rgba(58,249,255,0.07)',
                        pointerEvents: 'none',
                      }} />
                    )}
                  </motion.div>
                ))}
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

          {/* ── Answer reveal — shown after lock-in, auto-advances after 2 s ── */}
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
