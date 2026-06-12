import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import DialogBg from '../assets/DialogBg.png'
import AnswerBg from '../assets/Group 264.png'

const LABEL_CLS = 'font-beaufort font-bold bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent'
const PARA_CLS  = 'font-beaufort font-medium bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent'

export interface QAOption { id: string; text: string }

interface QAPanelProps {
  questionLabel: string
  questionText: string
  options: QAOption[]
  selectedAnswer: string | null
  locked: boolean
  loading?: boolean
  /** whether to paint correct/wrong states on the answers */
  reveal: boolean
  correctAnswer?: string | null
  onSelect: (id: string) => void
  /** Scenarios only — Blitz & Trivia pass false (no hint box) */
  showHint?: boolean
  hint?: string | null
  /** extra content rendered at the bottom of the panel (e.g. duel status) */
  statusSlot?: ReactNode
  isMobile: boolean
  style?: CSSProperties
}

const FRAME: CSSProperties = {
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  boxSizing: 'border-box',
}

export default function QAPanel({
  questionLabel, questionText, options, selectedAnswer, locked, loading = false,
  reveal, correctAnswer, onSelect, showHint = false, hint, statusSlot, isMobile, style,
}: QAPanelProps) {
  const reduced = useReducedMotion()

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        gap: isMobile ? '8px' : '10px',
        width: '100%', height: isMobile ? 'auto' : '100%',
        boxSizing: 'border-box', ...style,
      }}
    >
      {/* Question box */}
      <div style={{ ...FRAME, backgroundImage: `url(${DialogBg})`, padding: isMobile ? '12px 16px' : '16px 22px', flexShrink: 0 }}>
        <p className={LABEL_CLS} style={{ fontSize: isMobile ? '15px' : '18px', lineHeight: 1.2, margin: '0 0 6px' }}>
          {questionLabel}
        </p>
        <p className={PARA_CLS} style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: 1.45, margin: 0 }}>
          {questionText}
        </p>
      </div>

      {/* Answers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px', flex: isMobile ? 'none' : 1, minHeight: 0 }}>
        {options.map(opt => {
          const id = opt.id
          const isSelected = selectedAnswer === id && !reveal
          const isCorrect  = reveal && correctAnswer === id
          const isWrong    = reveal && selectedAnswer === id && correctAnswer !== id
          const interactive = !locked && !loading
          const overlayBorder = isCorrect ? '#00C9A7' : isWrong ? '#ef4444' : isSelected ? '#3AF9FF' : null
          const overlayBg = isCorrect ? 'rgba(0,201,167,0.16)'
            : isWrong ? 'rgba(239,68,68,0.16)'
            : isSelected ? 'rgba(58,249,255,0.10)'
            : null
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => interactive && onSelect(id)}
              disabled={locked}
              aria-label={`Answer ${id}`}
              whileHover={reduced || !interactive || isSelected ? {} : { filter: 'brightness(1.12)' }}
              animate={{ filter: 'brightness(1)' }}
              transition={{ duration: 0.18 }}
              style={{
                ...FRAME, backgroundImage: `url(${AnswerBg})`,
                position: 'relative', border: 'none', borderRadius: 6,
                textAlign: 'left', padding: isMobile ? '0 16px' : '0 20px',
                minHeight: isMobile ? 48 : 56, flex: isMobile ? 'none' : 1,
                display: 'flex', alignItems: 'center',
                cursor: interactive ? 'pointer' : 'default',
              }}
            >
              {overlayBorder && (
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 6,
                  border: `2px solid ${overlayBorder}`,
                  background: overlayBg ?? 'transparent',
                  pointerEvents: 'none',
                }} />
              )}
              <span className={PARA_CLS} style={{ position: 'relative', fontSize: isMobile ? '13px' : '14px', lineHeight: 1.35 }}>
                {id}.&nbsp;{opt.text}{isCorrect ? '  ✓' : isWrong ? '  ✗' : ''}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Hint box — Scenarios only */}
      {showHint && (
        <div style={{ ...FRAME, backgroundImage: `url(${DialogBg})`, padding: isMobile ? '12px 16px' : '14px 22px', flexShrink: 0 }}>
          <p className={LABEL_CLS} style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: 1.2, margin: '0 0 5px' }}>
            Hint:
          </p>
          <p className={PARA_CLS} style={{ fontSize: isMobile ? '12px' : '13px', lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
            {hint ? `"${hint}"` : ''}
          </p>
        </div>
      )}

      {statusSlot}
    </div>
  )
}
