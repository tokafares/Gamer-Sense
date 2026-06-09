import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import RoundBg       from '../assets/RoundBg.svg'
import FlagIcon      from '../assets/Flag Group171.svg'
import RankContainer from '../assets/Group 365.svg'
import RankTile1     from '../assets/Group _342.svg'
import RankTile2     from '../assets/Group _341.svg'
import RankTile3     from '../assets/Group _340.svg'
import RankTile4     from '../assets/Group _339.svg'
import RankTile5     from '../assets/Group _338.svg'
import RankTile6     from '../assets/Group _337.svg'
import RankTile7     from '../assets/Group 354.svg'
import RankTile8     from '../assets/Group 355.svg'
import RankTile9     from '../assets/Group 356.svg'
import SubmitBtn     from '../assets/submit button 359.svg'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { useGTRRound }  from '../hooks/useGTRRound'
import { connectSocket, disconnectSocket } from '../lib/socket'

const RANK_TILES = [
  RankTile1, RankTile2, RankTile3, RankTile4, RankTile5,
  RankTile6, RankTile7, RankTile8, RankTile9,
]

const RANKS_ORDER = [
  'iron', 'bronze', 'silver', 'gold', 'emerald',
  'platinum', 'diamond', 'master', 'challenger',
]

const RANK_RATIO = 198 / 1361   // Group 365 aspect ratio
const ROUND_H    = 65

function isCloudinaryVideo(url: string): boolean {
  return url.includes('cloudinary.com') && url.endsWith('.mp4')
}

const TOTAL_GTR_ROUNDS = 3

export default function Page11() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const [selected,    setSelected]    = useState<number | null>(null)
  const [localRound,  setLocalRound]  = useState(1)
  const [advancing,   setAdvancing]   = useState(false)
  const { points, opponentScore, gtrResult, matchId, addPoints, setGTRResult, clearMatch, resetGame } = useGameStore()
  const { user } = useAuthStore()
  const [imgError, setImgError] = useState(false)
  const isDuel = !!matchId
  const voteEmitted = useRef(false)

  // Reset game state on first mount for solo mode
  useEffect(() => {
    if (!isDuel) resetGame()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { round, loading, error, voted, submitVote, result: voteResult, stats } = useGTRRound(localRound)

  const handleSubmit = useCallback(() => {
    if (selected === null || !round || voted) return
    void submitVote(RANKS_ORDER[selected])
  }, [selected, round, voted, submitVote])

  // Reset selection + image error when a new round loads
  useEffect(() => { setImgError(false); setSelected(null) }, [round?.id])

  // When vote + stats both arrive — update store, then advance or finish
  useEffect(() => {
    if (!voteResult || !stats || !round) return

    addPoints(voteResult.pointsEarned)
    setGTRResult({
      roundId:     round.id,
      imageUrl:    round.imageUrl,
      votedRank:   voteResult.votedRank,
      correctRank: voteResult.correctRank,
      totalVotes:  stats.totalVotes,
      percentages: stats.percentages,
    })

    if (isDuel && matchId && !voteEmitted.current) {
      voteEmitted.current = true
      connectSocket().emit('gtr:vote', { matchId, pointsEarned: voteResult.pointsEarned })
      // Wait for match:end — backend drives next round in duel mode
    } else if (!isDuel) {
      if (localRound < TOTAL_GTR_ROUNDS) {
        // Show result briefly, then advance to next round
        setAdvancing(true)
        setTimeout(() => {
          setAdvancing(false)
          setLocalRound(r => r + 1)
        }, 2500)
      } else {
        // All 3 rounds done — go to results
        setTimeout(() => navigate('/results'), 2500)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteResult, stats])

  // In duel mode: listen for match:end and navigate to winner screen
  useEffect(() => {
    if (!isDuel || !matchId) return
    const socket = connectSocket()
    socket.on('match:end', (d: { winnerId: string; hostScore: number; invitedScore: number }) => {
      clearMatch()
      disconnectSocket()
      navigate('/match-winner', { state: d })
    })
    return () => { socket.off('match:end') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuel, matchId])

  const toggle = useCallback((i: number) => {
    if (voted) return
    setSelected(prev => (prev === i ? null : i))
  }, [voted])

  const totalRounds = TOTAL_GTR_ROUNDS

  const isYouTube = round?.imageUrl?.startsWith('https://www.youtube.com/embed/') ?? false
  const isPlaceholderUrl = !round?.imageUrl ||
    round.imageUrl.includes('placehold.co') ||
    round.imageUrl.includes('placeholder') ||
    !round.imageUrl.startsWith('http')

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

          {/* ── 1v1 scoreboard — duel mode only ── */}
          {isDuel && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0A1628', border: '1px solid #1E3A5F',
                borderRadius: 8, padding: '14px 28px', marginBottom: 12,
              }}
            >
              {/* My side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#1E3A5F', overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="#3AF9FF" opacity="0.5"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#3AF9FF" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-beaufort font-bold" style={{ fontSize: 15, color: '#E8EDF5', lineHeight: 1 }}>{user?.username ?? 'You'}</div>
                  <div className="font-beaufort font-bold" style={{ fontSize: 26, color: '#3AF9FF', lineHeight: 1.1 }}>{points}</div>
                </div>
              </div>

              {/* VS */}
              <span className="font-beaufort font-bold" style={{
                fontSize: 36, fontStyle: 'italic',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>VS</span>

              {/* Opponent side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#1E3A5F', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#8FA3C0" opacity="0.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#8FA3C0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-beaufort font-bold" style={{ fontSize: 15, color: '#E8EDF5', lineHeight: 1 }}>Opponent</div>
                  <div className="font-beaufort font-bold" style={{ fontSize: 26, color: '#8FA3C0', lineHeight: 1.1 }}>{opponentScore}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Round bar ── */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div style={{ flex: 1, minWidth: 0, position: 'relative', height: `${ROUND_H}px` }}>
              <img src={RoundBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div style={{
                position: 'absolute', top: '50%', left: '1.2%', width: '97.5%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', boxSizing: 'border-box',
              }}>
                <span className="font-beaufort font-bold" style={{ fontSize: 17, color: '#E8EDF5', lineHeight: 1 }}>
                  Round {localRound}/{totalRounds}
                </span>
                <span style={{ color: '#C9A227', fontSize: 18, letterSpacing: 4, lineHeight: 1 }}>
                  {Array.from({ length: totalRounds }, (_, i) => i < localRound ? '◆' : '◇').join(' ')}
                </span>
                <span className="font-beaufort font-bold" style={{ fontSize: 17, color: '#00C9A7', lineHeight: 1 }}>
                  Points {points}
                </span>
              </div>
            </div>
            <img src={FlagIcon} alt="" style={{ width: '63px', height: '63px', flexShrink: 0, display: 'block' }} />
          </motion.div>

          {/* ── GTR media — real video or image from the backend ── */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            style={{ width: '100%', marginBottom: 8 }}
          >
            {loading && (
              <div style={{
                width: '100%', height: 400,
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: '0.1em' }}>
                  Loading round…
                </span>
              </div>
            )}
            {error && (
              <div style={{
                width: '100%', height: 80,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#ef4444', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>{error}</span>
              </div>
            )}
            {!loading && !error && round && (
              isPlaceholderUrl ? (
                <div style={{
                  width: '100%', height: 400,
                  background: '#060F1E', border: '1px solid #1E3A5F',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 40, lineHeight: 1 }}>🎮</span>
                  <span className="font-beaufort font-bold" style={{ fontSize: 22, color: '#8FA3C0', letterSpacing: '0.08em' }}>
                    Video Coming Soon
                  </span>
                  <span style={{ color: '#1E3A5F', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
                    Select your rank guess below
                  </span>
                </div>
              ) : isCloudinaryVideo(round.imageUrl) ? (
                <video
                  key={round.id}
                  src={round.imageUrl}
                  autoPlay
                  muted
                  loop
                  controls
                  style={{ display: 'block', width: '100%', height: '460px', objectFit: 'cover', borderRadius: 6 }}
                />
              ) : isYouTube ? (
                <iframe
                  key={round.id}
                  src={`${round.imageUrl}?rel=0&modestbranding=1`}
                  title="Guess The Rank"
                  width="100%"
                  height="460"
                  style={{ display: 'block', border: 'none', borderRadius: 6 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : imgError ? (
                <div style={{
                  width: '100%', height: 400,
                  background: '#060F1E', border: '1px solid #1E3A5F',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 40, lineHeight: 1 }}>🎮</span>
                  <span className="font-beaufort font-bold" style={{ fontSize: 22, color: '#8FA3C0', letterSpacing: '0.08em' }}>
                    Video Coming Soon
                  </span>
                </div>
              ) : (
                <img
                  key={round.id}
                  src={round.imageUrl}
                  alt=""
                  onError={() => setImgError(true)}
                  style={{ display: 'block', width: '100%', borderRadius: 6, objectFit: 'cover' }}
                />
              )
            )}
          </motion.div>

          {/* ── Rank picker container + tiles ── */}
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: `${RANK_RATIO * 100}%`, marginTop: '8px' }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            <img src={RankContainer} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4% 1%', boxSizing: 'border-box', gap: '0.5%',
            }}>
              {RANK_TILES.map((src, i) => {
                const rankName  = RANKS_ORDER[i]
                const isCorrect = gtrResult?.correctRank === rankName
                const isVoted   = gtrResult?.votedRank   === rankName
                return (
                  <motion.div
                    key={i}
                    style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.32, delay: 0.42 + i * 0.045 }}
                  >
                    <motion.div
                      role="button"
                      tabIndex={0}
                      aria-label={rankName}
                      aria-pressed={selected === i}
                      onClick={() => toggle(i)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggle(i) }}
                      style={{ cursor: voted ? 'default' : 'pointer', outline: 'none', position: 'relative', display: 'block', width: '100%' }}
                      whileHover={reduced || voted ? {} : { scale: 1.08, y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                    >
                      <img src={src} alt={rankName} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />

                      {/* Selection highlight (pre-vote) */}
                      {!voted && selected === i && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
                          style={{
                            position: 'absolute', inset: 0,
                            border: '2px solid #3AF9FF',
                            background: 'rgba(58,249,255,0.08)',
                            boxShadow: '0 0 18px rgba(58,249,255,0.45)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Post-vote highlights */}
                      {voted && isVoted && !isCorrect && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #00C9A7', background: 'rgba(0,201,167,0.12)', pointerEvents: 'none' }} />
                      )}
                      {voted && isCorrect && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #C9A227', background: 'rgba(201,162,39,0.15)', pointerEvents: 'none' }} />
                      )}
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Next round countdown — solo mode, after voting, before advancing ── */}
          {voted && !isDuel && advancing && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 10, marginTop: 24, padding: '20px 0',
              }}
            >
              <motion.div
                animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#3AF9FF' }}
              />
              <span className="font-beaufort font-bold" style={{ fontSize: 20, color: '#3AF9FF' }}>
                {localRound < TOTAL_GTR_ROUNDS ? `Round ${localRound + 1} incoming…` : 'Calculating results…'}
              </span>
            </motion.div>
          )}

          {/* ── Waiting for opponent — duel mode, after voting ── */}
          {voted && isDuel && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 12, marginTop: 24, padding: '20px 0',
              }}
            >
              <motion.div
                animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#3AF9FF',
                }}
              />
              <span className="font-beaufort font-bold" style={{ fontSize: 20, color: '#8FA3C0' }}>
                Waiting for opponent…
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#1E3A5F' }}>
                Results will show when both players have voted
              </span>
            </motion.div>
          )}

          {/* ── Submit button — hidden after voting ── */}
          {!voted && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.88 }}
              >
                <motion.button
                  whileHover={reduced ? {} : { scale: selected !== null ? 1.04 : 1, transition: { duration: 0.2 } }}
                  onClick={() => { void handleSubmit() }}
                  disabled={selected === null || loading}
                  style={{
                    background: 'none', border: 'none', padding: 0, display: 'block',
                    cursor: selected !== null ? 'pointer' : 'not-allowed',
                    opacity: selected !== null ? 1 : 0.5,
                  }}
                >
                  <img src={SubmitBtn} alt="Submit" style={{ display: 'block', width: '270px', height: '65px' }} />
                </motion.button>
              </motion.div>
            </div>
          )}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
