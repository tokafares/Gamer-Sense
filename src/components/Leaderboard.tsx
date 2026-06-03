import { motion, useReducedMotion } from 'framer-motion'
import PrizeDraw from '../assets/Group 391.svg'
import ViewBtn   from '../assets/Group 390.svg'
import { scrollFadeUp, scrollFadeIn, staggerContainer, slideFromLeft } from '../lib/animations'
import { useLeaderboard } from '../hooks/useLeaderboard'

export default function Leaderboard() {
  const reduced = useReducedMotion()
  const vp = { once: true }
  const { entries, loading, error } = useLeaderboard()

  return (
    <section className="w-full py-[80px] flex flex-col items-center">

      {/* ── Heading ── */}
      <motion.div
        className="relative text-center"
        variants={scrollFadeUp}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      >
        <h2
          className="font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          style={{ mixBlendMode: 'multiply' as const }}
        >
          Leaderboard
        </h2>
        <h2
          className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          aria-hidden="true"
        >
          Leaderboard
        </h2>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        className="w-[1111px] mt-[40px] overflow-hidden"
        style={{ border: '1px solid #1E3A5F' }}
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
        transition={{ delay: 0.2 }}
      >
        {/* Column headers */}
        <div
          className="bg-gs-card grid grid-cols-4"
          style={{ borderBottom: '1px solid #1E3A5F', padding: '20px 32px' }}
        >
          {['Rank', 'Player Name', 'Points', 'Tier'].map(h => (
            <span
              key={h}
              className="text-gs-teal font-bold text-center uppercase"
              style={{ fontSize: '14px', letterSpacing: '1.5px' }}
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
                  className="grid grid-cols-4 text-center"
                  style={{
                    padding: '16px 32px',
                    background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                  }}
                >
                  {[28, 55, 35, 45].map((w, j) => (
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
              viewport={vp}
            >
              {entries.map((row, i) => (
                <motion.div
                  key={row.rank}
                  variants={slideFromLeft}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="grid grid-cols-4 text-center"
                  style={{
                    padding: '16px 32px',
                    fontSize: '14px',
                    background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                  }}
                >
                  <span className="text-gs-textMuted">{row.rank}</span>
                  <span className="text-gs-text">{row.username}</span>
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
        viewport={vp}
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
        viewport={vp}
        transition={{ delay: 0.5 }}
        whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
        whileTap={reduced ? {} : { scale: 0.97 }}
      />

    </section>
  )
}
