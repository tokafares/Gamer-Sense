import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import GrayProfile from '../assets/gray profile.webp'
import PlayerProfileBg from '../assets/Player Profile Bg.svg'
import { useAuthStore } from '../store/authStore'

interface MatchResultState {
  winnerId: string
  hostScore: number
  invitedScore: number
  isHost?: boolean
}

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const goTriviaInvite = useCallback(() => navigate('/trivia-invite'), [navigate])

  const result   = (location.state as MatchResultState | null)
  const iWon     = result?.winnerId === user?.id

  // Use isHost passed through nav state to map backend scores correctly
  const myScore    = result ? (result.isHost ? result.hostScore    : result.invitedScore) : 0
  const theirScore = result ? (result.isHost ? result.invitedScore : result.hostScore)    : 0

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 900,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '48px 24px 80px',
          textAlign: 'center',
        }}>

          {!result ? (
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 10, padding: '48px 32px',
              }}
            >
              <p style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, marginBottom: 24 }}>
                No match result available.
              </p>
              <button
                onClick={goTriviaInvite}
                style={{
                  padding: '12px 32px', background: '#00C9A7', color: '#060F1E',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 15, letterSpacing: '0.1em',
                }}
              >
                PLAY 1v1
              </button>
            </motion.div>
          ) : (
            <>
              {/* Victory / Defeat heading */}
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                style={{ marginBottom: 40 }}
              >
                <h1
                  className="font-beaufort font-bold"
                  style={{
                    fontSize: 72, lineHeight: 1, margin: 0,
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
                  fontSize: 16, letterSpacing: '0.12em',
                  color: iWon ? '#00C9A7' : '#8FA3C0',
                  marginTop: 8,
                }}>
                  {iWon ? 'You outplayed your opponent!' : 'Better luck next time!'}
                </p>
              </motion.div>

              {/* Score comparison bar */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: '#0D1F3C', border: '1px solid #1E3A5F',
                  borderRadius: 10, padding: '20px 32px',
                  marginBottom: 32, gap: 0,
                }}
              >
                {/* Your side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11, letterSpacing: '0.14em', color: '#8FA3C0',
                  }}>YOU</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="font-beaufort font-bold" style={{
                      fontSize: 52, lineHeight: 1,
                      background: iWon
                        ? 'linear-gradient(to right, #3AF9FF, #00C9A7)'
                        : 'linear-gradient(to right, #E8EDF5, #8FA3C0)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>{myScore}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: '#8FA3C0' }}>
                      correct
                    </span>
                  </div>
                  <span className="font-beaufort font-bold" style={{
                    fontSize: 18,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {user?.username ?? 'You'}
                  </span>
                </div>

                {/* VS divider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
                  <span className="font-beaufort font-bold" style={{
                    fontSize: 36, fontStyle: 'italic', color: '#1E3A5F',
                  }}>VS</span>
                  {iWon && (
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 11, color: '#00C9A7', letterSpacing: '0.12em', marginTop: 4,
                    }}>
                      ◆ WINNER ◆
                    </span>
                  )}
                </div>

                {/* Opponent side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11, letterSpacing: '0.14em', color: '#8FA3C0',
                  }}>OPPONENT</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: '#8FA3C0' }}>
                      correct
                    </span>
                    <span className="font-beaufort font-bold" style={{
                      fontSize: 52, lineHeight: 1,
                      background: !iWon
                        ? 'linear-gradient(to right, #3AF9FF, #00C9A7)'
                        : 'linear-gradient(to right, #E8EDF5, #8FA3C0)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>{theirScore}</span>
                  </div>
                  <span className="font-beaufort font-bold" style={{ fontSize: 18, color: '#8FA3C0' }}>
                    Challenger
                  </span>
                </div>
              </motion.div>

              {/* Player cards */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 32, marginBottom: 36, flexWrap: 'wrap' }}
              >
                {/* Your card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    position: 'relative', width: 180,
                    filter: iWon ? 'drop-shadow(0 0 20px rgba(0,201,167,0.5))' : 'none',
                    transition: 'filter 0.4s',
                  }}>
                    <img src={PlayerProfileBg} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={user?.avatarUrl ?? GrayProfile}
                        alt="You"
                        style={{ width: '80%', height: '80%', objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                    {iWon && (
                      <div style={{
                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(to right, #3AF9FF, #00C9A7)',
                        borderRadius: 4, padding: '2px 10px',
                      }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 11, fontWeight: 700, color: '#060F1E', letterSpacing: '0.12em',
                        }}>WINNER</span>
                      </div>
                    )}
                  </div>
                  <span className="font-beaufort font-bold" style={{
                    fontSize: 16,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {user?.username ?? 'You'}
                  </span>
                </div>

                {/* Opponent card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    position: 'relative', width: 180,
                    filter: !iWon ? 'drop-shadow(0 0 20px rgba(0,201,167,0.5))' : 'none',
                    transition: 'filter 0.4s',
                  }}>
                    <img src={PlayerProfileBg} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={GrayProfile}
                        alt="Opponent"
                        style={{ width: '80%', height: '80%', objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                    {!iWon && (
                      <div style={{
                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(to right, #3AF9FF, #00C9A7)',
                        borderRadius: 4, padding: '2px 10px',
                      }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 11, fontWeight: 700, color: '#060F1E', letterSpacing: '0.12em',
                        }}>WINNER</span>
                      </div>
                    )}
                  </div>
                  <span className="font-beaufort font-bold" style={{ fontSize: 16, color: '#8FA3C0' }}>
                    Challenger
                  </span>
                </div>
              </motion.div>

              {/* Rematch / leave buttons */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
              >
                <button
                  onClick={goTriviaInvite}
                  style={{
                    padding: '14px 40px',
                    background: 'linear-gradient(to right, #00C9A7, #00A7AD)',
                    color: '#060F1E', border: 'none', borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 16, letterSpacing: '0.12em',
                  }}
                >
                  REMATCH
                </button>
                <button
                  onClick={() => navigate('/duels')}
                  style={{
                    padding: '14px 40px',
                    background: 'transparent',
                    color: '#8FA3C0',
                    border: '1px solid #1E3A5F',
                    borderRadius: 6, cursor: 'pointer',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 16, letterSpacing: '0.12em',
                  }}
                >
                  BACK TO DUELS
                </button>
              </motion.div>
            </>
          )}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
