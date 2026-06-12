import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useIsMobile } from '../hooks/useIsMobile'
import { apiPut } from '../lib/api'

import PlayerCard   from '../assets/Group 367.svg'
import UpgradeBtn   from '../assets/Group 321 upgrade button.svg'
import DefaultAvatar from '../assets/image 21.webp'
import { useAuthStore } from '../store/authStore'
import { useProfile }   from '../hooks/useProfile'
import StatsBg      from '../assets/Group 336.svg'
import RanksBg      from '../assets/Group 345.svg'
import StatFrame1   from '../assets/Group 347.svg'
import StatFrame2   from '../assets/Group 346.svg'
import StatFrame3   from '../assets/Group 348.svg'
import Rank1        from '../assets/Group 337.svg'
import Rank2        from '../assets/Group 338.svg'
import Rank3        from '../assets/Group 339.svg'
import Rank4        from '../assets/Group 340.svg'
import Rank5        from '../assets/Group 341.svg'
import Rank6        from '../assets/Group 342.svg'
import SeparatorLine from '../assets/Rectangle 6.svg'

// Group 367 native: 429 × 582  → render at CARD_W wide
const CARD_W = 230
const CARD_H = Math.round(CARD_W * (582 / 429))   // ≈ 312

// Group 321 upgrade button native: 431 × 100 → same width as card
const BTN_H = Math.round(CARD_W * (100 / 431))    // ≈ 53

// Gap between left column elements
const LEFT_GAP = 14

// Gap between left column and right column
const COL_GAP = 20

// Group 336 native: 1085 × 399  — separator at y=93 (23.31% from top)
// Group 345 native: 1085 × 280  — separator at y=87 (31.07% from top)
const STATS_RATIO  = 399 / 1085
const RANKS_RATIO  = 280 / 1085
const STATS_SEP_PCT = 93  / 399   // 23.31%
const RANKS_SEP_PCT = 87  / 280   // 31.07%

const RANK_CARDS  = [Rank1, Rank2, Rank3, Rank4, Rank5, Rank6]

const LABEL_GRADIENT: React.CSSProperties = {
  background: 'linear-gradient(to bottom, #FFFCF6, #969696)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}
const VALUE_GRADIENT: React.CSSProperties = {
  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}

const LOCAL_AVATAR_KEY = 'gs_avatar'

export default function Page10() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const { user, login, token } = useAuthStore()
  const { profile, loading: profileLoading } = useProfile(user?.id ?? null)

  const [editOpen, setEditOpen]     = useState(false)
  const [newName, setNewName]       = useState('')
  const [localAvatar, setLocalAvatar] = useState<string | null>(() => localStorage.getItem(LOCAL_AVATAR_KEY))
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const avatarSrc = localAvatar ?? profile?.avatarUrl ?? user?.avatarUrl ?? DefaultAvatar
  const displayName = profile?.username ?? user?.username ?? 'PLAYER'
  const displayLevel = profile?.level ?? user?.level ?? 1
  const displayPoints = profile?.totalPoints ?? null
  // XP progress within the current level (for the bar under LEVEL)
  const xpInto = profile?.xpIntoLevel ?? 0
  const xpSpan = profile?.xpForNextLevel ?? 0
  const xpPct  = xpSpan > 0 ? Math.min(100, Math.round((xpInto / xpSpan) * 100)) : 0

  const openEdit = useCallback(() => {
    setNewName(displayName)
    setSaveError(null)
    setEditOpen(true)
  }, [displayName])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setLocalAvatar(result)
      localStorage.setItem(LOCAL_AVATAR_KEY, result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSave = useCallback(async () => {
    if (!user?.id) return
    setSaving(true)
    setSaveError(null)
    try {
      const body: { username: string; avatarUrl?: string } = { username: newName.trim() }
      if (localAvatar) body.avatarUrl = localAvatar
      const updated = await apiPut<{ id: string; username: string; avatarUrl?: string }>(
        `/profile/${user.id}`,
        body,
      )
      if (token) login(token, { ...user, username: updated.username, avatarUrl: updated.avatarUrl ?? user.avatarUrl })
      setEditOpen(false)
    } catch {
      setSaveError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }, [user, token, newName, localAvatar, login])

  const STATS = useMemo(() => [
    { src: StatFrame1, label: 'GTR Completed', value: profileLoading ? '…' : String(profile?.gtrCompleted ?? 0) },
    { src: StatFrame2, label: 'Trivia Played',  value: profileLoading ? '…' : String(profile?.triviaPlayed ?? 0) },
    { src: StatFrame3, label: 'Quiz Completed', value: profileLoading ? '…' : String(profile?.quizCompleted ?? 0) },
  ], [profile, profileLoading])

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        <div style={{
          maxWidth: '1440px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: isMobile ? '16px 16px 40px' : '20px 79px 48px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* ── PROFILE heading ── */}
          <motion.div
            style={{ marginBottom: '22px' }}
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1
              className="font-beaufort font-bold"
              style={{
                display: 'inline-block',
                fontSize: isMobile ? '35px' : '54px',
                lineHeight: 1,
                margin: 0,
                paddingBottom: '6px',
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Profile
            </h1>
          </motion.div>

          {/* ── Two-column layout (stacks on mobile) ── */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: `${COL_GAP}px`,
            alignItems: isMobile ? 'center' : 'flex-start',
          }}>

            {/* ─── LEFT: Player card + Upgrade button ─── */}
            <motion.div
              style={{
                width: `${CARD_W}px`,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: `${LEFT_GAP}px`,
              }}
              initial={reduced ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Player card — SVG frame with avatar + username overlaid */}
              <div style={{ position: 'relative', width: `${CARD_W}px`, height: `${CARD_H}px` }}>
                {/* Edit button */}
                <button
                  onClick={openEdit}
                  style={{
                    position: 'absolute', top: 6, right: 6, zIndex: 10,
                    background: 'rgba(0,201,167,0.15)', border: '1px solid #00C9A7',
                    borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
                    color: '#00C9A7', fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '0.08em', fontWeight: 700,
                  }}
                >
                  EDIT
                </button>
                {/* SVG frame */}
                <img
                  src={PlayerCard}
                  alt="Player card"
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'fill' }}
                />
                {/* Avatar — positioned over the portrait rect (x=33,y=39,w=362,h=356 in 429×582 SVG) */}
                <img
                  src={avatarSrc}
                  alt=""
                  style={{
                    position: 'absolute',
                    top: '6.7%',
                    left: '7.7%',
                    width: '84.4%',
                    height: '61.2%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
                {/* Username + level text below portrait */}
                <div style={{
                  position: 'absolute',
                  top: '70%',
                  left: '4%',
                  right: '4%',
                  bottom: '8%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}>
                  <span
                    className="font-beaufort font-bold"
                    style={{ fontSize: 13, color: '#E8EDF5', letterSpacing: '0.05em', lineHeight: 1 }}
                  >
                    {displayName.toUpperCase()}
                  </span>
                  <span
                    className="font-beaufort font-bold"
                    style={{ fontSize: 11, color: '#00C9A7', letterSpacing: '0.12em', lineHeight: 1 }}
                  >
                    LEVEL {displayLevel}
                  </span>
                  {/* XP progress bar within the current level */}
                  {profile?.xpForNextLevel != null && (
                    <div style={{ width: '78%', marginTop: 2 }}>
                      <div style={{ height: 5, borderRadius: 3, background: '#0A1628', border: '1px solid #1E3A5F', overflow: 'hidden' }}>
                        <div style={{ width: `${xpPct}%`, height: '100%', background: 'linear-gradient(to right, #3AF9FF, #00A7AD)' }} />
                      </div>
                      <span style={{ display: 'block', textAlign: 'center', marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: '#8FA3C0', letterSpacing: '0.06em' }}>
                        {xpInto} / {xpSpan} XP
                      </span>
                    </div>
                  )}
                  {displayPoints !== null && (
                    <span
                      className="font-beaufort font-bold"
                      style={{ fontSize: 10, color: '#8FA3C0', letterSpacing: '0.1em', lineHeight: 1 }}
                    >
                      {displayPoints.toLocaleString()} PTS
                    </span>
                  )}
                </div>
              </div>

              {/* Group 321: Upgrade Membership button */}
              <motion.div
                whileHover={reduced ? {} : { opacity: 0.88, transition: { duration: 0.18 } }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={UpgradeBtn}
                  alt="Upgrade Membership"
                  style={{
                    display: 'block',
                    width: `${CARD_W}px`,
                    height: `${BTN_H}px`,
                    objectFit: 'fill',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* ─── RIGHT: Statistics + Current Ranks ─── */}
            <div style={{
              flex: 1,
              minWidth: 0,
              width: isMobile ? '100%' : undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>

              {/* Statistics panel — Group 336 (1085 × 399) */}
              <motion.div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: `${STATS_RATIO * 100}%`,   // preserves 1085:399 aspect ratio
                }}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                {/* Background */}
                <img
                  src={StatsBg}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />

                {/* Stat frames — sit in the area below the separator (y=93/399 ≈ 23.3%) */}
                <div style={{
                  position: 'absolute',
                  top: `${STATS_SEP_PCT * 100}%`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  padding: '1% 5%',
                }}>
                  {STATS.map(({ src, label, value }, i) => (
                    <motion.div
                      key={i}
                      style={{ height: '87%', width: 'auto', position: 'relative', display: 'flex', alignItems: 'stretch' }}
                      initial={reduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                    >
                      <img src={src} alt="" loading="lazy" style={{ height: '100%', width: 'auto', display: 'block' }} />
                      {/* Text overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'flex-end',
                        paddingBottom: '10%', gap: 4, pointerEvents: 'none',
                      }}>
                        <span className="font-beaufort font-bold" style={{ fontSize: 17.75, lineHeight: 1, ...LABEL_GRADIENT }}>
                          {label}
                        </span>
                        <span className="font-beaufort font-bold" style={{ fontSize: 33.73, lineHeight: 1, ...VALUE_GRADIENT }}>
                          {value}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Current Ranks panel — Group 345 (1085 × 280) */}
              <motion.div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: `${RANKS_RATIO * 100}%`,  // preserves 1085:280 aspect ratio
                }}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                {/* Background */}
                <img
                  src={RanksBg}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />

                {/* Rank cards — below separator (y=87/280 ≈ 31.1%) */}
                <div style={{
                  position: 'absolute',
                  top: `${RANKS_SEP_PCT * 100}%`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  padding: '0 3%',
                }}>
                  {RANK_CARDS.map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt=""
                      loading="lazy"
                      style={{ height: '82%', width: 'auto', display: 'block' }}
                      initial={reduced ? false : { opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.42 + i * 0.055 }}
                    />
                  ))}
                </div>
              </motion.div>

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

      {/* ── Edit Profile Modal ── */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setEditOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(6,15,30,0.75)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0D1F3C', border: '1px solid #1E3A5F',
                borderRadius: 10, padding: '32px 28px', width: 360,
                display: 'flex', flexDirection: 'column', gap: 20,
              }}
            >
              <h2 className="font-beaufort font-bold" style={{
                fontSize: 24, margin: 0, paddingBottom: 4,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Edit Profile</h2>

              {/* Avatar preview + upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <img
                  src={localAvatar ?? profile?.avatarUrl ?? user?.avatarUrl ?? DefaultAvatar}
                  alt=""
                  style={{ width: 90, height: 90, borderRadius: 6, objectFit: 'cover', border: '2px solid #1E3A5F' }}
                />
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    background: 'none', border: '1px solid #1E3A5F',
                    color: '#8FA3C0', cursor: 'pointer', padding: '6px 16px',
                    borderRadius: 4, fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, letterSpacing: '0.08em',
                  }}
                >
                  Upload Photo
                </button>
              </div>

              {/* Username */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>
                  USERNAME
                </label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  maxLength={32}
                  style={{
                    background: '#060F1E', border: '1px solid #1E3A5F',
                    borderRadius: 4, padding: '8px 12px',
                    color: '#E8EDF5', fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>

              {saveError && (
                <span style={{ color: '#ef4444', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
                  {saveError}
                </span>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditOpen(false)}
                  style={{
                    background: 'none', border: '1px solid #1E3A5F',
                    color: '#8FA3C0', cursor: 'pointer', padding: '8px 20px',
                    borderRadius: 4, fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, letterSpacing: '0.08em',
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={() => { void handleSave() }}
                  disabled={saving || !newName.trim()}
                  style={{
                    background: saving ? '#1E3A5F' : 'linear-gradient(to right, #00C9A7, #0090A7)',
                    border: 'none', color: '#060F1E', cursor: saving ? 'not-allowed' : 'pointer',
                    padding: '8px 24px', borderRadius: 4,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
                  }}
                >
                  {saving ? 'SAVING…' : 'SAVE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
