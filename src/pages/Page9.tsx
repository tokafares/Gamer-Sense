import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import GrayProfile from '../assets/gray profile.png'
import { useAuthStore } from '../store/authStore'

interface MatchResultState {
  winnerId: string
  hostScore: number
  invitedScore: number
}

export default function Page9() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const result   = (location.state as MatchResultState | null)
  const isWinner = result?.winnerId === user?.id

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 860,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '48px 24px 80px',
          textAlign: 'center',
        }}>

          {/* Heading */}
          <motion.h1
            className="font-beaufort font-bold"
            style={{
              fontSize: 48, lineHeight: 1.1,
              marginTop: 0, marginBottom: 40,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={reduced ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Winner of the Trivia Match
          </motion.h1>

          {!result ? (
            /* No result — user navigated directly */
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
                onClick={() => navigate('/page7')}
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
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {/* Player cards */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>

                {/* Winner card */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  style={{
                    background: '#0D1F3C',
                    border: '2px solid #00C9A7',
                    borderRadius: 12,
                    padding: '28px 32px',
                    minWidth: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 0 24px rgba(0,201,167,0.18)',
                  }}
                >
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 12, letterSpacing: '0.2em', color: '#00C9A7',
                  }}>
                    WINNER
                  </span>
                  <div style={{ fontSize: 48, lineHeight: 1 }}>🏆</div>
                  <img
                    src={isWinner ? (user?.avatarUrl ?? GrayProfile) : GrayProfile}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00C9A7' }}
                  />
                  <span className="font-beaufort font-bold" style={{ fontSize: 20, color: '#E8EDF5', letterSpacing: '0.05em' }}>
                    {isWinner ? (user?.username ?? 'YOU') : 'OPPONENT'}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {isWinner ? result.hostScore : result.invitedScore}
                  </span>
                  <span style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>
                    CORRECT
                  </span>
                </motion.div>

                {/* VS */}
                <motion.span
                  className="font-beaufort font-bold"
                  style={{ fontSize: 40, color: '#1E3A5F' }}
                  initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                >
                  VS
                </motion.span>

                {/* Loser card */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  style={{
                    background: '#0D1F3C',
                    border: '1px solid #1E3A5F',
                    borderRadius: 12,
                    padding: '28px 32px',
                    minWidth: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 12, letterSpacing: '0.2em', color: '#8FA3C0',
                  }}>
                    DEFEATED
                  </span>
                  <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.35 }}>🏆</div>
                  <img
                    src={isWinner ? GrayProfile : (user?.avatarUrl ?? GrayProfile)}
                    alt=""
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1E3A5F', opacity: 0.7 }}
                  />
                  <span className="font-beaufort font-bold" style={{ fontSize: 20, color: '#8FA3C0', letterSpacing: '0.05em' }}>
                    {isWinner ? 'OPPONENT' : (user?.username ?? 'YOU')}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, color: '#8FA3C0',
                  }}>
                    {isWinner ? result.invitedScore : result.hostScore}
                  </span>
                  <span style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>
                    CORRECT
                  </span>
                </motion.div>

              </div>

              {/* Result message */}
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 22, letterSpacing: '0.08em', marginBottom: 36,
                  color: isWinner ? '#00C9A7' : '#C9A227',
                }}
              >
                {isWinner ? 'Great game! You outplayed your opponent.' : 'Good effort! Better luck next time.'}
              </motion.p>

              {/* Rematch button */}
              <motion.button
                onClick={() => navigate('/page7')}
                whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                style={{
                  padding: '14px 48px',
                  background: 'linear-gradient(to right, #00C9A7, #0090A7)',
                  color: '#060F1E', border: 'none', borderRadius: 7,
                  cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 16, letterSpacing: '0.12em',
                }}
              >
                REMATCH
              </motion.button>

            </motion.div>
          )}

        </div>
      </main>

      <img src={SeparatorLine} alt="" style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }} />
      <Footer />
    </>
  )
}
