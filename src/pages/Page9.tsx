import { useCallback, useMemo, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header        from '../components/Header'
import Footer        from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import WinnerCup     from '../assets/Group 323.png'
import CardBg        from '../assets/DialogBg.svg'
import CardFrame     from '../assets/Group 282.svg'
import BadgeWide     from '../assets/Group 322.svg'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type { MatchQuestion } from '../store/gameStore'
import { connectSocket, disconnectSocket } from '../lib/socket'
import { useIsMobile } from '../hooks/useIsMobile'

interface MatchResultState {
  winnerId:     string
  hostScore:    number
  invitedScore: number
  isHost?:      boolean
  gameType?:    'trivia' | 'gtr'
  opponentUsername?: string | null
}

// DialogBg actual SVG: 783 × 702 — preserveAspectRatio="none" so it stretches to fill
const CARD_W     = 320
const CARD_H     = 440
// Group 282 is a square frame — fits inside the card with space for the label below
const FRAME_SIZE = 265
const FRAME_TOP  = 18
const FRAME_LEFT = Math.round((CARD_W - FRAME_SIZE) / 2)  // 27
const LABEL_TOP  = FRAME_TOP + FRAME_SIZE + 12             // 295

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user } = useAuthStore()

  const result     = (location.state as MatchResultState | null)
  const { setMatchStart, setOpponentUsername } = useGameStore()
  const [rematching, setRematching] = useState(false)

  // Rematch: host triggers it; the server re-pairs BOTH players into a new match
  // and pushes them straight back into the game — no new link to share (item 12).
  const goRematch = useCallback(() => {
    setRematching(true)
    connectSocket().emit('match:rematch')
  }, [])

  useEffect(() => {
    if (!result) return
    const socket = connectSocket()
    const onRematch = (d: { matchId: string; inviteToken: string; mode: string }) => {
      // Both players auto-join the freshly re-paired match
      socket.emit('match:join', { token: d.inviteToken, userId: user?.id })
    }
    const onStart = (d: { matchId: string; questions?: MatchQuestion[]; gtrRoundIds?: string[]; hostUsername?: string; invitedUsername?: string }) => {
      setMatchStart(d.matchId, d.questions ?? [], result.isHost, d.gtrRoundIds ?? [])
      setOpponentUsername(result.isHost ? (d.invitedUsername ?? null) : (d.hostUsername ?? null))
      navigate(result.gameType === 'gtr' ? '/match' : '/trivia')
    }
    const onError = () => setRematching(false)
    socket.on('match:rematch', onRematch)
    socket.on('match:start', onStart)
    socket.on('match:error', onError)
    return () => {
      socket.off('match:rematch', onRematch)
      socket.off('match:start', onStart)
      socket.off('match:error', onError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.isHost, result?.gameType, user?.id])
  const myScore    = result ? (result.isHost ? result.hostScore    : result.invitedScore) : 0
  const theirScore = result ? (result.isHost ? result.invitedScore : result.hostScore)    : 0
  const isDraw     = !!result && myScore === theirScore
  const iWon       = !isDraw && result?.winnerId === user?.id

  const myUsername = user?.username ?? 'You'
  const myAvatar   = user?.avatarUrl ?? null

  // My card always left, opponent always right
  // Trophy + WINNER text follows whoever actually won
  const cards = useMemo(() => [
    {
      avatar:   myAvatar,
      username: myUsername,
      score:    myScore,
      isWinner: iWon,
      isDraw,
    },
    {
      avatar:   null,
      username: result?.opponentUsername || 'Opponent',
      score:    theirScore,
      isWinner: !isDraw && !iWon,
      isDraw,
    },
  ], [myAvatar, myUsername, myScore, iWon, isDraw, theirScore, result?.opponentUsername])

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 820,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: isMobile ? '32px 12px 60px' : '48px 24px 80px',
          textAlign: 'center',
        }}>

          {/* ── VICTORY / DEFEAT heading ── */}
          {result && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 1.6, y: -24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 40 }}
            >
              <h1
                className="font-beaufort font-bold"
                style={{
                  fontSize: isMobile ? 46 : 72, lineHeight: 1, margin: 0,
                  background: isDraw
                    ? 'linear-gradient(to right, #C9A227, #F0C94A)'
                    : iWon
                      ? 'linear-gradient(to right, #3AF9FF, #00A7AD)'
                      : 'linear-gradient(to right, #E8EDF5, #8FA3C0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {isDraw ? 'DRAW!' : iWon ? 'VICTORY!' : 'DEFEAT!'}
              </h1>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, textTransform: 'uppercase',
                color: isDraw ? '#C9A227' : iWon ? '#3AF9FF' : '#8FA3C0',
                marginTop: 10, marginBottom: 0,
              }}>
                {isDraw ? 'An equal match — well played!' : iWon ? 'You outplayed your opponent!' : 'Better luck next time!'}
              </p>
            </motion.div>
          )}

          {!result ? (
            /* ── No result state ── */
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 10, padding: '48px 32px',
              }}
            >
              <p style={{
                color: '#8FA3C0',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, marginBottom: 24,
              }}>
                No match result available.
              </p>
              <button
                onClick={goRematch}
                style={{
                  padding: '12px 32px', background: '#00C9A7', color: '#060F1E',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 15, letterSpacing: '0.1em',
                }}
              >
                PLAY 1v1
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              {/* ── Two player cards ── */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 40,
                marginBottom: 36,
                flexWrap: 'wrap',
              }}>
                {cards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={reduced ? false : { opacity: 0, x: idx === 0 ? -80 : 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: 0.3 + idx * 0.15, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
                  >
                    {/* ── Card: DialogBg frame — winner gets pulsing teal glow ── */}
                    <motion.div
                      animate={reduced ? {} : (card.isWinner || card.isDraw) ? {
                        boxShadow: card.isDraw ? [
                          '0 0 24px rgba(201,162,39,0.3)',
                          '0 0 44px rgba(201,162,39,0.6)',
                          '0 0 24px rgba(201,162,39,0.3)',
                        ] : [
                          '0 0 24px rgba(58,249,255,0.3)',
                          '0 0 44px rgba(58,249,255,0.6)',
                          '0 0 24px rgba(58,249,255,0.3)',
                        ],
                      } : {}}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                      style={{
                        position: 'relative', width: CARD_W, height: CARD_H, flexShrink: 0,
                        boxShadow: card.isDraw
                          ? '0 0 24px rgba(201,162,39,0.3)'
                          : card.isWinner ? '0 0 24px rgba(58,249,255,0.3)' : 'none',
                      }}>
                      {/* Card background */}
                      <img
                        src={CardBg}
                        alt=""
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      />

                      {/* ── Image frame area (Group 282 + photo/trophy inside) ── */}
                      <div style={{
                        position: 'absolute',
                        top: FRAME_TOP, left: FRAME_LEFT,
                        width: FRAME_SIZE, height: FRAME_SIZE,
                        overflow: 'hidden',
                      }}>
                        {/* Avatar or placeholder fills the frame */}
                        {card.avatar ? (
                          <img
                            src={card.avatar}
                            alt={card.username}
                            style={{
                              position: 'absolute', inset: 0,
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'top center',
                              filter: card.isDraw
                                ? 'brightness(0.75)'
                                : card.isWinner
                                  ? 'blur(4px) brightness(0.55)'
                                  : 'grayscale(60%) opacity(0.85)',
                            }}
                          />
                        ) : (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(180deg, #0D1F3C 0%, #060F1E 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="4" fill="#1E3A5F"/>
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}

                        {/* Trophy cup — winner card only, bounces in */}
                        {card.isWinner && (
                          <motion.img
                            src={WinnerCup}
                            alt="Trophy"
                            initial={reduced ? false : { opacity: 0, scale: 0.3, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.9, type: 'spring', bounce: 0.5 }}
                            style={{
                              position: 'absolute',
                              top: '50%', left: '50%',
                              marginTop: '-37.5%',
                              marginLeft: '-37.5%',
                              width: '75%', height: 'auto',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 0 16px rgba(0,201,167,0.6))',
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        {/* Group 282 — transparent decorative border frame on top */}
                        <img
                          src={CardFrame}
                          alt=""
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none',
                          }}
                        />
                      </div>

                      {/* Bottom label area inside card */}
                      <div style={{
                        position: 'absolute',
                        top: LABEL_TOP, left: 0, right: 0,
                        bottom: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 2, padding: '0 8px',
                      }}>
                        {/* Main card label */}
                        <motion.span
                          className="font-beaufort font-bold"
                          animate={reduced ? {} : (card.isWinner || card.isDraw) ? {
                            filter: card.isDraw ? [
                              'drop-shadow(0 0 6px rgba(201,162,39,0.5))',
                              'drop-shadow(0 0 18px rgba(201,162,39,0.9))',
                              'drop-shadow(0 0 6px rgba(201,162,39,0.5))',
                            ] : [
                              'drop-shadow(0 0 6px rgba(58,249,255,0.5))',
                              'drop-shadow(0 0 18px rgba(58,249,255,0.9))',
                              'drop-shadow(0 0 6px rgba(58,249,255,0.5))',
                            ],
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                          style={{
                            fontSize: (card.isWinner || card.isDraw) ? 48 : 28,
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            background: card.isDraw
                              ? 'linear-gradient(to right, #C9A227, #F0C94A)'
                              : card.isWinner
                                ? 'linear-gradient(to right, #3AF9FF, #00A7AD)'
                                : 'linear-gradient(to right, #E8EDF5, #8FA3C0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: card.isDraw
                              ? 'drop-shadow(0 0 6px rgba(201,162,39,0.5))'
                              : card.isWinner ? 'drop-shadow(0 0 6px rgba(58,249,255,0.5))' : 'none',
                          }}
                        >
                          {card.isDraw ? 'DRAW' : card.isWinner ? 'WINNER' : 'CHALLENGER'}
                        </motion.span>
                        {/* Username on both cards */}
                        <span
                            className="font-beaufort"
                            style={{
                              fontSize: 16,
                              color: card.isDraw ? '#C9A227' : card.isWinner ? '#3AF9FF' : '#8FA3C0',
                              marginTop: 4,
                            }}
                          >
                            {card.username}
                          </span>
                      </div>
                    </motion.div>

                    {/* ── Correct answers badge ── */}
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.65 + idx * 0.1 }}
                      style={{
                        width: 220, height: 52, flexShrink: 0,
                        background: '#0F1E2D',
                        border: '2px solid',
                        borderImageSource: card.isDraw
                          ? 'linear-gradient(to bottom, #C9A227, #F0C94A)'
                          : card.isWinner
                            ? 'linear-gradient(to bottom, #3AF9FF, #00A7AD)'
                            : 'linear-gradient(to bottom, #4A6080, #2A3F5F)',
                        borderImageSlice: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span
                        className="font-beaufort font-bold"
                        style={{ fontSize: 16, color: (card.isWinner || card.isDraw) ? '#E8EDF5' : '#8FA3C0' }}
                      >
                        {card.score} Correct Answers
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* ── Rematch button — Group 321 ── */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                {/* Rematch */}
                <button
                  onClick={goRematch}
                  style={{
                    position: 'relative', width: 300, height: 60,
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', display: 'block',
                  }}
                >
                  <img
                    src={BadgeWide}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  />
                  {/* cover baked-in SVG text */}
                  <div style={{ position: 'absolute', inset: '5px', background: '#0F1E2D' }} />
                  <span
                    className="font-beaufort font-bold"
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                      background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {rematching ? 'Setting up…' : 'Rematch'}
                  </span>
                </button>

                {/* Back to Duels — plain text link */}
                <button
                  onClick={() => { disconnectSocket(); navigate('/duels') }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, color: '#8FA3C0', letterSpacing: '0.08em',
                    textDecoration: 'underline',
                  }}
                >
                  Back to Duels
                </button>
              </motion.div>
            </motion.div>
          )}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
