import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

import PlayerCard   from '../assets/Group 367.svg'
import UpgradeBtn   from '../assets/Group 321 upgrade button.svg'
import StatsBg      from '../assets/Group 336.svg'
import RanksBg      from '../assets/Group 345.svg'
import StatFrame1   from '../assets/Group 347.svg'
import StatFrame2   from '../assets/Group 346.svg'
import StatFrame3   from '../assets/Group 348.svg'
import Rank1        from '../assets/Group 337.svg'
import Rank2        from '../assets/Group 338.svg'
import Rank3        from '../assets/Group 339.svg'
import Rank4        from '../assets/Group 340.svg'
import Rank5        from '../assets/Group 341.svg'
import Rank6        from '../assets/Group 342.svg'
import SeparatorLine from '../assets/Rectangle 6.svg'

// Group 367 native: 429 × 582  → render at CARD_W wide
const CARD_W = 230
const CARD_H = Math.round(CARD_W * (582 / 429))   // ≈ 312

// Group 321 upgrade button native: 431 × 100 → same width as card
const BTN_H = Math.round(CARD_W * (100 / 431))    // ≈ 53

// Gap between left column elements
const LEFT_GAP = 14

// Gap between left column and right column
const COL_GAP = 20

// Group 336 native: 1085 × 399  — separator at y=93 (23.31% from top)
// Group 345 native: 1085 × 280  — separator at y=87 (31.07% from top)
const STATS_RATIO  = 399 / 1085
const RANKS_RATIO  = 280 / 1085
const STATS_SEP_PCT = 93  / 399   // 23.31%
const RANKS_SEP_PCT = 87  / 280   // 31.07%

const STAT_FRAMES = [StatFrame1, StatFrame2, StatFrame3]
const RANK_CARDS  = [Rank1, Rank2, Rank3, Rank4, Rank5, Rank6]

export default function Page10() {
  const reduced = useReducedMotion()

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        <div style={{
          maxWidth: '1440px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '20px 79px 48px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* ── PROFILE heading ── */}
          <motion.h1
            className="font-beaufort font-bold"
            style={{
              fontSize: '60px',
              lineHeight: 1,
              margin: '0 0 22px',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            PROFILE
          </motion.h1>

          {/* ── Two-column layout ── */}
          <div style={{
            display: 'flex',
            gap: `${COL_GAP}px`,
            alignItems: 'flex-start',
          }}>

            {/* ─── LEFT: Player card + Upgrade button ─── */}
            <motion.div
              style={{
                width: `${CARD_W}px`,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: `${LEFT_GAP}px`,
              }}
              initial={reduced ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Group 367: complete player card (portrait + name + level embedded) */}
              <img
                src={PlayerCard}
                alt="Player card"
                style={{
                  display: 'block',
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  objectFit: 'fill',
                }}
              />

              {/* Group 321: Upgrade Membership button */}
              <motion.div
                whileHover={reduced ? {} : { opacity: 0.88, transition: { duration: 0.18 } }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={UpgradeBtn}
                  alt="Upgrade Membership"
                  style={{
                    display: 'block',
                    width: `${CARD_W}px`,
                    height: `${BTN_H}px`,
                    objectFit: 'fill',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* ─── RIGHT: Statistics + Current Ranks ─── */}
            <div style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>

              {/* Statistics panel — Group 336 (1085 × 399) */}
              <motion.div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: `${STATS_RATIO * 100}%`,   // preserves 1085:399 aspect ratio
                }}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                {/* Background */}
                <img
                  src={StatsBg}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />

                {/* Stat frames — sit in the area below the separator (y=93/399 ≈ 23.3%) */}
                <div style={{
                  position: 'absolute',
                  top: `${STATS_SEP_PCT * 100}%`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  padding: '1% 5%',
                }}>
                  {STAT_FRAMES.map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt=""
                      style={{ height: '87%', width: 'auto', display: 'block' }}
                      initial={reduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Current Ranks panel — Group 345 (1085 × 280) */}
              <motion.div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: `${RANKS_RATIO * 100}%`,  // preserves 1085:280 aspect ratio
                }}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                {/* Background */}
                <img
                  src={RanksBg}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />

                {/* Rank cards — below separator (y=87/280 ≈ 31.1%) */}
                <div style={{
                  position: 'absolute',
                  top: `${RANKS_SEP_PCT * 100}%`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  padding: '0 3%',
                }}>
                  {RANK_CARDS.map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt=""
                      style={{ height: '82%', width: 'auto', display: 'block' }}
                      initial={reduced ? false : { opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.42 + i * 0.055 }}
                    />
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
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
