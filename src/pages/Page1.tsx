import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer, slideFromLeft } from '../lib/animations'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useGameStore } from '../store/gameStore'
import type { MatchQuestion } from '../store/gameStore'
import { connectSocket, disconnectSocket } from '../lib/socket'

/* ─── data ────────────────────────────────────────────── */

const offerCards = [
  {
    title: 'Scenario-Based\nLearning',
    desc:  'Challenge your critical thinking with real in-game scenarios.',
  },
  {
    title: 'Self-Paced\nEnvironment',
    desc:  'Learn at your own pace with no pressure.',
  },
  {
    title: 'Community\nInteraction',
    desc:  'Connect with other players and in tournaments or ranked',
  },
]

/* ─── Riot Games logo ─────────────────────────────────── */
const RiotLogo = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-label="Riot Games logo">
    <polygon points="28,3 53,16 53,40 28,53 3,40 3,16" fill="#C8102E" />
    <polygon points="28,10 46,19 46,37 28,46 10,37 10,19" fill="#8B0000" />
    <text
      x="28" y="34"
      textAnchor="middle"
      fontSize="18"
      fill="white"
      fontFamily="Arial Black, Helvetica Neue, sans-serif"
      fontWeight="900"
    >R</text>
  </svg>
)

/* ─── play icon ────────────────────────────────────────── */
const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
    <polygon points="0,0 14,7 0,14" />
  </svg>
)

/* ─── page ────────────────────────────────────────────── */

interface RoundResult {
  roundIndex: number
  correctAnswer: string
  explanation: string
  hostScore: number
  invitedScore: number
}

const Home = () => {
  const rm = useReducedMotion()
  const navigate = useNavigate()
  const { entries, loading, error } = useLeaderboard()
  const { matchId: storedMatchId, matchQuestions, clearMatch } = useGameStore()

  // Initialise from game store so first question is available immediately
  const [activeMatchId,   setActiveMatchId]   = useState<string | null>(storedMatchId)
  const [currentQuestion, setCurrentQuestion] = useState<MatchQuestion | null>(
    matchQuestions.length > 0 ? matchQuestions[0] : null
  )
  const [roundIndex,    setRoundIndex]    = useState(0)
  const [totalRounds,   setTotalRounds]   = useState(matchQuestions.length || 10)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [lastResult,    setLastResult]    = useState<RoundResult | null>(null)
  const [hostScore,     setHostScore]     = useState(0)
  const [invitedScore,  setInvitedScore]  = useState(0)

  useEffect(() => {
    // Connect when entering an active match; use passive getSocket otherwise
    const socket = activeMatchId ? connectSocket() : connectSocket()

    socket.on('match:start', (d: { matchId: string; questions: MatchQuestion[] }) => {
      setActiveMatchId(d.matchId)
      setTotalRounds(d.questions.length)
      if (d.questions.length > 0) setCurrentQuestion(d.questions[0])
    })
    socket.on('round:question', (d: { roundIndex: number; question: MatchQuestion }) => {
      setCurrentQuestion(d.question)
      setRoundIndex(d.roundIndex)
      setSelectedAnswer(null)
      setLastResult(null)
    })
    socket.on('round:result', (d: RoundResult) => {
      setLastResult(d)
      setHostScore(d.hostScore)
      setInvitedScore(d.invitedScore)
    })
    socket.on('match:end', (d: { winnerId: string; hostScore: number; invitedScore: number }) => {
      clearMatch()
      disconnectSocket()
      navigate('/page10', {
        state: {
          winnerId: d.winnerId,
          hostScore: d.hostScore,
          invitedScore: d.invitedScore,
        },
      })
    })

    return () => {
      socket.off('match:start')
      socket.off('round:question')
      socket.off('round:result')
      socket.off('match:end')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submitAnswer(answer: string) {
    if (!activeMatchId || selectedAnswer) return
    setSelectedAnswer(answer)
    connectSocket().emit('round:answer', { matchId: activeMatchId, roundIndex, answer })
  }

  return (
    <>
      <Header />

      {/* ── Live trivia overlay — shown when a socket match is active ── */}
      <AnimatePresence>
        {activeMatchId && currentQuestion && (
          <motion.div
            key="trivia-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(4,10,22,0.94)', backdropFilter: 'blur(6px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '40px 24px',
            }}
          >
            {/* Round counter + scores */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
              <span style={{
                color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13, letterSpacing: '0.15em',
              }}>
                ROUND {roundIndex + 1}/{totalRounds}
              </span>
              <div style={{ width: 1, height: 16, background: '#1E3A5F' }} />
              <span style={{ color: '#00C9A7', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.1em' }}>
                YOU {hostScore}
              </span>
              <span style={{ color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>—</span>
              <span style={{ color: '#C9A227', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.1em' }}>
                {invitedScore} OPP
              </span>
            </div>

            <p style={{ color: '#E8EDF5', fontFamily: "'Beaufort for LOL', serif", fontWeight: 700, fontSize: 22, textAlign: 'center', maxWidth: 600, marginBottom: 32 }}>
              {currentQuestion.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
              {currentQuestion.options.map(opt => {
                const isSelected = selectedAnswer === opt.id
                const isCorrect  = lastResult?.correctAnswer === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => submitAnswer(opt.id)}
                    disabled={!!selectedAnswer}
                    style={{
                      padding: '14px 20px', textAlign: 'left',
                      cursor: selectedAnswer ? 'default' : 'pointer',
                      background: isSelected
                        ? (isCorrect ? 'rgba(0,201,167,0.2)' : 'rgba(201,50,50,0.15)')
                        : isCorrect && lastResult
                          ? 'rgba(0,201,167,0.1)'
                          : '#0D1F3C',
                      border: `1px solid ${isSelected
                        ? (isCorrect ? '#00C9A7' : '#ef4444')
                        : isCorrect && lastResult ? '#00C9A7' : '#1E3A5F'}`,
                      borderRadius: 6, color: '#E8EDF5',
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: '#00C9A7', marginRight: 10 }}>{opt.id}.</span>{opt.text}
                  </button>
                )
              })}
            </div>

            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 20, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <p style={{ color: '#00C9A7', fontSize: 14, margin: '0 0 4px' }}>
                  Correct: <strong>{lastResult.correctAnswer}</strong>
                </p>
                {lastResult.explanation && (
                  <p style={{ color: '#8FA3C0', fontSize: 12, maxWidth: 480, margin: 0 }}>
                    {lastResult.explanation}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">

      {/* ══════════════════════════════════════════
          §1  HERO
      ══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '735px' }}>

        {/* Background — placeholder until hero image asset is added */}
        <div className="absolute inset-0 bg-gs-navy" />

        {/* Top-level dark tint so overall scene reads dark */}
        <div className="absolute inset-0" style={{ background: 'rgba(4,10,22,0.55)' }} />

        {/* Left-to-right gradient: opaque navy on text side, transparent on illustration side */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #060F1E 28%, rgba(6,15,30,0.82) 44%, rgba(6,15,30,0.40) 62%, rgba(6,15,30,0.10) 80%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full" style={{ minHeight: '735px' }}>

          {/* Left text column */}
          <div
            className="flex flex-col items-start shrink-0"
            style={{ paddingLeft: '79px', paddingTop: '128px', paddingBottom: '64px', maxWidth: '760px' }}
          >
            <motion.p
              variants={fadeUp}
              initial={rm ? false : 'hidden'}
              animate="show"
              className="font-bold leading-none"
              style={{
                fontSize: '54px',
                background: 'linear-gradient(to bottom, #fffcf6, #969696)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Master
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial={rm ? false : 'hidden'}
              animate="show"
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
              className="font-bold leading-none whitespace-nowrap"
              style={{
                fontSize: '90px',
                marginTop: '0px',
                background: 'linear-gradient(to bottom, #3af9ff 45.833%, #00a7ad 136.76%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              League of Legends
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial={rm ? false : 'hidden'}
              animate="show"
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.3 }}
              className="font-normal"
              style={{
                fontSize: '27px',
                lineHeight: '39.944px',
                marginTop: '36px',
                maxWidth: '631px',
                background: 'linear-gradient(to bottom, #fffcf6, #969696)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Enhance you decision-making skills with scenario based learning.
            </motion.p>

            <motion.button
              variants={fadeUp}
              initial={rm ? false : 'hidden'}
              animate="show"
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.45 }}
              whileHover={rm ? undefined : { scale: 1.04 }}
              className="flex items-center gap-3 border-2 border-gs-teal text-gs-teal font-bold tracking-widest hover:bg-gs-teal hover:text-gs-navy transition-colors"
              style={{ marginTop: '50px', height: '64px', paddingLeft: '24px', paddingRight: '40px', fontSize: '14px', letterSpacing: '2px' }}
            >
              <PlayIcon size={14} />
              GET STARTED
            </motion.button>
          </div>

          {/* Esports illustration placeholder */}
          <motion.div
            initial={rm ? false : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
            className="absolute right-0 pointer-events-none flex items-center justify-center"
            style={{ top: '65px', width: '875px', height: '520px' }}
          >
            <span className="text-gs-textMuted text-sm">[ esports image ]</span>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §2  WHAT WE OFFER
      ══════════════════════════════════════════ */}
      <section className="w-full py-16">
        <div
          className="mx-auto"
          style={{ maxWidth: '1200px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <h2
            className="text-gs-teal font-bold text-center leading-none"
            style={{ fontSize: '55px' }}
          >
            What we offer
          </h2>

          <p
            className="text-center mx-auto leading-relaxed"
            style={{ color: '#1a2b45', fontSize: '18px', marginTop: '28px', maxWidth: '1090px' }}
          >
            Gamersense is designed to improve your game sense without the stress of ranked games or
            coaching. Inspired by chess.com, we provide quizzed in-game scenarios focusing on
            rotations, trades, fights, and macro decisions.
          </p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 mt-12"
            style={{ gap: '36px' }}
            variants={staggerContainer}
            initial={rm ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true }}
          >
            {offerCards.map((card, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-gs-card flex flex-col items-center text-center overflow-hidden"
                style={{ border: '1px solid #1E3A5F' }}
              >
                {/* Champion portrait area */}
                <div
                  className="relative w-full flex items-center justify-center"
                  style={{ height: '290px', background: '#0D1F3C' }}
                >
                  <div
                    className="absolute"
                    style={{ inset: '13px', background: '#112040', border: '1px solid #1E3A5F' }}
                  />
                  <div
                    className="relative rounded-full bg-gs-navy"
                    style={{ width: '185px', height: '185px', border: '2px solid #00C9A7' }}
                  />
                </div>

                {/* Text */}
                <div
                  className="flex flex-col items-center"
                  style={{ padding: '24px 24px 32px' }}
                >
                  <h3
                    className="text-gs-teal font-semibold leading-tight whitespace-pre-line"
                    style={{ fontSize: '20px' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-gs-textMuted leading-relaxed"
                    style={{ fontSize: '14px', marginTop: '12px' }}
                  >
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §3  LEADERBOARD
      ══════════════════════════════════════════ */}
      <section className="w-full pt-16 pb-16">
        <div
          className="mx-auto"
          style={{ maxWidth: '1111px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <h2
            className="text-gs-teal font-bold text-center leading-none"
            style={{ fontSize: '55px' }}
          >
            Leaderboard
          </h2>

          {/* table */}
          <div className="mt-[50px] overflow-hidden" style={{ border: '1px solid #1E3A5F' }}>
            <div
              className="bg-gs-card grid grid-cols-4"
              style={{ borderBottom: '1px solid #1E3A5F', padding: '20px 32px' }}
            >
              {['Rank', 'Player Name', 'Points', 'Tier'].map((h) => (
                <span
                  key={h}
                  className="text-gs-teal font-bold text-center uppercase"
                  style={{ fontSize: '14px', letterSpacing: '1.5px' }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* minHeight prevents frame collapse in error state */}
            <div style={{ minHeight: '260px' }}>
            {loading ? (
              /* ── Skeleton rows — pulse wrapper respects reduced motion ── */
              <motion.div
                animate={rm ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 text-center"
                    style={{
                      padding: '16px 32px',
                      fontSize: '14px',
                      background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                    }}
                  >
                    {[28, 55, 35, 45].map((w, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                          height: '20px',
                          width: `${w}%`,
                          background: '#1E3A5F',
                          borderRadius: 3,
                        }} />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              /* ── Error state — vertically centred inside the reserved body area ── */
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '260px',
              }}>
                <span className="text-gs-textMuted" style={{ fontSize: '14px' }}>{error}</span>
              </div>
            ) : (
              /* ── Live data rows ── */
              <motion.div
                variants={staggerContainer}
                initial={rm ? false : 'hidden'}
                whileInView="show"
                viewport={{ once: true }}
              >
                {entries.map((row, i) => (
                  <motion.div
                    key={row.rank}
                    variants={slideFromLeft}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid grid-cols-4 text-center"
                    style={{
                      padding: '16px 32px',
                      fontSize: '14px',
                      background: i % 2 === 0 ? '#0D1F3C' : '#112040',
                    }}
                  >
                    <span className="text-gs-textMuted">{row.rank}</span>
                    <span className="text-gs-text">{row.username}</span>
                    <span className="text-gs-text">{row.points.toLocaleString()}</span>
                    <span className="text-gs-textMuted">{row.tier}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            </div>
          </div>

          {/* prize draw */}
          <div className="overflow-hidden" style={{ marginTop: '40px', border: '1px solid #1E3A5F' }}>
            <div
              className="text-center bg-gs-card"
              style={{ padding: '16px', borderBottom: '1px solid #1E3A5F' }}
            >
              <span
                className="text-gs-teal font-bold"
                style={{ fontSize: '20px', letterSpacing: '1px' }}
              >
                Prize Draw
              </span>
            </div>
            <div className="text-center bg-gs-card" style={{ padding: '24px 32px' }}>
              <p className="text-gs-text" style={{ fontSize: '14px' }}>
                Players in each tier are entered into a draw to win amazing prizes!
              </p>
            </div>
          </div>

          {/* VIEW button */}
          <div className="flex justify-center" style={{ marginTop: '32px' }}>
            <motion.button
              whileHover={rm ? undefined : { scale: 1.04 }}
              className="flex items-center gap-3 border-2 border-gs-teal text-gs-teal font-bold tracking-widest hover:bg-gs-teal hover:text-gs-navy transition-colors"
              style={{ height: '64px', paddingLeft: '24px', paddingRight: '40px', fontSize: '14px', letterSpacing: '2px' }}
            >
              <PlayIcon size={10} />
              VIEW
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §4  OUR PARTNERS
      ══════════════════════════════════════════ */}
      <section className="w-full pt-16 pb-16">
        <div
          className="text-center mx-auto"
          style={{ maxWidth: '1090px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <h2
            className="text-gs-teal font-bold leading-none"
            style={{ fontSize: '55px' }}
          >
            Our Partners
          </h2>

          <p
            className="leading-relaxed mx-auto"
            style={{ color: '#1a2b45', fontSize: '18px', marginTop: '20px', maxWidth: '1090px' }}
          >
            Collaborative excellence with the industry&apos;s best. We are proud to work alongside
            these visionaries to push the boundaries of what&apos;s possible.
          </p>

          <div className="flex flex-col items-center" style={{ marginTop: '48px', gap: '24px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <RiotLogo />
              <div className="flex flex-col items-start leading-none">
                <span
                  className="font-black"
                  style={{ color: '#060F1E', fontSize: '42px', letterSpacing: '0.1em', lineHeight: '1' }}
                >
                  RIOT
                </span>
                <span
                  className="font-black"
                  style={{ color: '#060F1E', fontSize: '22px', letterSpacing: '0.28em', lineHeight: '1', marginTop: '2px' }}
                >
                  GAMES
                </span>
              </div>
            </div>

            <motion.button
              whileHover={rm ? undefined : { scale: 1.04 }}
              className="bg-gs-card text-gs-text font-bold tracking-widest hover:bg-gs-teal hover:text-gs-navy transition-colors border border-gs-border"
              style={{ width: '214px', height: '60px', fontSize: '13px', letterSpacing: '2px' }}
            >
              LEARN MORE
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §5  OUR TEAM
      ══════════════════════════════════════════ */}
      <section className="w-full overflow-hidden bg-gs-navy">

        {/* Full-width image band — placeholder until team image asset is added */}
        <div className="relative w-full bg-gs-card flex items-center justify-center" style={{ height: '420px' }}>
          <span className="text-gs-textMuted text-sm">[ team image ]</span>
        </div>

        {/* Team info */}
        <div
          className="relative z-10"
          style={{ paddingLeft: '79px', paddingRight: '79px', paddingBottom: '64px', marginTop: '-48px' }}
        >
          <div style={{ maxWidth: '560px' }}>
            <h2
              className="text-gs-teal font-bold leading-none"
              style={{ fontSize: '55px' }}
            >
              Our Team
            </h2>
            <p
              className="text-gs-textMuted leading-relaxed"
              style={{ fontSize: '18px', marginTop: '20px' }}
            >
              Collaborative excellence with the industry&apos;s best. We are proud to work alongside
              these visionaries to push the boundaries of what&apos;s possible.
            </p>
            <motion.button
              whileHover={rm ? undefined : { scale: 1.04 }}
              className="bg-gs-card text-gs-text font-bold tracking-widest hover:bg-gs-teal hover:text-gs-navy transition-colors border border-gs-border"
              style={{ marginTop: '24px', width: '214px', height: '60px', fontSize: '13px', letterSpacing: '2px' }}
            >
              LEARN MORE
            </motion.button>
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </>
  )
}

export default Home
