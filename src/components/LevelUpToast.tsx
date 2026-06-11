import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLevelUpStore } from '../store/levelUpStore'

export default function LevelUpToast() {
  const reduced = useReducedMotion()
  const level = useLevelUpStore(s => s.level)
  const clear = useLevelUpStore(s => s.clear)

  useEffect(() => {
    if (level == null) return
    const t = setTimeout(clear, 4000)
    return () => clearTimeout(t)
  }, [level, clear])

  return (
    <AnimatePresence>
      {level != null && (
        <motion.div
          key={level}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={clear}
          style={{
            position: 'fixed', left: '50%', bottom: 48, transform: 'translateX(-50%)',
            zIndex: 300, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '16px 40px', borderRadius: 12,
            background: 'linear-gradient(180deg, #0D2436 0%, #0A1628 100%)',
            border: '1px solid #00C9A7',
            boxShadow: '0 0 32px rgba(0,201,167,0.4)',
          }}
        >
          <motion.span
            className="font-beaufort font-bold"
            animate={reduced ? {} : { filter: ['drop-shadow(0 0 4px rgba(58,249,255,0.5))', 'drop-shadow(0 0 16px rgba(58,249,255,0.9))', 'drop-shadow(0 0 4px rgba(58,249,255,0.5))'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontSize: 14, letterSpacing: '0.2em',
              background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            LEVEL UP!
          </motion.span>
          <span className="font-beaufort font-bold" style={{
            fontSize: 34, lineHeight: 1,
            background: 'linear-gradient(to bottom, #FFFCF6, #C9A227)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Level {level}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
