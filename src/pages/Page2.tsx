import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import Group245 from '../assets/Group 245.png'
import ScenarioSvg from '../assets/Scenario.svg'
import BlitzSvg from '../assets/Group 239.svg'
import CoachingSvg from '../assets/Coaching.svg'
import ProfileSvg from '../assets/profile.svg'
import GuessRankSvg from '../assets/guess rank.svg'
import CreatorSvg from '../assets/creator.svg'
import { staggerCards, cardItemAnim } from '../lib/animations'

const CARDS = [
  { label: 'SCENARIO',      svg: ScenarioSvg,  to: '/page4' },
  { label: 'BLITZ',         svg: BlitzSvg,     to: '/page3' },
  { label: 'KNOWLEDGE HUB', svg: CoachingSvg,  to: '/page2' },
  { label: 'PROFILE',       svg: ProfileSvg,   to: '/page9' },
  { label: 'GUESS RANK',    svg: GuessRankSvg, to: '/page8' },
  { label: 'CREATOR',       svg: CreatorSvg,   to: '/page5' },
]

const CARD_W = 210
const CARD_H = 170

const KnowledgeHub = () => {
  const reduced = useReducedMotion()

  return (
    <>
      <Header />

      {/* Main content — fills viewport exactly, no scroll */}
      <div
        style={{
          paddingTop: '85.2px',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* LEFT — card grid, anchored to top */}
        <div
          style={{
            width: '42%',
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingLeft: '100px',
            paddingBottom: '90px',
          }}
        >
          <motion.div
            variants={staggerCards}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(2, ${CARD_W}px)`,
                gap: '22px',
              }}
            >
              {CARDS.map((card) => (
                <motion.div
                  key={card.label}
                  variants={cardItemAnim}
                  whileHover={reduced ? {} : { scale: 1.05, filter: 'brightness(1.12)' }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  style={{ cursor: 'pointer' }}
                >
                  <Link
                    to={card.to}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}
                  >
                    <img
                      src={card.svg}
                      alt={card.label}
                      width={CARD_W}
                      height={CARD_H}
                      style={{ display: 'block', flexShrink: 0 }}
                    />
                    <span
                      className="font-beaufort font-bold"
                      style={{
                        marginTop: '6px',
                        color: '#0E1B2F',
                        fontSize: '12px',
                        letterSpacing: '0.07em',
                        textAlign: 'center',
                      }}
                    >
                      {card.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — hero illustration */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src={Group245}
            alt=""
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              height: 'calc(100% - 30px)',
              objectFit: 'contain',
              objectPosition: 'right bottom',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>

        {/* Bottom cyan accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #3AF9FF 15%, #00A7AD 85%, transparent 100%)',
            zIndex: 10,
          }}
        />
      </div>

      {/* Separator + Footer */}
      <img
        src={SeparatorLine}
        alt=""
        style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0 }}
      />
      <Footer />
    </>
  )
}

export default KnowledgeHub
