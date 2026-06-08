import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import GrayProfile from '../assets/gray profile.png'
import PlayerProfileBg from '../assets/Player Profile Bg.svg'
import GoldRank from '../assets/Group 340.svg'
import RematchBtn from '../assets/submit button 359.svg'
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

  const winnerScore  = isWinner ? result?.hostScore   : result?.invitedScore
  const invitedScore = isWinner ? result?.invitedScore : result?.hostScore

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          maxWidth: 1000,
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
              marginTop: 0, marginBottom: 48,
              paddingBottom: '5px',
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
                onClick={() => navigate('/trivia-invite')}
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
              {/* Two player cards */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 40, marginBottom: 40, flexWrap: 'wrap' }}>

                {/* Winner card */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
                >
                  <div style={{ position: 'relative', width: 220 }}>
                    <img src={PlayerProfileBg} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={isWinner ? (user?.avatarUrl ?? GoldRank) : GoldRank}
                        alt="Winner"
                        style={{
                          width: '80%', height: '80%', objectFit: 'contain',
                          filter: 'drop-shadow(0 0 18px rgba(0,201,167,0.55))',
                        }}
                      />
                    </div>
                  </div>

                  <span className="font-beaufort font-bold" style={{
                    fontSize: 22, letterSpacing: '0.12em',
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    WINNER
                  </span>

                  <div style={{
                    background: '#0D1F3C', border: '1px solid #1E3A5F',
                    borderRadius: 4, padding: '6px 18px',
                  }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em',
                    }}>
                      {winnerScore ?? 0} Correct Answers
                    </span>
                  </div>
                </motion.div>

                {/* Invited player card */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.28 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
                >
                  <div style={{ position: 'relative', width: 220 }}>
                    <img src={PlayerProfileBg} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={isWinner ? GrayProfile : (user?.avatarUrl ?? GrayProfile)}
                        alt="Invited Player"
                        style={{ width: '80%', height: '80%', objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                  </div>

                  <span className="font-beaufort font-bold" style={{
                    fontSize: 22, letterSpacing: '0.06em', color: '#E8EDF5',
                  }}>
                    Invited Player Profile
                  </span>

                  <div style={{
                    background: '#0D1F3C', border: '1px solid #1E3A5F',
                    borderRadius: 4, padding: '6px 18px',
                  }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 13, color: '#E8EDF5', letterSpacing: '0.06em',
                    }}>
                      {invitedScore ?? 0} Correct Answers
                    </span>
                  </div>
                </motion.div>

              </div>

              {/* Rematch button */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <motion.button
                  onClick={() => navigate('/trivia-invite')}
                  whileHover={reduced ? {} : { scale: 1.04, transition: { duration: 0.2 } }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
                >
                  <img src={RematchBtn} alt="Rematch" style={{ display: 'block', width: '220px', height: 'auto' }} />
                </motion.button>
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
