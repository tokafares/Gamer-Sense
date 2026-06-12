import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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

const BOX: CSSProperties = {
  background: '#0D1F3C',
  borderRadius: 8,
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
      <div style={{ ...BOX, border: '1px solid #1E3A5F', padding: isMobile ? '12px 14px' : '14px 18px', flexShrink: 0 }}>
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
          const borderColor = isCorrect ? '#00C9A7' : isWrong ? '#ef4444' : isSelected ? '#3AF9FF' : '#1E3A5F'
          const bg = isCorrect ? 'rgba(0,201,167,0.12)'
            : isWrong ? 'rgba(239,68,68,0.12)'
            : isSelected ? 'rgba(58,249,255,0.07)'
            : '#0D1F3C'
          const interactive = !locked && !loading
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => interactive && onSelect(id)}
              disabled={locked}
              aria-label={`Answer ${id}`}
              whileHover={reduced || !interactive || isSelected ? {} : { borderColor: 'rgba(58,249,255,0.55)' }}
              style={{
                ...BOX, background: bg,
                borderWidth: 2, borderStyle: 'solid', borderColor,
                textAlign: 'left', padding: isMobile ? '12px 14px' : '0 18px',
                minHeight: isMobile ? 0 : 56, flex: isMobile ? 'none' : 1,
                display: 'flex', alignItems: 'center',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              <span className={PARA_CLS} style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: 1.35 }}>
                {id}.&nbsp;{opt.text}{isCorrect ? '  ✓' : isWrong ? '  ✗' : ''}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Hint box — Scenarios only */}
      {showHint && (
        <div style={{ ...BOX, border: '1px solid #1E3A5F', padding: isMobile ? '12px 14px' : '14px 18px', flexShrink: 0 }}>
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
