import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine   from '../assets/Rectangle 6.svg'
import RoundBg  from '../assets/RoundBg.svg'
import FlagIcon from '../assets/Flag Group171.svg'
import { useGameStore } from '../store/gameStore'
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

const RANKS_ORDER = ['iron','bronze','silver','gold','platinum','emerald','diamond','master','grandmaster','challenger']
const BAR_MAX_H = 100  // px

export default function Page11() {
  const reduced  = useReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)
  const { currentRound, totalRounds, points, gtrResult } = useGameStore()

  // Voting statistics derived from gtrResult
  const bars = useMemo(() => {
    if (!gtrResult) return null
    const { percentages, votedRank, correctRank } = gtrResult
    const maxPct = Math.max(...RANKS_ORDER.map(r => percentages[r] ?? 0), 1)
    return RANKS_ORDER.map(rank => ({
      rank,
      pct: percentages[rank] ?? 0,
      height: Math.round(((percentages[rank] ?? 0) / maxPct) * BAR_MAX_H),
      isVoted:   rank === votedRank,
      isCorrect: rank === correctRank,
    }))
  }, [gtrResult])

  const correctPct = gtrResult
    ? (gtrResult.percentages[gtrResult.correctRank] ?? 0)
    : null

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
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1.2%',
                  width: '97.5%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                }}
              >
                <span className="font-beaufort font-bold" style={{ fontSize: 17, color: '#E8EDF5', lineHeight: 1 }}>
                  Round {currentRound}/{totalRounds}
                </span>
                <span style={{ color: '#C9A227', fontSize: 18, letterSpacing: 4, lineHeight: 1 }}>
                  {Array.from({ length: totalRounds }, (_, i) => i < currentRound ? '◆' : '◇').join(' ')}
                </span>
                <span className="font-beaufort font-bold" style={{ fontSize: 17, color: '#00C9A7', lineHeight: 1 }}>
                  Points {points}
                </span>
              </div>
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

          {/* ── Voting statistics — shown after user has voted (gtrResult populated) ── */}
          {bars && gtrResult && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ marginTop: 16, background: '#0D1F3C', border: '1px solid #1E3A5F', borderRadius: 8, padding: '20px 24px' }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="font-beaufort font-bold" style={{
                  fontSize: 18,
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Voting Statistics
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#8FA3C0', letterSpacing: '0.08em' }}>
                  {gtrResult.totalVotes} TOTAL ATTEMPTS
                </span>
              </div>

              {/* Summary row */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
                <span style={{ color: '#8FA3C0' }}>
                  Correct Rank: <span style={{ color: '#C9A227', fontWeight: 700, textTransform: 'capitalize' }}>{gtrResult.correctRank}</span>
                </span>
                <span style={{ color: '#8FA3C0' }}>
                  % Correct: <span style={{ color: '#00C9A7', fontWeight: 700 }}>{correctPct}%</span>
                </span>
              </div>

              {/* Bar chart */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: BAR_MAX_H + 36 }}>
                {bars.map(bar => (
                  <div key={bar.rank} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#E8EDF5',
                      marginBottom: 3, lineHeight: 1,
                    }}>
                      {bar.pct > 0 ? `${bar.pct}%` : ''}
                    </span>
                    <motion.div
                      style={{
                        width: '100%',
                        height: `${Math.max(bar.height, bar.pct > 0 ? 4 : 0)}px`,
                        background: bar.isVoted
                          ? 'linear-gradient(to top, #007A67, #00C9A7)'
                          : bar.isCorrect
                            ? 'linear-gradient(to top, #8B6F1A, #C9A227)'
                            : 'linear-gradient(to top, #0D1F3C, #1E3A5F)',
                        borderRadius: '2px 2px 0 0',
                        borderTop: `3px solid ${bar.isVoted ? '#00C9A7' : bar.isCorrect ? '#C9A227' : '#1E3A5F'}`,
                      }}
                      initial={reduced ? false : { scaleY: 0, originY: 1 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      color: bar.isVoted ? '#00C9A7' : bar.isCorrect ? '#C9A227' : '#8FA3C0',
                      marginTop: 4, textTransform: 'capitalize', letterSpacing: '0.03em',
                    }}>
                      {bar.rank.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11 }}>
                <span style={{ color: '#00C9A7' }}>■ Your pick</span>
                <span style={{ color: '#C9A227' }}>■ Correct rank</span>
              </div>
            </motion.div>
          )}

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
