import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header        from '../components/Header'
import Footer        from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import WinnerCup     from '../assets/Group 323.png'
import CardBg        from '../assets/DialogBg.svg'
import BadgeWinner   from '../assets/Group 321.svg'
import BadgeWide     from '../assets/Group 322.svg'
import { useAuthStore } from '../store/authStore'

interface MatchResultState {
  winnerId:     string
  hostScore:    number
  invitedScore: number
  isHost?:      boolean
}

// DialogBg natural ratio: 441 × 504
const CARD_W    = 260
const CARD_H    = Math.round(CARD_W * 504 / 441)   // ≈ 297
// Image frame sits inside the card — leave space for label area at bottom
const IMG_W     = Math.round(CARD_W * 0.88)
const IMG_H     = Math.round(CARD_H * 0.72)
const IMG_LEFT  = Math.round((CARD_W - IMG_W) / 2)
const IMG_TOP   = Math.round(CARD_H * 0.04)

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const goTriviaInvite = useCallback(() => navigate('/trivia-invite'), [navigate])

  const result     = (location.state as MatchResultState | null)
  const iWon       = result?.winnerId === user?.id
  const myScore    = result ? (result.isHost ? result.hostScore    : result.invitedScore) : 0
  const theirScore = result ? (result.isHost ? result.invitedScore : result.hostScore)    : 0

  const myUsername = user?.username ?? 'You'
  const myAvatar   = user?.avatarUrl ?? null

  // Winner always on the left, loser on the right
  // Opponent avatar is never known — use null to render a generic placeholder
  const cards = [
    {
      avatar:   iWon ? myAvatar : null,
      username: iWon ? myUsername : 'Opponent',
      score:    iWon ? myScore    : theirScore,
      isWinner: true,
    },
    {
      avatar:   iWon ? null : myAvatar,
      username: iWon ? 'Opponent'  : myUsername,
      score:    iWon ? theirScore  : myScore,
      isWinner: false,
    },
  ]

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 760,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '48px 24px 80px',
          textAlign: 'center',
        }}>

          {/* ── VICTORY / DEFEAT heading ── */}
          {result && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ marginBottom: 40 }}
            >
              <h1
                className="font-beaufort font-bold"
                style={{
                  fontSize: 64, lineHeight: 1, margin: 0,
                  background: iWon
                    ? 'linear-gradient(to right, #3AF9FF, #00C9A7)'
                    : 'linear-gradient(to right, #8FA3C0, #4A5568)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.06em',
                }}
              >
                {iWon ? 'VICTORY!' : 'DEFEAT'}
              </h1>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15, letterSpacing: '0.1em',
                color: iWon ? '#00C9A7' : '#8FA3C0',
                marginTop: 8, marginBottom: 0,
              }}>
                {iWon ? 'You outplayed your opponent!' : 'Better luck next time!'}
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
                onClick={goTriviaInvite}
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
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25 + idx * 0.12 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
                  >
                    {/* ── Card: DialogBg frame — winner gets teal glow ── */}
                    <div style={{
                      position: 'relative', width: CARD_W, height: CARD_H, flexShrink: 0,
                      boxShadow: card.isWinner
                        ? '0 0 24px rgba(58,249,255,0.3)'
                        : 'none',
                    }}>
                      {/* Card background */}
                      <img
                        src={CardBg}
                        alt=""
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      />

                      {/* Image area: avatar + optional trophy + Group 282 border */}
                      <div style={{
                        position: 'absolute',
                        top: IMG_TOP, left: IMG_LEFT,
                        width: IMG_W, height: IMG_H,
                        overflow: 'hidden',
                      }}>
                        {/* Avatar — winner: blurred for trophy overlay; loser: generic placeholder or grayscale */}
                        {card.avatar ? (
                          <img
                            src={card.avatar}
                            alt={card.username}
                            style={{
                              position: 'absolute', inset: 0,
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'top center',
                              filter: card.isWinner
                                ? 'blur(4px) brightness(0.55)'
                                : 'grayscale(60%) opacity(0.85)',
                            }}
                          />
                        ) : (
                          /* Generic placeholder when opponent avatar is unknown */
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(180deg, #0D1F3C 0%, #060F1E 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="4" fill="#1E3A5F"/>
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}

                        {/* Trophy cup — winner card only */}
                        {card.isWinner && (
                          <img
                            src={WinnerCup}
                            alt="Trophy"
                            style={{
                              position: 'absolute',
                              top: '50%', left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '72%', height: 'auto',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 0 16px rgba(0,201,167,0.6))',
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                      </div>

                      {/* Bottom label area inside card */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: CARD_H - IMG_TOP - IMG_H,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 2, padding: '0 8px',
                      }}>
                        {/* "WINNER" in teal / username in white */}
                        <span
                          className="font-beaufort font-bold"
                          style={{
                            fontSize: card.isWinner ? 17 : 15,
                            letterSpacing: '0.06em',
                            lineHeight: 1.1,
                            background: card.isWinner
                              ? 'linear-gradient(to right, #3AF9FF, #00A7AD)'
                              : 'none',
                            WebkitBackgroundClip: card.isWinner ? 'text' : undefined,
                            WebkitTextFillColor:  card.isWinner ? 'transparent' : undefined,
                            backgroundClip:       card.isWinner ? 'text' : undefined,
                            color: card.isWinner ? undefined : '#E8EDF5',
                          }}
                        >
                          {card.isWinner ? 'WINNER' : card.username}
                        </span>
                        {/* Username below WINNER label */}
                        {card.isWinner && (
                          <span style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 12, color: '#8FA3C0', letterSpacing: '0.06em',
                          }}>
                            {card.username}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Correct answers badge ── */}
                    <div style={{ position: 'relative', width: 160, height: 38, flexShrink: 0 }}>
                      <img
                        src={card.isWinner ? BadgeWinner : BadgeWide}
                        alt=""
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      />
                      {/* cover baked-in SVG text */}
                      <div style={{ position: 'absolute', inset: '5px', background: '#0F1E2D' }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em',
                        }}>
                          {card.score} Correct Answers
                        </span>
                      </div>
                    </div>
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
                  onClick={goTriviaInvite}
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
                      fontSize: 18, letterSpacing: '0.12em',
                      background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Rematch
                  </span>
                </button>

                {/* Back to Duels — plain text link */}
                <button
                  onClick={() => navigate('/duels')}
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
