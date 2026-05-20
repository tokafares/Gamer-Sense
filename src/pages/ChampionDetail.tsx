import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import { useChampions } from '../hooks/useChampions'
import type { Role, ChampionStats } from '../types/champion'
import { fadeUp, staggerContainer, staggerCards, cardItemAnim, scrollFadeUp } from '../lib/animations'

const ROLE_COLORS: Record<Role, string> = {
  Top:     '#C9A227',
  Jungle:  '#00C9A7',
  Mid:     '#3AF9FF',
  ADC:     '#E8EDF5',
  Support: '#9B59B6',
}

const ROLE_TIPS: Record<Role, string> = {
  Top:     'Ask yourself: Can they split push effectively? Do I need to match them in the sidelane, or does my team need me to group? A wrong call here costs you objectives, not just the lane.',
  Jungle:  'Ask yourself: Where will they gank next? Do I have vision on their likely path? Track their camps to predict timing — warn your laners before the gank arrives, not after.',
  Mid:     'Ask yourself: Can they roam and impact other lanes? Should I push the wave and follow, or stay safe and farm? Mid is the axis of the map — your decisions ripple to every sidelane.',
  ADC:     'Ask yourself: Are they protected in teamfights? Can I actually reach their backline, or is diving them a trap? Identify the support\'s engage range before committing to a fight.',
  Support: 'Ask yourself: What is their engage range? Can I punish their ADC when they step up to trade? Good support sense means controlling space and creating threats before the fight begins.',
}

const STAT_LABELS: Record<keyof ChampionStats, string> = {
  damage:         'DAMAGE',
  burstPotential: 'BURST POTENTIAL',
  durability:     'DURABILITY',
  crowdControl:   'CROWD CONTROL',
  mobility:       'MOBILITY',
  rangeControl:   'RANGE CONTROL',
}

/* ─── shared heading component ───────────────────────────────────────────── */

function SectionHeading({ children, color = 'teal' }: { children: string; color?: 'teal' | 'green' | 'red' | 'gradient' }) {
  if (color === 'gradient') {
    return (
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <h2
          className="font-beaufort font-bold"
          style={{
            fontSize: 36,
            margin: 0,
            lineHeight: 1.1,
            mixBlendMode: 'multiply',
            background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {children}
        </h2>
        <h2
          aria-hidden="true"
          className="font-beaufort font-bold"
          style={{
            fontSize: 36,
            margin: 0,
            lineHeight: 1.1,
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {children}
        </h2>
      </div>
    )
  }
  const colorMap = { teal: '#00C9A7', green: '#00C9A7', red: '#EF4444' }
  return (
    <h2
      className="font-beaufort font-bold"
      style={{
        fontSize: 32,
        margin: 0,
        marginBottom: 24,
        letterSpacing: 2,
        color: colorMap[color],
      }}
    >
      {children}
    </h2>
  )
}

/* ─── main component ─────────────────────────────────────────────────────── */

export default function ChampionDetail() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const reduced  = useReducedMotion()
  const { champions, loading } = useChampions()

  /* ── loading ── */
  if (loading) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: '85.2px', background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            style={{ color: '#8FA3C0', fontFamily: 'beaufort, serif', fontSize: 20, letterSpacing: 3 }}
            animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            LOADING...
          </motion.div>
        </main>
      </>
    )
  }

  const champion = id ? champions.find(c => c.id === id) : undefined

  /* ── not found ── */
  if (!champion) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: '85.2px', background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
          <div className="font-beaufort font-bold" style={{ color: '#E8EDF5', fontSize: 40 }}>
            Champion not found
          </div>
          <motion.button
            onClick={() => navigate('/page5')}
            style={{
              background: 'none',
              border: '1px solid #00C9A7',
              color: '#00C9A7',
              padding: '12px 32px',
              cursor: 'pointer',
              fontFamily: 'beaufort, serif',
              fontSize: 14,
              letterSpacing: 2,
            }}
            animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
            transition={{ filter: { duration: 0.15 } }}
            whileHover={reduced ? {} : { filter: 'brightness(1.2) drop-shadow(0 0 10px #00C9A7)', backgroundColor: 'rgba(0,201,167,0.08)' }}
          >
            ← KNOWLEDGE HUB
          </motion.button>
        </main>
      </>
    )
  }

  const currentIdx = champions.findIndex(c => c.id === id)
  const prevChamp  = currentIdx > 0 ? champions[currentIdx - 1] : null
  const nextChamp  = currentIdx < champions.length - 1 ? champions[currentIdx + 1] : null
  const stats      = Object.entries(champion.stats) as [keyof ChampionStats, number][]
  const roleTip    = ROLE_TIPS[champion.role]

  return (
    <>
      <Header />
      <main style={{ paddingTop: '85.2px', background: 'transparent' }}>

        {/* ══════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ position: 'relative', height: 580, overflow: 'hidden' }}>

          {/* Splash art */}
          <motion.img
            src={champion.splashUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 18%',
              display: 'block',
            }}
            initial={reduced ? false : { scale: 1.07, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* Flat 50% black overlay for readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />

          {/* Gradient fade to navy at the bottom */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to bottom,',
              '  transparent 0%,',
              '  rgba(6,15,30,0.55) 55%,',
              '  rgba(6,15,30,1.00) 100%)',
            ].join(''),
          }} />

          {/* Back button */}
          <motion.button
            onClick={() => navigate('/page5')}
            style={{
              position: 'absolute',
              top: 24,
              left: 79,
              background: 'rgba(6,15,30,0.65)',
              border: '1px solid rgba(0,201,167,0.5)',
              color: '#00C9A7',
              padding: '8px 20px',
              cursor: 'pointer',
              fontFamily: 'beaufort, serif',
              fontSize: 12,
              letterSpacing: 2,
              zIndex: 10,
            }}
            initial={reduced ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
            transition={{ default: { duration: 0.45, delay: 0.25 }, filter: { duration: 0.15 } }}
            whileHover={reduced ? {} : {
              filter: 'brightness(1.2) drop-shadow(0 0 8px #00C9A7)',
              backgroundColor: 'rgba(0,201,167,0.12)',
              borderColor: '#00C9A7',
            }}
          >
            ← KNOWLEDGE HUB
          </motion.button>

          {/* Champion identity — centred, anchored to bottom */}
          <div style={{ position: 'absolute', bottom: 52, left: 0, right: 0, textAlign: 'center', padding: '0 40px' }}>

            {/* Animated gradient name with champion-color glow */}
            <motion.h1
              className={`font-beaufort font-bold ${reduced ? '' : 'hero-gradient-text'}`}
              style={reduced ? {
                fontSize: 96,
                lineHeight: 1,
                margin: 0,
                marginBottom: 14,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : {
                fontSize: 96,
                lineHeight: 1,
                margin: 0,
                marginBottom: 14,
                textShadow: `0 0 60px ${champion.color}55, 0 0 120px ${champion.color}28`,
                filter: `drop-shadow(0 0 24px ${champion.color}50)`,
              }}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
            >
              {champion.name}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              style={{
                color: '#CBD5E1',
                fontSize: 24,
                fontFamily: 'beaufort, serif',
                margin: 0,
                marginBottom: 22,
                textShadow: '0 2px 8px rgba(6,15,30,0.9)',
                letterSpacing: 1,
              }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              {champion.title}
            </motion.p>

            {/* Role badge */}
            <motion.span
              style={{
                display: 'inline-block',
                padding: '7px 24px',
                border: `2px solid ${ROLE_COLORS[champion.role]}`,
                color: ROLE_COLORS[champion.role],
                fontSize: 13,
                fontFamily: 'beaufort, serif',
                letterSpacing: 3,
                background: `${ROLE_COLORS[champion.role]}18`,
                textShadow: `0 0 12px ${ROLE_COLORS[champion.role]}80`,
                boxShadow: `0 0 20px ${ROLE_COLORS[champion.role]}30`,
              }}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.5, type: 'spring', stiffness: 280, damping: 20 }}
            >
              {champion.role.toUpperCase()}
            </motion.span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CONTENT
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1280, marginLeft: 'auto', marginRight: 'auto', padding: '72px 79px 96px' }}>

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'start' }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <motion.div
              variants={staggerContainer}
              initial={reduced ? false : 'hidden'}
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >

              {/* Overview card */}
              <motion.div variants={fadeUp} style={{ marginBottom: 80 }}>
                <SectionHeading color="gradient">Overview</SectionHeading>
                <div style={{
                  border: `2px solid ${champion.color}`,
                  background: `linear-gradient(135deg, ${champion.color}14 0%, rgba(13,31,60,0.80) 60%)`,
                  padding: '40px 48px',
                  backdropFilter: 'blur(6px)',
                  boxShadow: `0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px ${champion.color}18`,
                }}>
                  {/* Role badge inside card */}
                  <div style={{ marginBottom: 20 }}>
                    <span style={{
                      padding: '4px 14px',
                      border: `1px solid ${ROLE_COLORS[champion.role]}55`,
                      color: ROLE_COLORS[champion.role],
                      fontSize: 11,
                      fontFamily: 'beaufort, serif',
                      letterSpacing: 2.5,
                      background: `${ROLE_COLORS[champion.role]}12`,
                    }}>
                      {champion.role.toUpperCase()}
                    </span>
                  </div>
                  <p style={{
                    color: '#E8EDF5',
                    fontSize: 20,
                    lineHeight: 1.9,
                    margin: 0,
                    fontFamily: 'beaufort, serif',
                  }}>
                    {champion.description}
                  </p>
                </div>
              </motion.div>

              {/* Strengths */}
              <motion.div variants={fadeUp} style={{ marginBottom: 80 }}>
                <SectionHeading color="green">STRENGTHS</SectionHeading>
                <motion.ul
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                  variants={staggerCards}
                >
                  {champion.strengths.map((s, i) => (
                    <motion.li key={i} variants={cardItemAnim} style={{ marginBottom: 16 }}>
                      {/* outer div = entry via variants; inner motion.div = hover */}
                      <motion.div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 16,
                          padding: '16px 20px',
                          border: `1px solid ${champion.color}40`,
                          background: 'rgba(13,31,60,0.90)',
                        }}
                        animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
                        transition={{ filter: { duration: 0.15 } }}
                        whileHover={reduced ? {} : {
                          x: 6,
                          filter: `brightness(1.06) drop-shadow(0 0 10px ${champion.color}40)`,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <span style={{
                          color: '#00C9A7',
                          fontSize: 26,
                          lineHeight: 1.3,
                          flexShrink: 0,
                          textShadow: '0 0 10px #00C9A780',
                        }}>
                          ✓
                        </span>
                        <span style={{
                          color: '#E8EDF5',
                          fontSize: 19,
                          lineHeight: 1.75,
                          fontFamily: 'beaufort, serif',
                        }}>
                          {s}
                        </span>
                      </motion.div>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              {/* Weaknesses */}
              <motion.div variants={fadeUp} style={{ marginBottom: 0 }}>
                <SectionHeading color="red">WEAKNESSES</SectionHeading>
                <motion.ul
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                  variants={staggerCards}
                >
                  {champion.weaknesses.map((w, i) => (
                    <motion.li key={i} variants={cardItemAnim} style={{ marginBottom: 16 }}>
                      <motion.div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 16,
                          padding: '16px 20px',
                          border: '1px solid rgba(239,68,68,0.38)',
                          background: 'rgba(13,31,60,0.90)',
                        }}
                        animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
                        transition={{ filter: { duration: 0.15 } }}
                        whileHover={reduced ? {} : {
                          x: 6,
                          filter: 'brightness(1.06) drop-shadow(0 0 10px rgba(239,68,68,0.40))',
                          transition: { duration: 0.2 },
                        }}
                      >
                        <span style={{
                          color: '#EF4444',
                          fontSize: 26,
                          lineHeight: 1.3,
                          flexShrink: 0,
                          textShadow: '0 0 10px #EF444480',
                        }}>
                          ✗
                        </span>
                        <span style={{
                          color: '#E8EDF5',
                          fontSize: 19,
                          lineHeight: 1.75,
                          fontFamily: 'beaufort, serif',
                        }}>
                          {w}
                        </span>
                      </motion.div>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
            <motion.div
              initial={reduced ? false : { opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >

              {/* Stat bars */}
              <div style={{ marginBottom: 52 }}>
                <h3
                  className="font-beaufort font-bold"
                  style={{
                    fontSize: 28,
                    letterSpacing: 3,
                    marginBottom: 28,
                    marginTop: 0,
                    background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  STATS
                </h3>

                {stats.map(([key, value], i) => {
                  const pct = Math.round((value / 5) * 100)
                  return (
                    <div key={key} style={{ marginBottom: 22 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{
                          color: '#CBD5E1',
                          fontSize: 12,
                          fontFamily: 'beaufort, serif',
                          fontWeight: 600,
                          letterSpacing: 1.5,
                        }}>
                          {STAT_LABELS[key]}
                        </span>
                        <span style={{ color: '#E8EDF5', fontSize: 13, fontFamily: 'beaufort, serif', fontWeight: 700 }}>
                          {value}/5
                        </span>
                      </div>
                      {/* Track */}
                      <div style={{ height: 16, background: '#1E3A5F', borderRadius: 8, overflow: 'hidden' }}>
                        {/* Filled bar — animates from 0% to actual width */}
                        <motion.div
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${champion.color}bb, ${champion.color})`,
                            borderRadius: 8,
                            boxShadow: `0 0 14px ${champion.color}90, 0 0 4px ${champion.color}`,
                          }}
                          initial={reduced ? false : { width: '0%' }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.12 + i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: 40 }}>
                <div style={{
                  color: '#8FA3C0',
                  fontSize: 11,
                  fontFamily: 'beaufort, serif',
                  letterSpacing: 2.5,
                  marginBottom: 12,
                  fontWeight: 700,
                }}>
                  DIFFICULTY
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <motion.span
                      key={i}
                      style={{ fontSize: 38, color: i < champion.difficulty ? '#C9A227' : '#1E3A5F', lineHeight: 1 }}
                      initial={reduced ? false : { scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {champion.tags.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{
                    color: '#8FA3C0',
                    fontSize: 11,
                    fontFamily: 'beaufort, serif',
                    letterSpacing: 2.5,
                    marginBottom: 12,
                    fontWeight: 700,
                  }}>
                    TAGS
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {champion.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '5px 14px',
                          border: `1px solid ${champion.color}60`,
                          color: '#8FA3C0',
                          fontSize: 12,
                          fontFamily: 'beaufort, serif',
                          letterSpacing: 1.5,
                          background: `${champion.color}10`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              GAMERSENSE TIP — full width, most prominent section
          ══════════════════════════════════════════════════════════ */}
          <motion.div
            variants={scrollFadeUp}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            style={{ marginTop: 80 }}
          >
            {/* Outer = entry via variants above; inner = pulsing box-shadow */}
            <motion.div
              style={{
                border: `3px solid ${champion.color}`,
                background: `linear-gradient(135deg, ${champion.color}12 0%, #0D1F3C 45%, #0a1628 100%)`,
                padding: '52px 56px',
                position: 'relative',
                overflow: 'hidden',
              }}
              animate={reduced ? {} : {
                boxShadow: [
                  `0 0 0px 0px ${champion.color}00`,
                  `0 0 44px 10px ${champion.color}50`,
                  `0 0 0px 0px ${champion.color}00`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Corner accent — top-left */}
              <div style={{
                position: 'absolute', top: -2, left: -2,
                width: 52, height: 52,
                borderTop: `4px solid ${champion.color}`,
                borderLeft: `4px solid ${champion.color}`,
                opacity: 0.7,
              }} />
              {/* Corner accent — bottom-right */}
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 52, height: 52,
                borderBottom: `4px solid ${champion.color}`,
                borderRight: `4px solid ${champion.color}`,
                opacity: 0.7,
              }} />

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <motion.span
                  style={{ fontSize: 56, lineHeight: 1, display: 'block', flexShrink: 0 }}
                  animate={reduced ? {} : {
                    filter: [
                      'drop-shadow(0 0 0px transparent)',
                      `drop-shadow(0 0 18px ${champion.color}90)`,
                      'drop-shadow(0 0 0px transparent)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  💡
                </motion.span>
                <div style={{
                  color: champion.color,
                  fontSize: 14,
                  letterSpacing: 4,
                  fontFamily: 'beaufort, serif',
                  fontWeight: 700,
                  textShadow: `0 0 16px ${champion.color}90`,
                }}>
                  GAMERSENSE TIP
                </div>
              </div>

              {/* Role-based tip text */}
              <p style={{
                color: '#E8EDF5',
                fontSize: 22,
                lineHeight: 1.85,
                margin: 0,
                fontFamily: 'beaufort, serif',
                fontWeight: 600,
              }}>
                {roleTip}
              </p>
            </motion.div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════
              NAVIGATION BUTTONS
          ══════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 80 }}>
            {prevChamp && (
              /* Outer: entry animation */
              <motion.div
                initial={reduced ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Inner: hover — two-layer pattern */}
                <motion.button
                  onClick={() => navigate(`/champion/${prevChamp.id}`)}
                  className="font-beaufort font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${champion.color}0e, rgba(13,31,60,0.92))`,
                    border: `2px solid #1E3A5F`,
                    color: '#8FA3C0',
                    padding: '20px 48px',
                    cursor: 'pointer',
                    fontSize: 18,
                    letterSpacing: 1.5,
                    minWidth: 220,
                    textAlign: 'center',
                  }}
                  animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
                  transition={{ filter: { duration: 0.15 } }}
                  whileHover={reduced ? {} : {
                    filter: `brightness(1.2) drop-shadow(0 0 22px ${champion.color})`,
                    scale: 1.08,
                    borderColor: champion.color,
                    color: '#E8EDF5',
                    transition: { duration: 0.2 },
                  }}
                >
                  ← {prevChamp.name}
                </motion.button>
              </motion.div>
            )}

            {nextChamp && (
              <motion.div
                initial={reduced ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.button
                  onClick={() => navigate(`/champion/${nextChamp.id}`)}
                  className="font-beaufort font-bold"
                  style={{
                    background: `linear-gradient(135deg, rgba(13,31,60,0.92), ${champion.color}0e)`,
                    border: `2px solid #1E3A5F`,
                    color: '#8FA3C0',
                    padding: '20px 48px',
                    cursor: 'pointer',
                    fontSize: 18,
                    letterSpacing: 1.5,
                    minWidth: 220,
                    textAlign: 'center',
                  }}
                  animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
                  transition={{ filter: { duration: 0.15 } }}
                  whileHover={reduced ? {} : {
                    filter: `brightness(1.2) drop-shadow(0 0 22px ${champion.color})`,
                    scale: 1.08,
                    borderColor: champion.color,
                    color: '#E8EDF5',
                    transition: { duration: 0.2 },
                  }}
                >
                  {nextChamp.name} →
                </motion.button>
              </motion.div>
            )}
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
