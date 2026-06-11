import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import PrizeDraw from '../assets/Group 391.svg'
import ViewBtn   from '../assets/Group 390.svg'
import { scrollFadeUp, scrollFadeIn, staggerContainer, slideFromLeft } from '../lib/animations'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { levelFromPoints } from '../lib/level'
import { useIsMobile } from '../hooks/useIsMobile'

const VP = { once: true }
const SKELETON_WIDTHS = [22, 48, 30, 32, 40]

export default memo(function Leaderboard() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const { entries, loading, error } = useLeaderboard()
  const cellPad = isMobile ? '12px 12px' : '20px 32px'
  const rowPad  = isMobile ? '12px 12px' : '16px 32px'

  return (
    <section className="w-full flex flex-col items-center" style={{ padding: isMobile ? '48px 16px' : '80px 0' }}>

      {/* ── Heading ── */}
      <motion.div
        className="relative text-center"
        variants={scrollFadeUp}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={VP}
      >
        <h2
          className="font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          style={{ mixBlendMode: 'multiply' as const, fontSize: isMobile ? '44px' : undefined }}
        >
          Leaderboard
        </h2>
        <h2
          className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          style={{ fontSize: isMobile ? '44px' : undefined }}
          aria-hidden="true"
        >
          Leaderboard
        </h2>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        className="mt-[40px] overflow-hidden"
        style={{ border: '1px solid #1E3A5F', width: isMobile ? '100%' : '1111px', maxWidth: '1111px' }}
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={VP}
        transition={{ delay: 0.2 }}
      >
        {/* Column headers */}
        <div
          className="bg-gs-card grid grid-cols-5"
          style={{ borderBottom: '1px solid #1E3A5F', padding: cellPad }}
        >
          {['Rank', 'Player Name', 'Level', 'Points', 'Tier'].map(h => (
            <span
              key={h}
              className="text-gs-teal font-bold text-center uppercase"
              style={{ fontSize: isMobile ? '10px' : '14px', letterSpacing: isMobile ? '0.5px' : '1.5px' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Body — minHeight prevents collapse in loading and error states */}
        <div style={{ minHeight: '260px' }}>
          {loading ? (
            /* Skeleton — single pulsing wrapper, respects reduced motion */
            <motion.div
              animate={reduced ? {} : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 text-center"
                  style={{
                    padding: rowPad,
                    background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                  }}
                >
                  {SKELETON_WIDTHS.map((w, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        height: '20px',
                        width: `${w}%`,
                        background: '#1E3A5F',
                        borderRadius: 3,
                      }} />
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : error ? (
            /* Error — centred inside fixed-height area so frame doesn't collapse */
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '260px',
            }}>
              <span className="text-gs-textMuted" style={{ fontSize: '14px' }}>
                {error}
              </span>
            </div>
          ) : (
            /* Live data rows */
            <motion.div
              variants={staggerContainer}
              initial={reduced ? false : 'hidden'}
              whileInView="show"
              viewport={VP}
            >
              {entries.map((row, i) => (
                <motion.div
                  key={row.rank}
                  variants={slideFromLeft}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="grid grid-cols-5 text-center"
                  style={{
                    padding: rowPad,
                    fontSize: isMobile ? '11px' : '14px',
                    background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                  }}
                >
                  <span className="text-gs-textMuted">{row.rank}</span>
                  <span className="text-gs-text">{row.username}</span>
                  <span className="text-gs-teal font-bold">Lv {levelFromPoints(row.points)}</span>
                  <span className="text-gs-text">{row.points.toLocaleString()}</span>
                  <span className="text-gs-textMuted">{row.tier}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Prize Draw — unchanged ── */}
      <motion.img
        src={PrizeDraw}
        className="w-[1111px] h-[206px] object-contain mt-[16px]"
        alt="Prize Draw"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={VP}
        transition={{ delay: 0.35 }}
      />

      {/* ── View button — unchanged ── */}
      <motion.img
        src={ViewBtn}
        className="w-[236px] h-[65px] object-contain mt-[32px] cursor-pointer"
        alt="View"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={VP}
        transition={{ delay: 0.5 }}
        whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
        whileTap={reduced ? {} : { scale: 0.97 }}
      />

    </section>
  )
})
