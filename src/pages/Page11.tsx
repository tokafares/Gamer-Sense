import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { useLevelUpStore } from '../store/levelUpStore'
import { useAuthStore } from '../store/authStore'
import { useGTRRound }  from '../hooks/useGTRRound'
import { connectSocket } from '../lib/socket'
import { toYouTubeEmbed } from '../lib/youtube'
import { useIsMobile } from '../hooks/useIsMobile'

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
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  // Solo mode returns here for rounds 2-3 from the results page with this flag,
  // so we must NOT reset the game (points + round counter must carry over).
  const continueGame = (location.state as { continueGame?: boolean } | null)?.continueGame === true
  const [selected,    setSelected]    = useState<number | null>(null)
  const [localRound,  setLocalRound]  = useState(1)
  const [advancing,   setAdvancing]   = useState(false)
  const [opponentPick, setOpponentPick] = useState<{ round: number; rank: string } | null>(null)  // opponent's rank in duel GTR
  const { points, opponentScore, gtrResult, matchId, gtrRoundIds, currentRound, opponentUsername, addPoints, setGTRResult, clearMatch, resetGame } = useGameStore()
  const { user } = useAuthStore()
  const [imgError, setImgError] = useState(false)
  const isDuel = !!matchId
  // Solo round is driven by the store (persists across the round → results → next-round
  // navigation); duel keeps its in-page localRound progression.
  const roundNum = isDuel ? localRound : currentRound
  // Reset per-round when the active round changes so each round can emit its vote
  const voteEmitted = useRef(false)
  const matchEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPointsRef = useRef(0)   // most recent round's pointsEarned, for the final gtr:vote
  useEffect(() => { voteEmitted.current = false; setOpponentPick(null) }, [roundNum])

  // Reset game state on a fresh solo start only (not when returning for the next round)
  useEffect(() => {
    if (!isDuel && !continueGame) resetGame()
    return () => { if (matchEndTimeout.current) clearTimeout(matchEndTimeout.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const duelRoundId = isDuel ? (gtrRoundIds[localRound - 1] ?? undefined) : undefined
  const { round, loading, error, voted, submitVote, result: voteResult, stats } = useGTRRound(roundNum, duelRoundId)

  const handleSubmit = useCallback(() => {
    if (selected === null || !round || voted) return
    void submitVote(RANKS_ORDER[selected])
  }, [selected, round, voted, submitVote])

  // Reset selection + image error when a new round loads
  useEffect(() => { setImgError(false); setSelected(null) }, [round?.id])

  // Duel: advance to the next round (rounds 1-2) or finish (round 3). Called once
  // both players have picked, OR after the 20s fallback if the opponent stalls.
  const advanceDuelRound = useCallback(() => {
    setAdvancing(false)
    if (localRound < TOTAL_GTR_ROUNDS) {
      setLocalRound(r => r + 1)
      return
    }
    if (matchId && !voteEmitted.current) {
      voteEmitted.current = true
      connectSocket().emit('gtr:vote', { matchId, pointsEarned: lastPointsRef.current })
      // Fallback: if match:end never arrives within 12s, navigate anyway
      matchEndTimeout.current = setTimeout(() => {
        const capturedIsHost = useGameStore.getState().isHost
        const oppName = useGameStore.getState().opponentUsername
        clearMatch()
        navigate('/match-winner', {
          state: { winnerId: '', hostScore: 0, invitedScore: 0, isHost: capturedIsHost, gameType: 'gtr', opponentUsername: oppName },
        })
      }, 12000)
    }
  }, [localRound, matchId, navigate, clearMatch])

  // When vote + stats both arrive — update store, then advance or finish
  useEffect(() => {
    if (!voteResult || !stats || !round) return

    addPoints(voteResult.pointsEarned)
    useLevelUpStore.getState().checkLevelUp(voteResult.totalPoints, voteResult.pointsEarned)
    setGTRResult({
      roundId:     round.id,
      imageUrl:    round.imageUrl,
      votedRank:   voteResult.votedRank,
      correctRank: voteResult.correctRank,
      totalVotes:  stats.totalVotes,
      percentages: stats.percentages,
    })

    if (!isDuel) {
      // Solo: show this round's results page after a brief beat so the player
      // sees the picked/correct highlight on the tiles before the page changes.
      setAdvancing(true)
      const t = setTimeout(() => navigate('/results'), 1400)
      return () => clearTimeout(t)
    }

    // Duel: tell the opponent our pick, then WAIT for them to pick before
    // advancing (synced rounds — no fixed 2.5s local timer). 20s anti-stall fallback.
    lastPointsRef.current = voteResult.pointsEarned
    if (matchId) {
      connectSocket().emit('gtr:pick', { matchId, roundIndex: localRound, votedRank: voteResult.votedRank })
    }
    setAdvancing(true)
    const fallback = setTimeout(() => advanceDuelRound(), 20000)
    return () => clearTimeout(fallback)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteResult, stats])

  // Duel: once BOTH have picked this round, reveal both picks briefly then advance
  useEffect(() => {
    if (!isDuel || !voted || !advancing) return
    if (!(opponentPick && opponentPick.round === localRound)) return
    const t = setTimeout(() => advanceDuelRound(), 1500)
    return () => clearTimeout(t)
  }, [isDuel, voted, advancing, opponentPick, localRound, advanceDuelRound])

  // In duel mode: listen for match:end and navigate to winner screen
  useEffect(() => {
    if (!isDuel || !matchId) return
    const socket = connectSocket()
    const onMatchEnd = (d: { winnerId: string; hostScore: number; invitedScore: number }) => {
      if (matchEndTimeout.current) clearTimeout(matchEndTimeout.current)
      const capturedIsHost = useGameStore.getState().isHost
      const oppName = useGameStore.getState().opponentUsername
      clearMatch()
      // keep the socket connected so the winner screen can offer an instant rematch
      navigate('/match-winner', { state: { ...d, gameType: 'gtr', isHost: capturedIsHost, opponentUsername: oppName } })
    }
    const onOpponentVote = (d: { roundIndex: number; votedRank: string }) => {
      setOpponentPick({ round: d.roundIndex, rank: d.votedRank })
    }
    socket.on('match:end', onMatchEnd)
    socket.on('gtr:opponent-vote', onOpponentVote)
    return () => { socket.off('match:end', onMatchEnd); socket.off('gtr:opponent-vote', onOpponentVote) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuel, matchId])

  const toggle = useCallback((i: number) => {
    if (voted) return
    setSelected(prev => (prev === i ? null : i))
  }, [voted])

  const totalRounds = TOTAL_GTR_ROUNDS

  const ytEmbed = toYouTubeEmbed(round?.imageUrl)
  const isYouTube = !!ytEmbed
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
          padding: isMobile ? '16px 14px 40px' : '16px 79px 48px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* ── 1v1 scoreboard — duel mode only (matches Trivia duel) ── */}
          {isDuel && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'flex', alignItems: 'center',
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 8, padding: isMobile ? '10px 14px' : '12px 24px',
                marginBottom: '12px', gap: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', color: '#8FA3C0' }}>YOU</span>
                <span className="font-beaufort font-bold" style={{
                  fontSize: isMobile ? 18 : 28, lineHeight: 1, maxWidth: '100%',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {user?.username ?? 'Player'}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em' }}>
                  {points} pts
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '0 10px' : '0 24px', flexShrink: 0 }}>
                <span className="font-beaufort font-bold" style={{
                  fontSize: isMobile ? 22 : 32, fontStyle: 'italic', lineHeight: 1,
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>VS</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: '#8FA3C0', letterSpacing: '0.1em' }}>
                  ROUND {roundNum}/{totalRounds}
                </span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {Array.from({ length: totalRounds }, (_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < roundNum - 1 ? '#00C9A7' : i === roundNum - 1 ? '#3AF9FF' : '#1E3A5F',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: '0.12em', color: '#8FA3C0' }}>OPPONENT</span>
                <span className="font-beaufort font-bold" style={{
                  fontSize: isMobile ? 18 : 28, lineHeight: 1, color: '#E8EDF5', maxWidth: '100%',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {opponentUsername ?? 'Opponent'}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em' }}>
                  {opponentScore} pts
                </span>
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
            <div style={{ flex: 1, minWidth: 0, position: 'relative', height: `${isMobile ? 84 : ROUND_H}px` }}>
              <img src={RoundBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              <div style={{
                position: 'absolute', top: '50%', left: '1.2%', width: '97.5%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isMobile ? '0 14px' : '0 16px', boxSizing: 'border-box',
              }}>
                <span className="font-beaufort font-bold" style={{ fontSize: isMobile ? 20 : 17, color: '#E8EDF5', lineHeight: 1 }}>
                  Round {roundNum}/{totalRounds}
                </span>
                <span style={{ color: '#C9A227', fontSize: isMobile ? 22 : 18, letterSpacing: isMobile ? 3 : 4, lineHeight: 1 }}>
                  {Array.from({ length: totalRounds }, (_, i) => i < roundNum ? '◆' : '◇').join(' ')}
                </span>
                <span className="font-beaufort font-bold" style={{ fontSize: isMobile ? 20 : 17, color: '#00C9A7', lineHeight: 1 }}>
                  Points {points}
                </span>
              </div>
            </div>
            <img src={FlagIcon} alt="" style={{ width: isMobile ? '76px' : '63px', height: isMobile ? '76px' : '63px', flexShrink: 0, display: 'block' }} />
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
                  src={`${ytEmbed}?rel=0&modestbranding=1`}
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

          {/* ── Rank picker container + tiles (3×3 grid on mobile) ── */}
          <motion.div
            style={{ position: 'relative', width: '100%', paddingTop: isMobile ? 0 : `${RANK_RATIO * 100}%`, marginTop: '8px' }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            {!isMobile && <img src={RankContainer} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />}

            <div style={isMobile ? {
              position: 'relative',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px', padding: '4px', boxSizing: 'border-box',
            } : {
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4% 1%', boxSizing: 'border-box', gap: '0.5%',
            }}>
              {RANK_TILES.map((src, i) => {
                const rankName  = RANKS_ORDER[i]
                const isVoted   = gtrResult?.votedRank   === rankName
                const isOppPick = isDuel && opponentPick?.round === localRound && opponentPick?.rank === rankName
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

                      {/* Opponent's pick in a duel — purple, with a small label */}
                      {isOppPick && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #B57BFF', background: 'rgba(181,123,255,0.14)', pointerEvents: 'none' }}>
                          <span style={{ position: 'absolute', top: 2, left: 0, right: 0, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: '0.08em', color: '#D9C2FF' }}>OPP</span>
                        </div>
                      )}

                      {/* Post-vote highlight — only the player's own pick (teal); no gold on the
                          correct rank (the correct answer is revealed on the results page instead) */}
                      {voted && isVoted && (
                        <div style={{ position: 'absolute', inset: 0, border: '2px solid #00C9A7', background: 'rgba(0,201,167,0.12)', pointerEvents: 'none' }} />
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
                Showing results…
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
