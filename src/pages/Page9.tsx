import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import GrayProfile   from '../assets/gray profile.webp'
import WinnerCup     from '../assets/Group 323.png'
import { useAuthStore } from '../store/authStore'

interface MatchResultState {
  winnerId:     string
  hostScore:    number
  invitedScore: number
  isHost?:      boolean
}

const CARD_W = 260
const CARD_H = 280

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { user }  = useAuthStore()

  const goTriviaInvite = useCallback(() => navigate('/trivia-invite'), [navigate])

  const result     = (location.state as MatchResultState | null)
  const iWon       = result?.winnerId === user?.id
  const myScore    = result ? (result.isHost ? result.hostScore    : result.invitedScore) : 0
  const theirScore = result ? (result.isHost ? result.invitedScore : result.hostScore)    : 0

  // Winner card is always shown first (left), loser second (right)
  const winnerCard = {
    avatar:  iWon ? (user?.avatarUrl ?? GrayProfile) : GrayProfile,
    label:   iWon ? (user?.username ?? 'You')        : 'Invited Player Profile',
    score:   iWon ? myScore                          : theirScore,
    isWinner: true,
  }
  const loserCard = {
    avatar:  iWon ? GrayProfile                      : (user?.avatarUrl ?? GrayProfile),
    label:   iWon ? 'Invited Player Profile'         : (user?.username ?? 'You'),
    score:   iWon ? theirScore                       : myScore,
    isWinner: false,
  }

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '48px 24px 80px',
          textAlign: 'center',
        }}>

          {/* ── VICTORY / DEFEAT heading (kept from previous design) ── */}
          {result && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ marginBottom: 32 }}
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

          {/* ── "Winner of the Trivia Match" heading ── */}
          <motion.h2
            className="font-beaufort font-bold"
            initial={reduced ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: result ? 0.15 : 0 }}
            style={{
              fontSize: 36, lineHeight: 1, margin: '0 0 32px',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Winner of the Trivia Match
          </motion.h2>

          {!result ? (
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
              transition={{ duration: 0.45, delay: 0.2 }}
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
                {[winnerCard, loserCard].map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25 + idx * 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                  >
                    {/* Card frame */}
                    <div style={{
                      width: CARD_W,
                      height: CARD_H,
                      background: '#0D1F3C',
                      border: '2px solid #1E3A5F',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Avatar — blurred for winner, normal for loser */}
                      <img
                        src={card.avatar}
                        alt={card.label}
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top center',
                          filter: card.isWinner ? 'blur(4px) brightness(0.6)' : 'none',
                        }}
                      />

                      {/* Trophy cup overlay — winner card only */}
                      {card.isWinner && (
                        <img
                          src={WinnerCup}
                          alt="Winner Trophy"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '68%',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 18px rgba(0,201,167,0.55))',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* Name label */}
                    <span
                      className="font-beaufort font-bold"
                      style={{
                        fontSize: 18,
                        letterSpacing: '0.06em',
                        background: card.isWinner
                          ? 'linear-gradient(to right, #3AF9FF, #00A7AD)'
                          : 'none',
                        WebkitBackgroundClip: card.isWinner ? 'text' : undefined,
                        WebkitTextFillColor: card.isWinner ? 'transparent' : undefined,
                        backgroundClip: card.isWinner ? 'text' : undefined,
                        color: card.isWinner ? undefined : '#E8EDF5',
                      }}
                    >
                      {card.isWinner ? 'WINNER' : card.label}
                    </span>

                    {/* Correct answers pill */}
                    <div style={{
                      background: '#0D1F3C',
                      border: '1px solid #1E3A5F',
                      borderRadius: 4,
                      padding: '5px 16px',
                    }}>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 13,
                        color: '#E8EDF5',
                        letterSpacing: '0.04em',
                      }}>
                        {card.score} Correct Answers
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Rematch button ── */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 12 }}
              >
                <button
                  onClick={goTriviaInvite}
                  style={{
                    padding: '12px 48px',
                    background: '#060F1E',
                    color: '#E8EDF5',
                    border: '1px solid #1E3A5F',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.1em',
                  }}
                >
                  Rematch
                </button>
                <button
                  onClick={() => navigate('/duels')}
                  style={{
                    padding: '12px 32px',
                    background: 'transparent',
                    color: '#8FA3C0',
                    border: '1px solid #1E3A5F',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.1em',
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
