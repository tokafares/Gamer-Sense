import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'

// ── Round 3 Results dialog ──────────────────────────────────────────────────
import ResultsBar      from '../assets/Group 370.svg'       // 1266 × 69  title bar
import CloseBtn        from '../assets/Group 369.svg'       // 45 × 45    ✕ button
import YourAnswerCard  from '../assets/Group _375.svg'      // 376 × 418  left card
import PointsCard      from '../assets/Group _349.svg'      // 376 × 418  center card
import CorrectCard     from '../assets/Group _373.svg'      // 376 × 418  right card

// ── Voting statistics ───────────────────────────────────────────────────────
import VotingBg        from '../assets/voting statisticsBg.svg'      // 1266 × 519
import ViewResultBtn   from '../assets/view result button 359.svg'   // 353 × 65

// ── Percentage bars (Rectangle 46–52) ──────────────────────────────────────
import Bar46 from '../assets/Rectangle 46.svg'   // 114 × 191  dark
import Bar47 from '../assets/Rectangle 47.svg'   // 114 × 295  dark
import Bar48 from '../assets/Rectangle 48.svg'   // 114 × 316  dark
import Bar49 from '../assets/Rectangle 49.svg'   // 114 × 303  teal  (your answer)
import Bar50 from '../assets/Rectangle 50.svg'   // 114 × 241  gold  (correct answer)
import Bar51 from '../assets/Rectangle 51.svg'   // 114 × 241  dark
import Bar52 from '../assets/Rectangle 52.svg'   // 114 × 206  dark

// ── Bar top-cap indicators (Rectangle 53–59) ───────────────────────────────
import Cap53 from '../assets/Rectangle 53.svg'   // 114 × 8  teal  (Platinum)
import Cap54 from '../assets/Rectangle 54.svg'   // 114 × 8  gold  (Gold)
import Cap55 from '../assets/Rectangle 55.svg'   // 114 × 8  dark  (Iron)
import Cap56 from '../assets/Rectangle 56.svg'   // 114 × 8  dark  (Bronze)
import Cap57 from '../assets/Rectangle 57.svg'   // 114 × 8  dark  (Silver)
import Cap58 from '../assets/Rectangle 58.svg'   // 114 × 8  dark  (Diamond)
import Cap59 from '../assets/Rectangle 59.svg'   // 114 × 8  dark  (Master)

// ── Separator line ──────────────────────────────────────────────────────────
import Line2 from '../assets/Line 2.svg'

// ── Rank tiles (reused from Page 11) ───────────────────────────────────────
import RankTile1 from '../assets/Group _337.svg'
import RankTile2 from '../assets/Group _338.svg'
import RankTile3 from '../assets/Group _339.svg'
import RankTile4 from '../assets/Group _340.svg'
import RankTile5 from '../assets/Group _341.svg'
import RankTile6 from '../assets/Group _342.svg'
import RankTile7 from '../assets/Group 354.svg'
import RankTile8 from '../assets/Group 355.svg'
import RankTile9 from '../assets/Group 356.svg'

// ── Constants ───────────────────────────────────────────────────────────────

// Native aspect ratios for proportional rendering
const VOTING_BG_RATIO  = 519  / 1266   // ≈ 41.0 %
const RESULTS_BAR_H    = 69             // native px (rendered at same aspect as content width)

// Rank tiles ordered Iron → Challenger (same order as Page 11)
const RANK_TILES = [
  RankTile1, RankTile2, RankTile3, RankTile4, RankTile5,
  RankTile6, RankTile7, RankTile8, RankTile9,
]

// Bar data: src, native height, label, cap — null = no bar (0 votes)
const BARS: Array<{ src: string; nativeH: number; label: string; cap: string } | null> = [
  { src: Bar46, nativeH: 191, label: '4%',  cap: Cap55 },   // Iron
  { src: Bar47, nativeH: 295, label: '27%', cap: Cap56 },   // Bronze
  { src: Bar48, nativeH: 316, label: '32%', cap: Cap57 },   // Silver
  { src: Bar49, nativeH: 303, label: '25%', cap: Cap53 },   // Platinum (your answer – teal)
  { src: Bar50, nativeH: 241, label: '4%',  cap: Cap54 },   // Gold     (correct answer – gold)
  { src: Bar51, nativeH: 241, label: '8%',  cap: Cap58 },   // Diamond
  { src: Bar52, nativeH: 206, label: '0%',  cap: Cap59 },   // Master
  null,                                                       // GrandMaster
  null,                                                       // Challenger
]

// Scale bars so the tallest fits in ~290 px (leaves room for tiles + labels)
const BAR_MAX_NATIVE = 316
const BAR_RENDER_MAX = 290
const BAR_SCALE = BAR_RENDER_MAX / BAR_MAX_NATIVE  // ≈ 0.918

export default function Page12() {
  const reduced = useReducedMotion()

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

          {/* ── Round 3 Results dialog ─────────────────────────────────── */}
          <motion.div
            style={{ marginBottom: '10px' }}
            initial={reduced ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {/* Title bar + close button */}
            <div style={{ position: 'relative' }}>
              <img
                src={ResultsBar}
                alt="Round 3 Results"
                style={{ display: 'block', width: '100%', height: `${RESULTS_BAR_H}px`, objectFit: 'fill' }}
              />
              <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)' }}>
                <motion.div
                  style={{ cursor: 'pointer' }}
                  whileHover={reduced ? {} : { scale: 1.15, transition: { duration: 0.18 } }}
                >
                  <img src={CloseBtn} alt="Close" style={{ display: 'block', width: '45px', height: '45px' }} />
                </motion.div>
              </div>
            </div>

            {/* Three cards row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px 0',
            }}>
              {/* Your Answer */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <img
                  src={YourAnswerCard}
                  alt="Your Answer: Platinum"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </motion.div>

              {/* Points */}
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.28 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <img
                  src={PointsCard}
                  alt="Points: 50"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </motion.div>

              {/* Correct Answer */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.36 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <img
                  src={CorrectCard}
                  alt="Correct Answer: Gold"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
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
            {/* Background */}
            <img
              src={VotingBg}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />

            {/* Content overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '14px 22px 14px',
            }}>

              {/* Title row: "Voting Statistics" + "79 votes" */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '14px', flexShrink: 0, marginBottom: '6px' }}>
                <span
                  className="font-beaufort font-bold"
                  style={{
                    fontSize: '35px',
                    lineHeight: 1,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Voting Statistics
                </span>
                <span
                  className="font-beaufort font-bold"
                  style={{
                    fontSize: '35px',
                    lineHeight: 1,
                    background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  79 votes
                </span>
              </div>

              {/* Separator line */}
              <img
                src={Line2}
                alt=""
                style={{ display: 'block', width: '100%', height: '2px', flexShrink: 0, marginBottom: '8px' }}
              />

              {/* Chart area — bars + tiles */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                paddingBottom: '10px',
                minHeight: 0,
              }}>
                {RANK_TILES.map((tileSrc, i) => {
                  const bar = BARS[i]
                  const renderedBarH = bar ? Math.round(bar.nativeH * BAR_SCALE) : 0
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {/* Bar + cap + label */}
                      {bar && (
                        <>
                          <span
                            className="font-beaufort font-bold"
                            style={{
                              fontSize: '11px',
                              lineHeight: 1,
                              marginBottom: '3px',
                              color: '#E8EDF5',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {bar.label}
                          </span>
                          <img
                            src={bar.cap}
                            alt=""
                            style={{ display: 'block', width: '82%', height: '8px', objectFit: 'fill' }}
                          />
                          <motion.img
                            src={bar.src}
                            alt=""
                            style={{
                              display: 'block',
                              width: '82%',
                              height: `${renderedBarH}px`,
                              objectFit: 'fill',
                            }}
                            initial={reduced ? false : { scaleY: 0, originY: 1 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 + i * 0.055, ease: 'easeOut' }}
                          />
                        </>
                      )}

                      {/* Rank tile */}
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
                <img
                  src={ViewResultBtn}
                  alt="View Results"
                  style={{ display: 'block', width: '353px', height: '65px' }}
                />
              </motion.button>
            </motion.div>
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
