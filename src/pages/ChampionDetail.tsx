import type { CSSProperties } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useChampions } from '../hooks/useChampions'
import type { Role, ChampionStats } from '../types/champion'

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
  ADC:     "Ask yourself: Are they protected in teamfights? Can I actually reach their backline, or is diving them a trap? Identify the support's engage range before committing to a fight.",
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

const BARLOW_COND = "'Barlow Condensed', sans-serif"
const BARLOW      = "'Barlow', sans-serif"

const glass: CSSProperties = {
  background: 'rgba(13, 31, 60, 0.25)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12,
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function ChampionDetail() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const reduced   = useReducedMotion()
  const { champions, loading } = useChampions()

  /* ── loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060F1E' }}>
        <motion.div
          style={{ color: '#8FA3C0', fontFamily: BARLOW_COND, fontSize: 20, letterSpacing: 3 }}
          animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          LOADING...
        </motion.div>
      </div>
    )
  }

  const champion = id ? champions.find(c => c.id === id) : undefined

  /* ── not found ── */
  if (!champion) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, background: '#060F1E' }}>
        <div style={{ color: '#E8EDF5', fontSize: 40, fontFamily: BARLOW_COND, fontWeight: 900 }}>
          Champion not found
        </div>
        <motion.button
          onClick={() => navigate('/page5')}
          style={{ background: 'none', border: '1px solid #00C9A7', color: '#00C9A7', padding: '12px 32px', cursor: 'pointer', fontFamily: BARLOW_COND, fontWeight: 700, fontSize: 14, letterSpacing: 2, borderRadius: 6 }}
          animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
          transition={{ filter: { duration: 0.15 } }}
          whileHover={reduced ? {} : { filter: 'brightness(1.2) drop-shadow(0 0 10px #00C9A7)', backgroundColor: 'rgba(0,201,167,0.08)' }}
        >
          ← KNOWLEDGE HUB
        </motion.button>
      </div>
    )
  }

  const currentIdx = champions.findIndex(c => c.id === id)
  const prevChamp  = currentIdx > 0 ? champions[currentIdx - 1] : null
  const nextChamp  = currentIdx < champions.length - 1 ? champions[currentIdx + 1] : null
  const stats      = Object.entries(champion.stats) as [keyof ChampionStats, number][]
  const tip        = champion.gameSenseTip || ROLE_TIPS[champion.role]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#060F1E' }}>

      {/* ══ BACKGROUND LAYER ══════════════════════════════════════════════════ */}
      <div className="cd-bg">
        {/* Splash art — left 65%, masked right edge */}
        <img
          className="cd-splash-img"
          src={champion.splashUrl}
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '75%',
            objectFit: 'cover',
            objectPosition: '20% center',
            maskImage: 'linear-gradient(to right, black 50%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 90%)',
          } as CSSProperties}
        />
        {/* Champion-color atmospheric glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 20% 50%, ${champion.color}25 0%, transparent 60%)`,
        }} />
        {/* Dark vignette — only darkens behind the right panel, left stays clear */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, transparent 0%, transparent 40%, rgba(6,15,30,0.55) 58%, rgba(6,15,30,0.95) 100%)',
        }} />
      </div>

      {/* ══ BACK BUTTON ═══════════════════════════════════════════════════════ */}
      <motion.button
        onClick={() => navigate('/page5')}
        style={{
          position: 'fixed',
          top: 28,
          left: 32,
          zIndex: 30,
          background: 'rgba(6,15,30,0.7)',
          border: '1px solid rgba(0,201,167,0.45)',
          color: '#00C9A7',
          padding: '9px 22px',
          cursor: 'pointer',
          fontFamily: BARLOW_COND,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.2em',
          borderRadius: 6,
          backdropFilter: 'blur(8px)',
        }}
        initial={reduced ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0, filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
        transition={{ default: { duration: 0.45, delay: 0.2 }, filter: { duration: 0.15 } }}
        whileHover={reduced ? {} : {
          filter: 'brightness(1.2) drop-shadow(0 0 8px #00C9A7)',
          backgroundColor: 'rgba(0,201,167,0.12)',
        }}
      >
        ← KNOWLEDGE HUB
      </motion.button>

      {/* ══ CHAMPION NAME — left panel, vertically centred ════════════════════ */}
      <div className="cd-name-panel">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p style={{
            fontSize: 11,
            letterSpacing: '0.3em',
            marginBottom: 14,
            marginTop: 0,
            color: champion.color,
            fontFamily: BARLOW_COND,
            fontWeight: 700,
          }}>
            #{String(currentIdx + 1).padStart(3, '0')} · {champion.role.toUpperCase()}
          </p>

          {/* Name — dark smoky backdrop + teal gradient + glow */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Smoky dark halo behind the text */}
            <div style={{
              position: 'absolute',
              inset: '-20px -50px -20px -20px',
              background: 'radial-gradient(ellipse at 35% 50%, rgba(2,6,18,0.92) 0%, rgba(4,10,28,0.7) 45%, transparent 75%)',
              filter: 'blur(22px)',
              pointerEvents: 'none',
            }} />
            {/* Warm golden-amber glow layer (depth) */}
            <div style={{
              position: 'absolute',
              inset: '-10px -30px -10px -10px',
              background: 'radial-gradient(ellipse at 30% 60%, rgba(180,120,20,0.18) 0%, transparent 60%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }} />
            <h1 style={{
              position: 'relative',
              fontSize: 'clamp(3.5rem, 7vw, 8.5rem)',
              fontFamily: "'Beaufort for LOL', serif",
              fontWeight: 700,
              lineHeight: 0.95,
              margin: 0,
              marginBottom: 0,
              color: champion.color,
              textShadow: `
                0 0 60px ${champion.color}90,
                0 0 120px ${champion.color}40,
                2px 2px 0px rgba(0,0,0,0.8),
                0 8px 32px rgba(0,0,0,0.9)
              `,
              letterSpacing: '0.04em',
              paintOrder: 'stroke fill',
              WebkitTextStroke: `1px ${champion.color}`,
            }}>
              {champion.name}
            </h1>
          </div>

          <p style={{
            marginTop: 14,
            marginBottom: 0,
            color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic',
            fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)',
            fontFamily: BARLOW,
            letterSpacing: '0.05em',
          }}>
            {champion.title}
          </p>
        </motion.div>
      </div>

      {/* ══ RIGHT SCROLLABLE COLUMN ═══════════════════════════════════════════ */}
      <div className="cd-right-col">

        {/* Role tag + description ─────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ ...glass, padding: '24px 28px' }}
        >
          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            border: `1px solid ${ROLE_COLORS[champion.role]}60`,
            color: ROLE_COLORS[champion.role],
            fontSize: 11,
            fontFamily: BARLOW_COND,
            fontWeight: 700,
            letterSpacing: '0.2em',
            background: `${ROLE_COLORS[champion.role]}15`,
            borderRadius: 4,
            marginBottom: 14,
          }}>
            {champion.role.toUpperCase()}
          </span>

          <p style={{
            color: 'rgba(232,237,245,0.85)',
            fontSize: 15,
            lineHeight: 1.75,
            margin: 0,
            fontFamily: BARLOW,
          }}>
            {champion.description}
          </p>

          {champion.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {champion.tags.map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px',
                  border: `1px solid ${champion.color}40`,
                  color: '#8FA3C0',
                  fontSize: 11,
                  fontFamily: BARLOW_COND,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  background: `${champion.color}0d`,
                  borderRadius: 4,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ ...glass, padding: '24px 28px' }}
        >
          <p style={{ margin: 0, marginBottom: 18, fontSize: 11, letterSpacing: '0.25em', fontFamily: BARLOW_COND, fontWeight: 700, color: champion.color }}>
            STATS
          </p>

          {/* Difficulty */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: '#8FA3C0', fontSize: 11, fontFamily: BARLOW_COND, fontWeight: 700, letterSpacing: '0.2em' }}>
              DIFFICULTY
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: 3 }, (_, i) => (
                <motion.span
                  key={i}
                  style={{ fontSize: 22, color: i < champion.difficulty ? '#C9A227' : 'rgba(255,255,255,0.12)', lineHeight: 1 }}
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
                >
                  ★
                </motion.span>
              ))}
            </div>
          </div>

          {/* Stat bars */}
          {stats.map(([key, value], i) => {
            const pct = Math.round((value / 5) * 100)
            return (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ color: '#8FA3C0', fontSize: 11, fontFamily: BARLOW_COND, fontWeight: 700, letterSpacing: '0.15em' }}>
                    {STAT_LABELS[key]}
                  </span>
                  <span style={{ color: '#E8EDF5', fontSize: 12, fontFamily: BARLOW_COND, fontWeight: 700 }}>
                    {value}/5
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${champion.color}, #00C9A7)`,
                      borderRadius: 4,
                      boxShadow: `0 0 8px ${champion.color}70`,
                    }}
                    initial={reduced ? false : { width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Strengths ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ ...glass, padding: '24px 28px' }}
        >
          <p style={{ margin: 0, marginBottom: 16, fontSize: 11, letterSpacing: '0.25em', fontFamily: BARLOW_COND, fontWeight: 700, color: '#22c55e' }}>
            STRENGTHS
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {champion.strengths.map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: '#22c55e', fontSize: 15, lineHeight: 1.55, flexShrink: 0 }}>✓</span>
                <span style={{ color: 'rgba(232,237,245,0.9)', fontSize: 14, lineHeight: 1.65, fontFamily: BARLOW }}>
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ ...glass, padding: '24px 28px' }}
        >
          <p style={{ margin: 0, marginBottom: 16, fontSize: 11, letterSpacing: '0.25em', fontFamily: BARLOW_COND, fontWeight: 700, color: '#ef4444' }}>
            WEAKNESSES
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {champion.weaknesses.map((w, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: '#ef4444', fontSize: 15, lineHeight: 1.55, flexShrink: 0 }}>✗</span>
                <span style={{ color: 'rgba(232,237,245,0.9)', fontSize: 14, lineHeight: 1.65, fontFamily: BARLOW }}>
                  {w}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* GamerSense Tip ─────────────────────────────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: `linear-gradient(135deg, ${champion.color}20 0%, rgba(13,31,60,0.25) 100%)`,
            border: `1px solid ${champion.color}35`,
            borderRadius: 12,
            padding: '24px 28px',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <motion.span
              style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}
              animate={reduced ? {} : {
                filter: [
                  'drop-shadow(0 0 0px transparent)',
                  `drop-shadow(0 0 12px ${champion.color}90)`,
                  'drop-shadow(0 0 0px transparent)',
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              💡
            </motion.span>
            <span style={{ color: champion.color, fontSize: 11, letterSpacing: '0.25em', fontFamily: BARLOW_COND, fontWeight: 700, textShadow: `0 0 12px ${champion.color}80` }}>
              GAMERSENSE TIP
            </span>
          </div>
          <p style={{ color: 'rgba(232,237,245,0.85)', fontSize: 14, lineHeight: 1.75, margin: 0, fontFamily: BARLOW }}>
            {tip}
          </p>
        </motion.div>

      </div>

      {/* ══ PREV / NEXT — fixed bottom ════════════════════════════════════════ */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: 12,
      }}>
        {prevChamp && (
          <motion.button
            onClick={() => navigate(`/champion/${prevChamp.id}`)}
            style={{
              background: 'rgba(13,31,60,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#8FA3C0',
              padding: '10px 24px',
              cursor: 'pointer',
              fontFamily: BARLOW_COND,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.12em',
              borderRadius: 8,
              backdropFilter: 'blur(12px)',
            }}
            animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
            transition={{ filter: { duration: 0.15 } }}
            whileHover={reduced ? {} : {
              filter: `brightness(1.2) drop-shadow(0 0 12px ${champion.color})`,
              borderColor: champion.color,
              color: '#E8EDF5',
              transition: { duration: 0.2 },
            }}
          >
            ← {prevChamp.name}
          </motion.button>
        )}
        {nextChamp && (
          <motion.button
            onClick={() => navigate(`/champion/${nextChamp.id}`)}
            style={{
              background: 'rgba(13,31,60,0.8)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#8FA3C0',
              padding: '10px 24px',
              cursor: 'pointer',
              fontFamily: BARLOW_COND,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.12em',
              borderRadius: 8,
              backdropFilter: 'blur(12px)',
            }}
            animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
            transition={{ filter: { duration: 0.15 } }}
            whileHover={reduced ? {} : {
              filter: `brightness(1.2) drop-shadow(0 0 12px ${champion.color})`,
              borderColor: champion.color,
              color: '#E8EDF5',
              transition: { duration: 0.2 },
            }}
          >
            {nextChamp.name} →
          </motion.button>
        )}
      </div>

    </div>
  )
}
