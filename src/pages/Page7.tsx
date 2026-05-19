import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import PlayerBg  from '../assets/Player Profile Bg.svg'
import Player1   from '../assets/player 1.png'
import Player2   from '../assets/player 2.png'
import InviteBtn from '../assets/Group 317.svg'

const CARD_W  = 360
const CARD_H  = Math.round(CARD_W * 504 / 441)  // 411 px
const LABEL_H = 56

function PlayerCard({
  img,
  reduced,
  delay,
  label,
  labelFrom = '#3AF9FF',
  labelTo   = '#00A7AD',
}: {
  img: string
  reduced: boolean | null
  delay: number
  label: string
  labelFrom?: string
  labelTo?: string
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
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* Player image — inset so frame border is visible */}
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

        {/* Label */}
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
              background: `linear-gradient(to right, ${labelFrom}, ${labelTo})`,
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

export default function Page7() {
  const reduced = useReducedMotion()

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
            Pre Trivia Matchmaking
          </motion.h1>

          {/* Cards + VS row — align top so VS wrapper controls its own centering */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '64px' }}>

            {/* Left: Host Player Profile */}
            <PlayerCard
              img={Player1}
              reduced={reduced}
              delay={0.1}
              label="Host Player Profile"
            />

            {/* VS — centred within panel height so the button below doesn't shift it */}
            <motion.div
              style={{
                height: CARD_H,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              initial={reduced ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            >
              <span
                className="font-beaufort font-bold"
                style={{
                  fontSize: '60px',
                  lineHeight: 1,
                  fontStyle: 'italic',
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                VS
              </span>
            </motion.div>

            {/* Right: Invited Player Profile + Invite button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <PlayerCard
                img={Player2}
                reduced={reduced}
                delay={0.3}
                label="Invited Player Profile"
                labelFrom="#FFFFFF"
                labelTo="#D0D8E4"
              />
              <motion.img
                src={InviteBtn}
                alt="Invite Link"
                style={{ width: 242, height: 45, display: 'block', cursor: 'pointer' }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                whileHover={reduced ? {} : { scale: 1.05, transition: { duration: 0.2 } }}
              />
            </div>

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
