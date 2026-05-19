import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'

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
import Group310Svg   from '../assets/Group 310.svg'

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
const TEAL_CLS  = 'font-beaufort font-bold bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent'

const REVEAL_BG  = 'linear-gradient(180deg, #192F50 0%, #0E1B2F 100%)'
const REVEAL_BRD = '2px solid #B4B4B4'

export default function Page4() {
  const reduced = useReducedMotion()
  const [activeLane,     setActiveLane]     = useState('top')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [locked,         setLocked]         = useState(false)

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>

        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '16px 79px 40px',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Blitz heading ── */}
          <div style={{ marginBottom: '14px' }}>
            <h1
              className="font-beaufort font-bold"
              style={{
                fontSize: '54px', lineHeight: 1, margin: 0,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Blitz
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
                  onClick={() => setActiveLane(key)}
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

            {/* CENTER — panel frame only (image removed) */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative' }}
            >
              <img src={DialogBgSvg} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
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
                  Which of these champions is traditionally considered a&nbsp;'lane&nbsp;bully'
                  in the top lane due to their high early-game pressure and range?
                </p>
              </div>

              {/* Answer buttons */}
              <div style={{
                position: 'absolute', top: `${ANS_TOP}px`, left: 0,
                width: '100%', height: `${ANS_H}px`,
              }}>
                <img src={AnswerBtnsSvg} alt=""
                  style={{ display: 'block', width: '100%', height: '100%' }} />
                {ANSWER_REGIONS.map(({ id, top, height }, i) => (
                  <motion.div
                    key={id}
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    onClick={() => !locked && setSelectedAnswer(id)}
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
                  "Think of a champion that uses range to punish melee opponents from level&nbsp;1."
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
              opacity: selectedAnswer || locked ? 1 : 0.45,
              display: 'inline-block',
            }}
          >
            <button
              onClick={() => { if (selectedAnswer && !locked) setLocked(true) }}
              aria-label="Lock in answer"
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: selectedAnswer && !locked ? 'pointer' : 'default',
                display: 'block',
              }}
            >
              <img src={LockInBtnSvg} alt="Lock In Answer"
                style={{ display: 'block', width: '300px', height: 'auto' }} />
            </button>
          </motion.div>

          {/* ── Answer reveal ── */}
          {locked && (
            <motion.div
              variants={scrollFadeIn}
              initial={reduced ? false : 'hidden'}
              animate="show"
              style={{
                marginTop: '10px',
                background: REVEAL_BG, border: REVEAL_BRD,
                padding: '6px 14px',
                display: 'inline-block',
                minWidth: '260px',
                maxWidth: '400px',
              }}
            >
              <p className={TEAL_CLS} style={{ fontSize: '12px', letterSpacing: '0.06em', margin: '0 0 2px' }}>
                C. Quinn
              </p>
              <p className={PARA_CLS} style={{ fontSize: '11px', lineHeight: '16px', margin: 0 }}>
                That's right! Quinn uses her ranged advantage and vault to harass melee
                top laners, making her a classic example of a lane bully.
              </p>
            </motion.div>
          )}

        </div>
      </main>

      {/* c.quinn — smaller, left-aligned, with space before separator */}
      <div style={{ maxWidth: '1440px', marginLeft: 'auto', marginRight: 'auto', marginTop: '0px', marginBottom: '48px', paddingBottom: '32px' }}>
        <img src={Group310Svg} alt="" style={{ display: 'block', width: '62%', height: 'auto', marginLeft: '79px' }} />
      </div>
      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
