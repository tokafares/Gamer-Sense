import { useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import { useGameStore } from '../store/gameStore'

// ── Round Results dialog SVG frames ────────────────────────────────────────
import ResultsBar      from '../assets/Group 370.svg'
import CardFrame       from '../assets/Group 375.svg'   // clean answer-card frame (empty pill)
import PointsCard      from '../assets/Group 349.svg'

// ── Rank emblems — overlaid inside the card pill so each card shows the ──────
// actual voted / correct rank instead of a baked-in fixed emblem.
import EmblemIron       from '../assets/rank-iron.png'
import EmblemBronze     from '../assets/rank-bronze.png'
import EmblemSilver     from '../assets/rank-silver.png'
import EmblemGold       from '../assets/rank-gold.png'
import EmblemEmerald    from '../assets/rank-emerald.png'
import EmblemPlatinum   from '../assets/rank-platinum.png'
import EmblemDiamond    from '../assets/rank-diamond.png'
import EmblemMaster     from '../assets/rank-master.png'
import EmblemChallenger from '../assets/rank-challenger.png'

const RANK_EMBLEM: Record<string, string> = {
  iron:       EmblemIron,
  bronze:     EmblemBronze,
  silver:     EmblemSilver,
  gold:       EmblemGold,
  emerald:    EmblemEmerald,
  platinum:   EmblemPlatinum,
  diamond:    EmblemDiamond,
  master:     EmblemMaster,
  challenger: EmblemChallenger,
}

// Pill region inside Group 375.svg (viewBox 376×418), as % of the card box —
// the emblem is centred here so it sits within the teal ring.
const PILL = { left: '15.3%', top: '19.1%', width: '69.4%', height: '34.2%' }

// ── Voting statistics ───────────────────────────────────────────────────────
import VotingBg        from '../assets/voting statisticsBg.svg'

import Line2 from '../assets/Line 2.svg'

// ── Rank tiles ──────────────────────────────────────────────────────────────
import RankTile1 from '../assets/Group _342.svg'
import RankTile2 from '../assets/Group _341.svg'
import RankTile3 from '../assets/Group _340.svg'
import RankTile4 from '../assets/Group _339.svg'
import RankTile5 from '../assets/Group _338.svg'
import RankTile6 from '../assets/Group _337.svg'
import RankTile7 from '../assets/Group 354.svg'
import RankTile8 from '../assets/Group 355.svg'
import RankTile9 from '../assets/Group 356.svg'

const VOTING_BG_RATIO  = 519  / 1266
const RESULTS_BAR_H    = 69

const RANK_TILES = [
  RankTile1, RankTile2, RankTile3, RankTile4, RankTile5,
  RankTile6, RankTile7, RankTile8, RankTile9,
]

const RANKS = ['iron', 'bronze', 'silver', 'gold', 'emerald', 'platinum', 'diamond', 'master', 'challenger']

const BAR_RENDER_MAX = 290

// ── GTR Results UI ──────────────────────────────────────────────────────────

const GTRResults = memo(function GTRResults() {
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const { points, answers, currentRound, totalRounds, gtrResult, advanceRound, resetGame } = useGameStore()
  const completedRound = answers.length || currentRound

  const votedRank   = gtrResult?.votedRank   ?? ''
  const correctRank = gtrResult?.correctRank ?? ''
  const totalVotes  = gtrResult?.totalVotes  ?? 0
  const percentages = gtrResult?.percentages ?? {}

  const votedEmblem   = RANK_EMBLEM[votedRank.toLowerCase()]
  const correctEmblem = RANK_EMBLEM[correctRank.toLowerCase()]

  const isLastRound = completedRound >= totalRounds
  const goNextRound = () => {
    advanceRound()
    navigate('/match', { state: { continueGame: true } })
  }
  const finishGame = () => {
    // Exit / Finish → back to the Guess Rank page, starting a fresh game.
    resetGame()
    navigate('/match')
  }

  const bars = useMemo(() => {
    const maxPct = Math.max(...RANKS.map(r => percentages[r] ?? 0), 1)
    return RANKS.map(rank => {
      const pct = percentages[rank] ?? 0
      return {
        rank,
        pct,
        height: Math.round((pct / maxPct) * BAR_RENDER_MAX),
        isVoted:   rank.toLowerCase() === votedRank.toLowerCase(),
        isCorrect: rank.toLowerCase() === correctRank.toLowerCase(),
      }
    })
  }, [percentages, votedRank, correctRank])

  return (
    <>
      {/* ── Round Results dialog ─────────────────────────────────── */}
      <motion.div
        style={{ marginBottom: '10px' }}
        initial={reduced ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={ResultsBar}
            alt=""
            style={{ display: 'block', width: '100%', height: `${RESULTS_BAR_H}px`, objectFit: 'fill' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span
              className="font-beaufort font-bold"
              style={{
                fontSize: 30, lineHeight: 1,
                paddingBottom: '4px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Round {completedRound} Results
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
          {/* Your Answer */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={CardFrame} alt="Your Answer" style={{ display: 'block', width: '100%', height: 'auto' }} />
            {/* Voted-rank emblem inside the pill (dynamic per round) */}
            {votedEmblem && (
              <div style={{
                position: 'absolute',
                left: PILL.left, top: PILL.top, width: PILL.width, height: PILL.height,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <img src={votedEmblem} alt={votedRank} style={{ maxWidth: '78%', maxHeight: '82%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10%', gap: 6, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 31.31, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Your Answer</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 35, lineHeight: 1, textTransform: 'capitalize',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{votedRank || '—'}</span>
            </div>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={PointsCard} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 50, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Points</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 50, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFCA3A, #AD7600)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{points}</span>
            </div>
          </motion.div>

          {/* Correct Answer */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <img src={CardFrame} alt="Correct Answer" style={{ display: 'block', width: '100%', height: 'auto' }} />
            {/* Correct-rank emblem inside the pill (dynamic per round) */}
            {correctEmblem && (
              <div style={{
                position: 'absolute',
                left: PILL.left, top: PILL.top, width: PILL.width, height: PILL.height,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <img src={correctEmblem} alt={correctRank} style={{ maxWidth: '78%', maxHeight: '82%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10%', gap: 6, pointerEvents: 'none',
            }}>
              <span className="font-beaufort font-bold" style={{
                fontSize: 31.31, lineHeight: 1,
                background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Correct Answer</span>
              <span className="font-beaufort font-bold" style={{
                fontSize: 35, lineHeight: 1, textTransform: 'capitalize',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{correctRank || '—'}</span>
            </div>
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
        <img src={VotingBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          padding: '14px 22px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '14px', flexShrink: 0, marginBottom: '6px' }}>
            <span className="font-beaufort font-bold" style={{
              fontSize: '35px', lineHeight: 1, paddingBottom: '4px',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Voting Statistics</span>
            <span className="font-beaufort font-bold" style={{
              fontSize: '35px', lineHeight: 1,
              background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{totalVotes > 0 ? `${totalVotes} votes` : '— votes'}</span>
          </div>

          <img src={Line2} alt="" style={{ display: 'block', width: '100%', height: '2px', flexShrink: 0, marginBottom: '8px' }} />

          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '10px', minHeight: 0 }}>
            {RANK_TILES.map((tileSrc, i) => {
              const bar = bars[i]
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {bar && (
                    <>
                      <span className="font-beaufort font-bold" style={{ fontSize: '11px', lineHeight: 1, marginBottom: '3px', color: '#E8EDF5', letterSpacing: '0.02em' }}>
                        {bar.pct}%
                      </span>
                      <div style={{
                        width: '82%', height: '6px', borderRadius: '2px 2px 0 0',
                        background: bar.isVoted ? '#00C9A7' : bar.isCorrect ? '#C9A227' : '#8FA3C0',
                      }} />
                      <motion.div
                        style={{
                          width: '82%', height: `${Math.max(bar.height, 4)}px`,
                          background: bar.isVoted
                            ? 'linear-gradient(to top, #007A67, #00C9A7)'
                            : bar.isCorrect
                              ? 'linear-gradient(to top, #8B6F1A, #C9A227)'
                              : 'linear-gradient(to top, #0D1F3C, #1E3A5F)',
                          borderRadius: '0 0 2px 2px',
                        }}
                        initial={reduced ? false : { scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.055, ease: 'easeOut' }}
                      />
                    </>
                  )}
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

      {/* ── Next round / Finish button ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <motion.button
            whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
            onClick={isLastRound ? finishGame : goNextRound}
            className="font-beaufort font-bold"
            style={{
              display: 'block', cursor: 'pointer',
              padding: '15px 52px', border: 'none', borderRadius: 6,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              color: '#060F1E', fontSize: 19, letterSpacing: '0.06em',
              boxShadow: '0 6px 20px rgba(0,167,173,0.35)',
            }}
          >
            {isLastRound ? 'Finish' : `Go to Next Round  (${completedRound + 1}/${totalRounds})`}
          </motion.button>
        </motion.div>
      </div>
    </>
  )
})

// ── Page12 ──────────────────────────────────────────────────────────────────

export default function Page12() {
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
          <GTRResults />
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
