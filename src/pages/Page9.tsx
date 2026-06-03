import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import PlayerBg    from '../assets/Player Profile Bg.svg'
import GrayProfile from '../assets/gray profile.png'
import { useAuthStore } from '../store/authStore'
import WinnerCup  from '../assets/Group 323.png'
import RematchBtn from '../assets/Group 321.svg'
import { useGameStore } from '../store/gameStore'
import { getSocket } from '../lib/socket'
import { useGTRRound } from '../hooks/useGTRRound'

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
  const { answers, opponentScore } = useGameStore()
  const { user } = useAuthStore()
  const correctCount = answers.filter(a => a.isCorrect).length

  // match:end from socket — updates winner display
  const [socketWinnerId, setSocketWinnerId] = useState<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socket.on('match:end', (d: { winnerId: string; hostScore: number; invitedScore: number }) => {
      setSocketWinnerId(d.winnerId)
    })
    return () => { socket.off('match:end') }
  }, [])

  // GTR round stats
  const { round: gtrRound, stats: gtrStats, loading: gtrLoading, submitVote, result: gtrVoteResult } = useGTRRound()
  const { setGTRResult } = useGameStore()

  // Persist GTR result to game store for Page 12 to consume
  useEffect(() => {
    if (gtrVoteResult && gtrStats && gtrRound) {
      setGTRResult({
        roundId: gtrRound.id,
        votedRank: gtrVoteResult.votedRank,
        correctRank: gtrVoteResult.correctRank,
        totalVotes: gtrStats.totalVotes,
        percentages: gtrStats.percentages,
      })
    }
  }, [gtrVoteResult, gtrStats, gtrRound, setGTRResult])
  const isWinner = socketWinnerId ? socketWinnerId === user?.id : correctCount > opponentScore
  void isWinner // used by parent scope to determine UI — suppress lint

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
                img={user?.avatarUrl ?? GrayProfile}
                blurred
                overlayImg={WinnerCup}
                label="WINNER"
                labelFontSize={50}
                reduced={reduced}
                delay={0.1}
              />
              <motion.div
                style={{
                  width: 287, height: 54,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#0D1F3C', border: '1px solid #1E3A5F',
                }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
              >
                <span className="font-beaufort font-bold" style={{ fontSize: 24, color: '#00C9A7', lineHeight: 1 }}>
                  {correctCount}
                </span>
                <span className="font-beaufort font-medium" style={{ fontSize: 13, color: '#8FA3C0', letterSpacing: '0.05em', lineHeight: 1 }}>
                  Correct Answers
                </span>
              </motion.div>
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
              <motion.div
                style={{
                  width: 287, height: 54,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#0D1F3C', border: '1px solid #1E3A5F',
                }}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              >
                <span className="font-beaufort font-bold" style={{ fontSize: 24, color: '#8FA3C0', lineHeight: 1 }}>
                  {opponentScore}
                </span>
                <span className="font-beaufort font-medium" style={{ fontSize: 13, color: '#8FA3C0', letterSpacing: '0.05em', lineHeight: 1 }}>
                  Correct Answers
                </span>
              </motion.div>
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

          {/* GTR round stats — shown after voting */}
          {!gtrLoading && gtrRound && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{ marginTop: 40, width: '100%', maxWidth: 600, background: '#0D1F3C', border: '1px solid #1E3A5F', borderRadius: 8, padding: '24px 28px' }}
            >
              <p className="font-beaufort font-bold" style={{ fontSize: 18, color: '#E8EDF5', margin: '0 0 16px' }}>
                Guess The Rank
              </p>
              <img src={gtrRound.imageUrl} alt="GTR Round" style={{ width: '100%', borderRadius: 4, marginBottom: 16 }} />
              {gtrStats ? (
                <div>
                  <p style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.1em', marginBottom: 8 }}>
                    CORRECT RANK: <span style={{ color: '#00C9A7' }}>{gtrRound.correctRank.toUpperCase()}</span> — {gtrStats.totalVotes} votes
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(gtrStats.percentages).map(([rank, pct]) => (
                      <div key={rank} style={{ textAlign: 'center', minWidth: 52 }}>
                        <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                          <div style={{ width: 36, background: rank === gtrRound.correctRank ? '#00C9A7' : '#1E3A5F', height: `${Math.max(4, pct * 0.6)}px`, borderRadius: '2px 2px 0 0' }} />
                        </div>
                        <p style={{ color: '#8FA3C0', fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", margin: 0, textTransform: 'capitalize' }}>{rank.slice(0,3)}</p>
                        <p style={{ color: '#E8EDF5', fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", margin: 0 }}>{pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['iron','bronze','silver','gold','platinum','emerald','diamond','master','grandmaster','challenger'].map(rank => (
                    <button
                      key={rank}
                      onClick={() => void submitVote(rank)}
                      style={{
                        padding: '6px 12px', background: '#112040', border: '1px solid #1E3A5F',
                        borderRadius: 4, cursor: 'pointer', color: '#E8EDF5',
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.08em',
                        textTransform: 'capitalize', transition: 'border-color 0.2s',
                      }}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

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
