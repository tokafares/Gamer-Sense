import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine   from '../assets/Rectangle 6.svg'
import RoundBg         from '../assets/RoundBg.svg'
import RoundText       from '../assets/Group 364.svg'
import FlagIcon        from '../assets/Flag Group171.svg'
import GameFrame       from '../assets/Group 353.svg'
import RankContainer   from '../assets/Group 365.svg'
import RankTile1       from '../assets/Group _337.svg'
import RankTile2       from '../assets/Group _338.svg'
import RankTile3       from '../assets/Group _339.svg'
import RankTile4       from '../assets/Group _340.svg'
import RankTile5       from '../assets/Group _341.svg'
import RankTile6       from '../assets/Group _342.svg'
import RankTile7       from '../assets/Group 354.svg'
import RankTile8       from '../assets/Group 355.svg'
import RankTile9       from '../assets/Group 356.svg'
import SubmitBtn       from '../assets/submit button 359.svg'

const RANK_TILES = [
  RankTile1, RankTile2, RankTile3, RankTile4, RankTile5,
  RankTile6, RankTile7, RankTile8, RankTile9,
]

// Native SVG aspect ratios — used for proportional paddingTop trick
const GAME_RATIO = 786  / 1350   // Group 353 — ≈ 0.582
const RANK_RATIO = 198  / 1361   // Group 365 — ≈ 0.145
const ROUND_H    = 65            // RoundBg native height (px)

export default function Page11() {
  const reduced  = useReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)

  function toggle(i: number) {
    setSelected(prev => (prev === i ? null : i))
  }

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

          {/* ── Round bar ── */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Bar background + text overlay */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative', height: `${ROUND_H}px` }}>
              <img
                src={RoundBg}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
              <img
                src={RoundText}
                alt="Round 3/3 ◆◆◆ Points 13"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1.2%',
                  width: '97.5%',
                  height: 'auto',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            {/* Flag icon — right end */}
            <img
              src={FlagIcon}
              alt=""
              style={{ width: '63px', height: '63px', flexShrink: 0, display: 'block' }}
            />
          </motion.div>

          {/* ── Game screenshot frame ── */}
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: `${GAME_RATIO * 100}%` }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <img
              src={GameFrame}
              alt="Game screenshot"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          </motion.div>

          {/* ── Rank picker container + tiles ── */}
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: `${RANK_RATIO * 100}%`, marginTop: '8px' }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            {/* Container background */}
            <img
              src={RankContainer}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />

            {/* Tiles row */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              padding: '7px 14px',
              boxSizing: 'border-box',
            }}>
              {RANK_TILES.map((src, i) => (
                // Outer div: entry animation
                <motion.div
                  key={i}
                  style={{ position: 'relative', flexShrink: 0 }}
                  initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.32, delay: 0.42 + i * 0.045 }}
                >
                  {/* Inner div: hover + click */}
                  <motion.div
                    role="button"
                    tabIndex={0}
                    aria-label={`Rank option ${i + 1}`}
                    aria-pressed={selected === i}
                    onClick={() => toggle(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggle(i) }}
                    style={{ cursor: 'pointer', outline: 'none', position: 'relative', display: 'block' }}
                    whileHover={reduced ? {} : { scale: 1.1, y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{ display: 'block', height: '120px', width: 'auto' }}
                    />

                    {/* Selection highlight */}
                    {selected === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          border: '2px solid #3AF9FF',
                          background: 'rgba(58,249,255,0.08)',
                          boxShadow: '0 0 18px rgba(58,249,255,0.45)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Submit button ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            {/* Outer: entry */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.88 }}
            >
              {/* Inner: hover */}
              <motion.button
                whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
              >
                <img
                  src={SubmitBtn}
                  alt="Submit"
                  style={{ display: 'block', width: '270px', height: '65px' }}
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
