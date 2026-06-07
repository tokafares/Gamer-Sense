import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import { useGameStore } from '../store/gameStore'

const RANKS_ORDER = [
  'iron', 'bronze', 'silver', 'gold', 'platinum',
  'emerald', 'diamond', 'master', 'grandmaster', 'challenger',
]
const BAR_MAX_H = 160   // px — tallest bar

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const { gtrResult } = useGameStore()

  const bars = useMemo(() => {
    if (!gtrResult) return null
    const { percentages, votedRank, correctRank } = gtrResult
    const maxPct = Math.max(...RANKS_ORDER.map(r => percentages[r] ?? 0), 1)
    return RANKS_ORDER.map(rank => ({
      rank,
      pct:       Math.round(percentages[rank] ?? 0),
      height:    Math.round(((percentages[rank] ?? 0) / maxPct) * BAR_MAX_H),
      isVoted:   rank === votedRank,
      isCorrect: rank === correctRank,
    }))
  }, [gtrResult])

  const correctPct = gtrResult
    ? Math.round(gtrResult.percentages[gtrResult.correctRank] ?? 0)
    : null

  const isYouTube = gtrResult?.imageUrl.startsWith('https://www.youtube.com/embed/')

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 900,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '48px 24px 80px',
        }}>

          {/* ── Heading ── */}
          <motion.h1
            className="font-beaufort font-bold"
            style={{
              fontSize: 48,
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 32,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={reduced ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Guess The Rank — Results
          </motion.h1>

          {!gtrResult ? (
            /* No result yet — user hasn't voted */
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 10, padding: '48px 32px', textAlign: 'center',
              }}
            >
              <p style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, marginBottom: 24 }}>
                You haven&apos;t voted on a round yet.
              </p>
              <button
                onClick={() => navigate('/page11')}
                style={{
                  padding: '12px 32px', background: '#00C9A7', color: '#060F1E',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 15, letterSpacing: '0.1em',
                }}
              >
                PLAY GTR
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {/* ── Video / Image ── */}
              <div style={{ marginBottom: 24 }}>
                {isYouTube ? (
                  <iframe
                    src={gtrResult.imageUrl}
                    title="GTR Round"
                    width="100%"
                    height="460"
                    style={{ display: 'block', border: 'none', borderRadius: 8 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={gtrResult.imageUrl}
                    alt="GTR Round"
                    style={{ display: 'block', width: '100%', borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
              </div>

              {/* ── Summary row ── */}
              <div style={{
                display: 'flex', gap: 32, marginBottom: 24,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
                flexWrap: 'wrap',
              }}>
                <span style={{ color: '#8FA3C0' }}>
                  Correct Rank:{' '}
                  <span style={{ color: '#C9A227', fontWeight: 700, textTransform: 'capitalize', fontSize: 18 }}>
                    {gtrResult.correctRank}
                  </span>
                </span>
                <span style={{ color: '#8FA3C0' }}>
                  Your pick:{' '}
                  <span style={{
                    color: gtrResult.votedRank === gtrResult.correctRank ? '#00C9A7' : '#ef4444',
                    fontWeight: 700, textTransform: 'capitalize', fontSize: 18,
                  }}>
                    {gtrResult.votedRank}
                  </span>
                </span>
                <span style={{ color: '#8FA3C0' }}>
                  % Correct:{' '}
                  <span style={{ color: '#00C9A7', fontWeight: 700, fontSize: 18 }}>{correctPct}%</span>
                </span>
                <span style={{ color: '#8FA3C0' }}>
                  Total Votes:{' '}
                  <span style={{ color: '#E8EDF5', fontWeight: 700, fontSize: 18 }}>{gtrResult.totalVotes}</span>
                </span>
              </div>

              {/* ── Bar chart ── */}
              {bars && (
                <div style={{
                  background: '#0D1F3C', border: '1px solid #1E3A5F',
                  borderRadius: 10, padding: '20px 20px 16px',
                  marginBottom: 28,
                }}>
                  <span className="font-beaufort font-bold" style={{
                    fontSize: 18, display: 'block', marginBottom: 16,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    Voting Statistics
                  </span>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: BAR_MAX_H + 40 }}>
                    {bars.map((bar, i) => (
                      <motion.div
                        key={bar.rank}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 * i }}
                      >
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: '#E8EDF5', marginBottom: 3, lineHeight: 1 }}>
                          {bar.pct > 0 ? `${bar.pct}%` : ''}
                        </span>
                        <motion.div
                          style={{
                            width: '100%',
                            height: `${Math.max(bar.height, bar.pct > 0 ? 4 : 0)}px`,
                            background: bar.isCorrect
                              ? 'linear-gradient(to top, #8B6F1A, #C9A227)'
                              : bar.isVoted
                                ? 'linear-gradient(to top, #007A67, #00C9A7)'
                                : 'linear-gradient(to top, #0D1F3C, #1E3A5F)',
                            borderRadius: '3px 3px 0 0',
                            borderTop: `3px solid ${bar.isCorrect ? '#C9A227' : bar.isVoted ? '#00C9A7' : '#1E3A5F'}`,
                          }}
                          initial={reduced ? false : { scaleY: 0, originY: 1 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 + i * 0.04, ease: 'easeOut' }}
                        />
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, marginTop: 5,
                          textTransform: 'capitalize', letterSpacing: '0.02em',
                          color: bar.isCorrect ? '#C9A227' : bar.isVoted ? '#00C9A7' : '#8FA3C0',
                        }}>
                          {bar.rank.slice(0, 3)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12 }}>
                    <span style={{ color: '#C9A227' }}>■ Correct rank</span>
                    <span style={{ color: '#00C9A7' }}>■ Your pick</span>
                  </div>
                </div>
              )}

              {/* ── Play Again ── */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  onClick={() => navigate('/page11')}
                  whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
                  style={{
                    padding: '14px 48px',
                    background: 'linear-gradient(to right, #00C9A7, #0090A7)',
                    color: '#060F1E', border: 'none', borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 16, letterSpacing: '0.12em',
                  }}
                >
                  PLAY AGAIN
                </motion.button>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
