import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'

const LABEL_CLS = 'font-beaufort font-bold'
const PARA_CLS  = 'font-beaufort font-medium'

interface DuelModeCardProps {
  title: string
  description: string
  tag: string
  delay: number
  reduced: boolean | null
  onClick: () => void
}

function DuelModeCard({ title, description, tag, delay, reduced, onClick }: DuelModeCardProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <motion.button
        onClick={onClick}
        whileHover={reduced ? {} : { scale: 1.03, y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
        style={{
          position: 'relative',
          width: '380px',
          padding: '48px 36px',
          background: '#0D1F3C',
          border: '1px solid #1E3A5F',
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
          borderRadius: '8px 8px 0 0',
        }} />

        {/* Mode tag */}
        <span
          className={PARA_CLS}
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: '#00C9A7',
            textTransform: 'uppercase',
          }}
        >
          {tag}
        </span>

        {/* Title */}
        <h2
          className={LABEL_CLS}
          style={{
            fontSize: '36px',
            lineHeight: 1,
            margin: 0,
            background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className={PARA_CLS}
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0,
            color: '#8FA3C0',
          }}
        >
          {description}
        </p>

        {/* CTA */}
        <div style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#3AF9FF',
          fontSize: '13px',
          letterSpacing: '0.1em',
        }}>
          <span className={LABEL_CLS}>GET INVITE LINK</span>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
        </div>
      </motion.button>
    </motion.div>
  )
}

export default function Page6() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '64px',
          paddingBottom: '100px',
        }}>

          {/* Heading */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ textAlign: 'center', marginBottom: '16px' }}
          >
            <h1
              className={LABEL_CLS}
              style={{
                fontSize: '54px',
                lineHeight: 1,
                margin: 0,
                paddingBottom: '6px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Duels
            </h1>
          </motion.div>

          <motion.p
            className={PARA_CLS}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              fontSize: '16px',
              color: '#8FA3C0',
              marginBottom: '56px',
              letterSpacing: '0.04em',
            }}
          >
            Choose your game mode and challenge a friend 1v1
          </motion.p>

          {/* Mode cards */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '40px' }}>
            <DuelModeCard
              title="Trivia"
              tag="1v1 Knowledge Battle"
              description="Answer League of Legends trivia questions faster and more accurately than your opponent. First to lock in the correct answer wins the round."
              delay={0.2}
              reduced={reduced}
              onClick={() => { navigate('/page7') }}
            />

            {/* Divider */}
            <motion.div
              initial={reduced ? false : { opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
              style={{
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, #1E3A5F 30%, #1E3A5F 70%, transparent)',
                alignSelf: 'stretch',
                flexShrink: 0,
              }}
            />

            <DuelModeCard
              title="Guess The Rank"
              tag="1v1 Rank Reading"
              description="Watch a gameplay clip and guess the player's rank. Compete head-to-head — whoever reads the rank closest wins the round."
              delay={0.35}
              reduced={reduced}
              onClick={() => { navigate('/page11') }}
            />
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
