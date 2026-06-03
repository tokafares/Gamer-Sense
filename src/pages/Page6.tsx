import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import PlayerBg    from '../assets/Player Profile Bg.svg'
import GrayProfile from '../assets/gray profile.png'
import { useAuthStore } from '../store/authStore'

const CARD_W  = 360
const CARD_H  = Math.round(CARD_W * 504 / 441)  // 411 px — natural SVG ratio
const LABEL_H = 56                               // reserved height for "Player Profile"

function PlayerCard({
  img,
  reduced,
  delay,
  label = 'Player Profile',
}: {
  img: string
  reduced: boolean | null
  delay: number
  label?: string
}) {
  return (
    <motion.div
      style={{ flexShrink: 0 }}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
    >
      <motion.div
        style={{ position: 'relative', width: CARD_W, height: CARD_H, cursor: 'pointer' }}
        whileHover={reduced ? {} : { scale: 1.04, y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        {/* Decorative frame */}
        <img
          src={PlayerBg}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Player character image — inset so the frame border is visible on all sides */}
        <img
          src={img}
          alt=""
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: 'calc(100% - 20px)',
            height: `calc(100% - 10px - ${LABEL_H}px)`,
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {/* "Player Profile" label */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: LABEL_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="font-beaufort font-bold"
            style={{
              fontSize: '30px',
              lineHeight: 1,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Page6() {
  const reduced = useReducedMotion()
  const { user } = useAuthStore()

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '48px',
            paddingBottom: '80px',
          }}
        >
          {/* Title */}
          <motion.h1
            className="font-beaufort font-bold"
            style={{
              fontSize: '60px',
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: '48px',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={reduced ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            Trivia Matchmaking
          </motion.h1>

          {/* Player cards + VS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '64px' }}>
            <PlayerCard
              img={user?.avatarUrl ?? GrayProfile}
              label={user?.username ?? 'Player Profile'}
              reduced={reduced}
              delay={0.1}
            />

            {/* VS */}
            <motion.span
              className="font-beaufort font-bold"
              style={{
                fontSize: '60px',
                lineHeight: 1,
                fontStyle: 'italic',
                flexShrink: 0,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={reduced ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            >
              VS
            </motion.span>

            <PlayerCard img={GrayProfile} reduced={reduced} delay={0.3} />
          </div>
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
