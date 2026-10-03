import { Link } from 'react-router-dom'
import { useReducedMotion, motion } from 'framer-motion'
import Header from '../Header'
import { fadeUp } from '../../lib/animations'

const PLAYABLE = [
  { to: '/scenarios', label: 'SCENARIOS' },
  { to: '/blitz', label: 'BLITZ' },
  { to: '/trivia', label: 'TRIVIA' },
  { to: '/match', label: 'GUESS THE RANK' },
]

/**
 * Shown on the multiplayer routes in the demo build. Duels are matched and scored
 * by the Socket.io server, so they can't run in a backend-free demo.
 */
export default function DemoServerNotice() {
  const reduced = useReducedMotion()

  return (
    <>
      <Header />
      <main style={{ background: 'transparent', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <motion.section
          variants={reduced ? undefined : fadeUp}
          initial={reduced ? false : 'hidden'}
          animate="show"
          aria-labelledby="demo-duels-title"
          style={{
            width: '100%',
            maxWidth: 560,
            padding: '36px 28px',
            borderRadius: 14,
            background: 'rgba(13, 31, 60, 0.92)',
            border: '1px solid #1E3A5F',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          }}
        >
          <p className="font-beaufort font-bold" style={{ color: '#00C9A7', fontSize: 13, letterSpacing: '0.25em', margin: 0 }}>
            DUELS
          </p>
          <h1
            id="demo-duels-title"
            className="font-beaufort font-bold"
            style={{
              margin: '12px 0 14px',
              fontSize: 'clamp(26px, 5vw, 34px)',
              lineHeight: 1.15,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Live duels need the game server
          </h1>
          <p style={{ color: '#C9D4E5', fontSize: 15, lineHeight: 1.6, margin: '0 0 8px' }}>
            Real-time 1v1 trivia and Guess the Rank matches are run by the Socket.io server: it pairs players through an invite link,
            times each round and keeps score for both sides.
          </p>
          <p style={{ color: '#8FA3C0', fontSize: 14, lineHeight: 1.6, margin: '0 0 26px' }}>
            This demo runs without a server, so duels are switched off. Every single-player mode works:
          </p>
          <nav aria-label="Playable modes" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {PLAYABLE.map((mode) => (
              <Link
                key={mode.to}
                to={mode.to}
                className="font-beaufort font-bold"
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: '1px solid #00C9A7',
                  color: '#E8EDF5',
                  fontSize: 13,
                  letterSpacing: '0.15em',
                  textDecoration: 'none',
                }}
              >
                {mode.label}
              </Link>
            ))}
          </nav>
        </motion.section>
      </main>
    </>
  )
}
