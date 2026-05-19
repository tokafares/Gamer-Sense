import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import PlayerBg    from '../assets/Player Profile Bg.svg'
import Player1     from '../assets/player 1.png'
import GrayProfile from '../assets/gray profile.png'
import WinnerCup   from '../assets/Group 323.png'
import ScoreLeft   from '../assets/Group 322.svg'
import ScoreRight  from '../assets/Group 12.svg'
import RematchBtn  from '../assets/Group 321.svg'

const CARD_W  = 360
const CARD_H  = Math.round(CARD_W * 504 / 441)  // 411 px
const LABEL_H = 64   // extra height to comfortably seat the 50px WINNER text

function PlayerCard({
  img,
  blurred = false,
  overlayImg,
  label,
  labelFontSize = 30,
  labelFrom = '#3AF9FF',
  labelTo   = '#00A7AD',
  reduced,
  delay,
}: {
  img: string
  blurred?: boolean
  overlayImg?: string
  label: string
  labelFontSize?: number
  labelFrom?: string
  labelTo?: string
  reduced: boolean | null
  delay: number
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

        {/* Main player / profile image */}
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
            filter: blurred ? 'blur(6px)' : 'none',
          }}
        />

        {/* Winner cup overlay — sits on top of the blurred player image */}
        {overlayImg && (
          <img
            src={overlayImg}
            alt=""
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: 'calc(100% - 20px)',
              height: `calc(100% - 10px - ${LABEL_H}px)`,
              objectFit: 'contain',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
        )}

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
              fontSize: `${labelFontSize}px`,
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

export default function Page9() {
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
            gap: '40px',
          }}
        >
          {/* Title */}
          <motion.h1
            className="font-beaufort font-bold"
            style={{
              fontSize: '60px',
              lineHeight: 1.1,
              marginTop: 0,
              marginBottom: 0,
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={reduced ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            Winner of the Trivia Match
          </motion.h1>

          {/* Two-column panels row — no VS text */}
          <div style={{ display: 'flex', gap: '64px', alignItems: 'flex-start' }}>

            {/* Left column: Winner panel + score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <PlayerCard
                img={Player1}
                blurred
                overlayImg={WinnerCup}
                label="WINNER"
                labelFontSize={50}
                reduced={reduced}
                delay={0.1}
              />
              <motion.img
                src={ScoreLeft}
                alt="35 Correct Answers"
                style={{ width: 287, height: 54, display: 'block' }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Right column: Invited panel + score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <PlayerCard
                img={GrayProfile}
                label="Invited Player Profile"
                labelFontSize={30}
                labelFrom="#FFFCF6"
                labelTo="#969696"
                reduced={reduced}
                delay={0.2}
              />
              <motion.img
                src={ScoreRight}
                alt="12 Correct Answers"
                style={{ width: 287, height: 54, display: 'block' }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>

          </div>

          {/* Rematch button — centered below both columns */}
          <motion.img
            src={RematchBtn}
            alt="Rematch"
            style={{ width: 225, height: 60, display: 'block', cursor: 'pointer' }}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
            whileHover={reduced ? {} : { scale: 1.05, transition: { duration: 0.2 } }}
          />

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
