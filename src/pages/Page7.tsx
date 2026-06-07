import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import PlayerBg    from '../assets/Player Profile Bg.svg'
import GrayProfile from '../assets/gray profile.png'
import InviteBtn   from '../assets/Group 317.svg'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import type { MatchQuestion } from '../store/gameStore'
import { apiPost } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

const CARD_W  = 360
const CARD_H  = Math.round(CARD_W * 504 / 441)
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
        <img
          src={PlayerBg}
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        />
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
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setMatchStart } = useGameStore()

  const [_matchId,   setMatchId]    = useState<string | null>(null)
  const [inviteUrl,  setInviteUrl]  = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [status,     setStatus]     = useState<'idle' | 'waiting' | 'ready'>('idle')

  useEffect(() => {
    if (!import.meta.env.VITE_API_URL || !user) return
    let cancelled = false
    let navigating = false

    apiPost<{ matchId: string; inviteToken: string; inviteUrl: string }>('/matches/create', {})
      .then(res => {
        if (cancelled) return
        setMatchId(res.matchId)
        setInviteUrl(res.inviteUrl)
        setStatus('waiting')

        const socket = connectSocket()
        socket.emit('match:join', { token: res.inviteToken, userId: user.id })

        socket.on('match:waiting', () => {
          if (!cancelled) setStatus('waiting')
        })
        socket.on('match:start', (d: { matchId: string; questions: MatchQuestion[] }) => {
          if (cancelled) return
          navigating = true
          setMatchStart(d.matchId, d.questions)
          setStatus('ready')
          navigate('/page1')
        })
        socket.on('match:error', (d: { message: string }) => {
          if (!cancelled) setMatchError(d.message)
        })
      })
      .catch(() => { if (!cancelled) setMatchError('Failed to create match') })

    return () => {
      cancelled = true
      // Keep socket connected when navigating into the match
      if (!navigating) disconnectSocket()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function copyInvite() {
    if (!inviteUrl) return
    void navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '64px' }}>

            <PlayerCard
              img={user?.avatarUrl ?? GrayProfile}
              reduced={reduced}
              delay={0.1}
              label={user?.username ?? 'Host Player Profile'}
            />

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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <PlayerCard
                img={GrayProfile}
                reduced={reduced}
                delay={0.3}
                label="Invited Player"
                labelFrom="#FFFFFF"
                labelTo="#D0D8E4"
              />
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: CARD_W }}
              >
                {/* Invite link display */}
                {inviteUrl && (
                  <a
                    href={inviteUrl}
                    onClick={e => { e.preventDefault(); copyInvite() }}
                    style={{
                      color: '#00C9A7',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      wordBreak: 'break-all',
                      textAlign: 'center',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {inviteUrl}
                  </a>
                )}

                <motion.img
                  src={InviteBtn}
                  alt="Copy Invite Link"
                  onClick={copyInvite}
                  style={{ width: 242, height: 45, display: 'block', cursor: inviteUrl ? 'pointer' : 'default', opacity: inviteUrl ? 1 : 0.5 }}
                  whileHover={reduced || !inviteUrl ? {} : { scale: 1.05, transition: { duration: 0.2 } }}
                />

                {copied && (
                  <span style={{ color: '#00C9A7', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>
                    LINK COPIED!
                  </span>
                )}
                {status === 'waiting' && !copied && (
                  <span style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#8FA3C0', animation: 'pulse 1.4s ease-in-out infinite' }} />
                    WAITING FOR OPPONENT…
                  </span>
                )}
                {status === 'ready' && (
                  <span style={{ color: '#00C9A7', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>
                    OPPONENT JOINED — STARTING!
                  </span>
                )}
                {matchError && (
                  <span style={{ color: '#ef4444', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12 }}>{matchError}</span>
                )}
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
    </>
  )
}
