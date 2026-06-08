import { useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

const CARDS: Array<{ id: string; label: string; svg: string; to: string | null }> = [
  { id: 'scenario',      label: 'SCENARIO',      svg: ScenarioSvg,  to: '/page3'  },
  { id: 'blitz',         label: 'BLITZ',         svg: BlitzSvg,     to: '/page4'  },
  { id: 'knowledge-hub', label: 'KNOWLEDGE HUB', svg: CoachingSvg,  to: '/page5'  },
  { id: 'profile',       label: 'PROFILE',       svg: ProfileSvg,   to: '/page10' },
  { id: 'guess-rank',    label: 'GUESS RANK',    svg: GuessRankSvg, to: '/page11' },
  { id: 'creator',       label: 'CREATOR',       svg: CreatorSvg,   to: null      },
]

const CARD_W = 210
const CARD_H = 140

const titleVariants: Variants = {
  hidden: { y: -30, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

const gridVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

const cardEntryVariants: Variants = {
  hidden: { y: 50, opacity: 0, scale: 0.95 },
  show:   { y: 0, opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

const illustrationVariants: Variants = {
  hidden: { x: 80, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut', delay: 0.2 } },
}

const KnowledgeHub = () => {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleHoverStart = useCallback((id: string) => { if (!reduced) setHoveredCard(id) }, [reduced])
  const handleHoverEnd   = useCallback(() => { if (!reduced) setHoveredCard(null) }, [reduced])

  return (
    <>
      <Header />

      {/* Outer wrapper — navbar clearance only, so overflow clips at 90px not y=0 */}
      <div style={{ paddingTop: '90px' }}>
      {/* Inner layout container — height excludes navbar band; overflow clips at this boundary */}
      <div
        style={{
          height: 'calc(100vh - 90px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
        }}
      >
        {/* LEFT — title + card grid, stacked at bottom */}
        <div
          style={{
            width: '42%',
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: '100px',
            paddingBottom: '190px',
          }}
        >
          {/* Spacer — caps at 100px so content is never pinned to very bottom on large screens */}
          <div style={{ flex: 1, minHeight: '30px', maxHeight: '100px' }} />

          {/* Title */}
          <motion.h1
            variants={titleVariants}
            initial={reduced ? false : 'hidden'}
            animate="show"
            className="font-beaufort font-bold"
            style={{
              fontSize: '42px',
              lineHeight: 1,
              marginBottom: '8px',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Features
          </motion.h1>

          {/* Card grid — stagger container */}
          <motion.div
            variants={gridVariants}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(2, ${CARD_W}px)`,
                gap: '14px',
              }}
            >
              {CARDS.map((card) => (
                /* Outer: entry animation via cardEntryVariants */
                <motion.div
                  key={card.label}
                  variants={cardEntryVariants}
                  onClick={card.to ? () => navigate(card.to!) : undefined}
                  style={{ cursor: card.to ? 'pointer' : 'default' }}
                >
                  {/* Inner: hover animation only (two-layer pattern) */}
                  <motion.div
                    animate={{ scale: 1, y: 0 }}
                    whileHover={reduced ? {} : { scale: 1.03, y: -4 }}
                    whileTap={reduced ? {} : { scale: 0.97 }}
                    transition={{ default: { duration: 0.35, ease: 'easeOut' } }}
                    onHoverStart={() => handleHoverStart(card.id)}
                    onHoverEnd={handleHoverEnd}
                    style={{
                      boxShadow: hoveredCard === card.id
                        ? '0 0 25px rgba(0, 201, 167, 0.25), 0 8px 20px rgba(0,0,0,0.3)'
                        : 'none',
                      transition: 'box-shadow 0.3s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ display: 'block', flexShrink: 0 }}>
                        <img
                          src={card.svg}
                          alt={card.label}
                          width={CARD_W}
                          height={CARD_H}
                          loading="lazy"
                          style={{
                            display: 'block',
                            filter: hoveredCard === card.id ? 'brightness(1.3)' : 'brightness(1)',
                            transition: 'filter 0.3s ease',
                          }}
                        />
                      </div>
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
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — hero illustration, slides in from right */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <motion.img
            src={Group245}
            alt=""
            variants={illustrationVariants}
            initial={reduced ? false : 'hidden'}
            animate="show"
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
