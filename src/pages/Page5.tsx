import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import Group309 from '../assets/Group 309.png'
import ChampionBg from '../assets/ChampionBg.svg'
import BtnTopLane from '../assets/knowledgehub-btn-toplane.svg'
import BtnJungle from '../assets/knowledgehub-btn-jungle.svg'
import BtnMidLane from '../assets/knowledgehub-btn-midlane.svg'
import BtnADC from '../assets/knowledgehub-btn-adc.svg'
import BtnSupport from '../assets/knowledgehub-btn-support.svg'
import { useChampions } from '../hooks/useChampions'
import type { Role } from '../types/champion'

const LANE_BTNS: { src: string; alt: string; role: Role }[] = [
  { src: BtnTopLane, alt: 'Top Lane',  role: 'Top'     },
  { src: BtnJungle,  alt: 'Jungle',    role: 'Jungle'  },
  { src: BtnMidLane, alt: 'Mid Lane',  role: 'Mid'     },
  { src: BtnADC,     alt: 'ADC',       role: 'ADC'     },
  { src: BtnSupport, alt: 'Support',   role: 'Support' },
]

const ROLE_COLORS: Record<Role, string> = {
  Top:     '#C9A227',
  Jungle:  '#00C9A7',
  Mid:     '#3AF9FF',
  ADC:     '#E8EDF5',
  Support: '#9B59B6',
}

const PANEL_W  = 780
const GRID_GAP = 16
const GRID_PAD = 22
const TOP_PAD  = 48
const TITLE_MB = 24
const TABS_MB  = 20
const BOT_PAD  = 80

// Static variants — don't depend on per-card data or reduced motion
const splashVariants: Variants = {
  rest:    { opacity: 0 },
  hovered: { opacity: 1 },
}

const gradientVariants: Variants = {
  rest:    { opacity: 0 },
  hovered: { opacity: 1 },
}

export default function Page5() {
  const reduced  = useReducedMotion()
  const navigate = useNavigate()
  const { champions, loading } = useChampions()

  const [activeRole,    setActiveRole]    = useState<Role | null>(null)
  const [search,        setSearch]        = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [hoveredId,     setHoveredId]     = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = champions
    if (activeRole) list = list.filter(c => c.role === activeRole)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q))
    return list
  }, [champions, activeRole, search])

  // Stagger container for content lines — depends on reduced, memoised so reference is stable
  const contentContainerVariants: Variants = reduced
    ? { rest: {}, hovered: {} }
    : { rest: {}, hovered: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }

  const contentItemVariants: Variants = {
    rest:    { opacity: 0, y: reduced ? 0 : 16 },
    hovered: { opacity: 1, y: 0 },
  }

  const tabs_h = Math.round(113 * 670 / 1088)
  const grid_h = Math.round(557 * PANEL_W / 1087)

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        <div style={{ position: 'relative', overflow: 'visible' }}>

          {/* Illustration */}
          <motion.img
            src={Group309}
            alt=""
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '38%',
              objectFit: 'contain',
              objectPosition: 'right top',
              pointerEvents: 'none',
              zIndex: 1,
              display: 'block',
            }}
            initial={reduced ? false : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          />

          {/* Left content */}
          <div style={{
            maxWidth: '68%',
            paddingLeft: '79px',
            paddingTop: `${TOP_PAD}px`,
            paddingBottom: `${BOT_PAD}px`,
            position: 'relative',
            zIndex: 2,
          }}>

            {/* Title */}
            <motion.h1
              className="font-beaufort font-bold"
              style={{
                fontSize: '54px',
                lineHeight: 1,
                marginTop: 0,
                marginBottom: `${TITLE_MB}px`,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={reduced ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              Knowledge Hub
            </motion.h1>

            {/* Search bar */}
            <motion.div
              style={{ width: `${PANEL_W}px`, marginBottom: 12 }}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <input
                type="text"
                placeholder="Search champion..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="font-beaufort"
                style={{
                  width: '100%',
                  background: 'rgba(13, 31, 60, 0.9)',
                  border: `1px solid ${searchFocused ? '#00C9A7' : '#1E3A5F'}`,
                  padding: '9px 16px',
                  color: '#E8EDF5',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </motion.div>

            {/* Lane filter buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: `${TABS_MB}px`,
              width: `${PANEL_W}px`,
            }}>
              {LANE_BTNS.map(({ src, alt, role }, i) => {
                const isActive = activeRole === role
                return (
                  <motion.button
                    key={alt}
                    onClick={() => setActiveRole(isActive ? null : role)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'block',
                      lineHeight: 0,
                    }}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: isActive
                        ? 'brightness(1.45) drop-shadow(0 0 8px #00D4D8)'
                        : 'brightness(1) drop-shadow(0 0 0px transparent)',
                    }}
                    transition={{
                      default: { duration: 0.35, delay: 0.12 + i * 0.05 },
                      filter:  { duration: 0.2 },
                    }}
                    whileHover={reduced ? {} : {
                      filter: 'brightness(1.3) drop-shadow(0 0 6px #00D4D8)',
                    }}
                  >
                    <img
                      src={src}
                      alt={alt}
                      style={{ display: 'block', height: `${tabs_h}px`, width: 'auto' }}
                    />
                  </motion.button>
                )
              })}
            </div>

            {/* Champion grid */}
            <div style={{
              backgroundImage: `url(${ChampionBg})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              width: `${PANEL_W}px`,
              height: `${grid_h}px`,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}>
              <div
                className="champion-grid-scroll"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: `${GRID_GAP}px`,
                  padding: `${GRID_PAD}px`,
                  height: '100%',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  alignContent: 'start',
                }}
              >
                {loading ? (
                  Array.from({ length: 18 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#112040',
                        aspectRatio: '1',
                        opacity: 0.5 + (i % 3) * 0.1,
                      }}
                    />
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    color: '#8FA3C0',
                    fontFamily: 'beaufort, serif',
                    textAlign: 'center',
                    padding: 32,
                    fontSize: 14,
                  }}>
                    No champions found
                  </div>
                ) : (
                  filtered.map((champ, i) => {
                    const isHovered = hoveredId === champ.id
                    const isDimmed  = !!hoveredId && !isHovered
                    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`

                    // Per-card inner variants — depend on champ.color
                    const innerVariants: Variants = {
                      rest: {
                        scale:     1,
                        // three-layer rest shadow matches hovered structure for clean interpolation
                        boxShadow: `0 0 0 0px ${champ.color}00, 0 0 0px 0px ${champ.color}00, 0 0 0px 0px ${champ.color}00`,
                      },
                      hovered: reduced ? {} : {
                        scale:     1.22,
                        boxShadow: `0 0 0 1.5px ${champ.color}99, 0 0 15px 4px ${champ.color}55, 0 0 35px 8px ${champ.color}22`,
                      },
                    }

                    return (
                      // Outer layer — entry animation + spotlight dimming
                      // z-index elevated via style (not animated) so hovered card floats above neighbors
                      <motion.div
                        key={champ.id}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          zIndex: isHovered ? 20 : 1,
                        }}
                        initial={reduced ? false : { opacity: 0, y: 30 }}
                        animate={{
                          opacity: isDimmed ? 0.45 : 1,
                          y: 0,
                          scale: isDimmed ? (reduced ? 1 : 0.97) : 1,
                        }}
                        transition={{
                          // delay only fires during initial y: 30→0 entry; subsequent y changes are instant
                          y:       { duration: 0.35, delay: Math.min(i, 24) * 0.04, ease: 'easeOut' },
                          opacity: { duration: 0.25 },
                          scale:   { duration: 0.25 },
                        }}
                        onMouseEnter={() => setHoveredId(champ.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => navigate(`/champion/${champ.id}`)}
                      >
                        {/* Inner layer — hover scale + glow, propagates "hovered" to all children */}
                        <motion.div
                          initial="rest"
                          animate="rest"
                          whileHover="hovered"
                          variants={innerVariants}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          style={{ position: 'relative', overflow: 'hidden' }}
                        >
                          {/* Layer 1: portrait — always visible, sets card aspect ratio */}
                          <img
                            src={champ.portraitUrl}
                            alt={champ.name}
                            loading="lazy"
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />

                          {/* Layer 2: splash art crossfade — fades in on hover */}
                          <motion.img
                            src={splashUrl}
                            alt=""
                            loading="lazy"
                            variants={splashVariants}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top center',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Gradient overlay — bottom 75% of card */}
                          <motion.div
                            variants={gradientVariants}
                            transition={{ duration: 0.25 }}
                            style={{
                              position: 'absolute',
                              top: '25%',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(to top, rgba(6,15,30,0.97) 0%, rgba(6,15,30,0.3) 60%, transparent 100%)',
                              pointerEvents: 'none',
                            }}
                          />

                          {/* Content block — stagger slides up on hover */}
                          <motion.div
                            variants={contentContainerVariants}
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              padding: '0 4px 4px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              pointerEvents: 'none',
                            }}
                          >
                            {/* Champion name */}
                            <motion.div
                              variants={contentItemVariants}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              style={{
                                color: '#E8EDF5',
                                fontSize: 16,
                                fontFamily: 'beaufort, serif',
                                fontWeight: 700,
                                lineHeight: 1.1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {champ.name}
                            </motion.div>

                            {/* Title */}
                            <motion.div
                              variants={contentItemVariants}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              style={{
                                color: '#8FA3C0',
                                fontSize: 12,
                                fontFamily: 'beaufort, serif',
                                fontStyle: 'italic',
                                lineHeight: 1.1,
                                whiteSpace: 'normal',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {champ.title}
                            </motion.div>

                            {/* Role badge + difficulty stars */}
                            <motion.div
                              variants={contentItemVariants}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                border: `1px solid ${ROLE_COLORS[champ.role]}`,
                                color: ROLE_COLORS[champ.role],
                                fontSize: 8,
                                fontFamily: 'beaufort, serif',
                                letterSpacing: 0.8,
                                lineHeight: 1.3,
                              }}>
                                {champ.role.toUpperCase()}
                              </span>
                              <span style={{ color: '#C9A227', fontSize: 14, letterSpacing: 0 }}>
                                {'★'.repeat(champ.difficulty)}
                                {'☆'.repeat(Math.max(0, 3 - champ.difficulty))}
                              </span>
                            </motion.div>

                            {/* View → */}
                            <motion.div
                              variants={contentItemVariants}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              style={{
                                color: champ.color,
                                fontSize: 12,
                                fontFamily: 'beaufort, serif',
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                lineHeight: 1,
                              }}
                            >
                              View →
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Result count */}
            <motion.div
              style={{ width: `${PANEL_W}px`, marginTop: 8, textAlign: 'right' }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <span style={{ color: '#8FA3C0', fontSize: 12, fontFamily: 'beaufort, serif' }}>
                {loading ? '...' : `${filtered.length} champion${filtered.length !== 1 ? 's' : ''}${activeRole ? ` · ${activeRole}` : ''}`}
              </span>
            </motion.div>
          </div>
        </div>
      </main>

      <img
        src={SeparatorLine}
        alt=""
        style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0, position: 'relative', zIndex: 2 }}
      />
      <Footer />
    </>
  )
}
