import { useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'

/**
 * Small fixed "Demo" pill shown only in the backend-free demo build.
 * Tapping it explains what the demo can and can't do.
 */
export default function DemoBadge() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', left: isMobile ? 10 : 16, bottom: isMobile ? 10 : 16, zIndex: 250, maxWidth: 'calc(100vw - 20px)' }}>
      {open && (
        <div
          id="demo-badge-info"
          role="note"
          style={{
            marginBottom: 8,
            width: isMobile ? 260 : 300,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(6, 15, 30, 0.95)',
            border: '1px solid #1E3A5F',
            color: '#E8EDF5',
            fontSize: 13,
            lineHeight: 1.5,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          <strong style={{ color: '#38E8CC' }}>Backend-free demo.</strong> You're signed in as a guest. Scenarios, Blitz, Trivia, Guess the Rank,
          the knowledge hub, levels and the leaderboard run in your browser with sample data (other players and Guess the Rank vote statistics are made up). Progress is saved on this device only.
          Live 1v1 duels need the real server.
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="demo-badge-info"
        className="font-beaufort font-bold"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 999,
          background: 'rgba(6, 15, 30, 0.88)',
          border: '1px solid #00C9A7',
          color: '#E8EDF5',
          fontSize: 12,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C9A7' }} />
        DEMO
        {!isMobile && <span style={{ color: '#8FA3C0', fontWeight: 400, letterSpacing: '0.04em' }}>· no server</span>}
      </button>
    </div>
  )
}
