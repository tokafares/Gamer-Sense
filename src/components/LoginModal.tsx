import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../store/authStore'
import { apiPost, ApiError } from '../lib/api'

interface LoginResponse {
  token: string
  user: AuthUser
}

const BARLOW_COND = "'Barlow Condensed', sans-serif"

const INPUT_BASE: CSSProperties = {
  width: '100%',
  background: '#060F1E',
  border: '1px solid #1E3A5F',
  padding: '11px 14px',
  color: '#E8EDF5',
  fontSize: '14px',
  fontFamily: BARLOW_COND,
  fontWeight: 400,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  borderRadius: 4,
}

const INPUT_FOCUSED: CSSProperties = { ...INPUT_BASE, border: '1px solid #00C9A7' }

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuthStore()
  const reduced = useReducedMotion()

  const [mode,         setMode]         = useState<'login' | 'register'>('login')
  const [username,     setUsername]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    if (!loginModalOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [loginModalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    closeLoginModal()
    setUsername(''); setEmail(''); setPassword('')
    setError(null); setFocusedField(null)
    setMode('login')
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next); setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    // Client-side validation
    if (mode === 'register') {
      if (username.trim().length < 3) { setError('Username must be at least 3 characters'); return }
      if (username.trim().length > 32) { setError('Username must be 32 characters or fewer'); return }
      if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    }
    if (!email.includes('@')) { setError('Enter a valid email address'); return }

    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { token, user } = await apiPost<LoginResponse>('/auth/login', { email, password })
        login(token, user)
      } else {
        const { token, user } = await apiPost<LoginResponse>('/auth/register', { username: username.trim(), email, password })
        login(token, user)
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401 ? 'Invalid email or password'
          : err.status === 409 ? 'Email or username already in use'
          : err.status === 400 ? 'Check your details: username 3–32 chars, password 8+ chars'
          : `Server error (${err.status}) — try again`
          : 'Network error — check your connection'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(4, 10, 22, 0.75)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Scrollable centering wrapper */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflowY: 'auto',
              padding: '24px 16px',
              pointerEvents: 'none',
            }}
          >
          {/* Modal card */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Login"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              background: '#0D1F3C',
              border: '1px solid #1E3A5F',
              borderRadius: 10,
              padding: '40px 36px 36px',
              boxSizing: 'border-box',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              pointerEvents: 'auto',
              flexShrink: 0,
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close login modal"
              style={{
                position: 'absolute',
                top: 14,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8FA3C0',
                fontSize: 22,
                lineHeight: 1,
                padding: '2px 6px',
                fontFamily: BARLOW_COND,
              }}
            >
              ×
            </button>

            {/* Title */}
            <h2
              className="font-beaufort font-bold"
              style={{
                fontSize: 28, lineHeight: 1, marginTop: 0, marginBottom: 20,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {mode === 'login' ? 'LOGIN' : 'REGISTER'}
            </h2>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 4, overflow: 'hidden', border: '1px solid #1E3A5F' }}>
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: mode === m ? 'linear-gradient(to right, #3AF9FF22, #00A7AD22)' : 'transparent',
                    border: 'none', borderBottom: mode === m ? '2px solid #00C9A7' : '2px solid transparent',
                    color: mode === m ? '#00C9A7' : '#8FA3C0',
                    fontFamily: BARLOW_COND, fontWeight: 700, fontSize: 12,
                    letterSpacing: '0.15em', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {m === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Username — register only */}
              {mode === 'register' && (
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="gs-username" style={{ display: 'block', marginBottom: 6, color: '#8FA3C0', fontSize: 11, fontFamily: BARLOW_COND, fontWeight: 700, letterSpacing: '0.15em' }}>USERNAME</label>
                  <input
                    id="gs-username" type="text" autoComplete="username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                    placeholder="summoner_name" required minLength={3} maxLength={32}
                    disabled={loading} style={focusedField === 'username' ? INPUT_FOCUSED : INPUT_BASE}
                  />
                </div>
              )}
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="gs-email"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#8FA3C0',
                    fontSize: 11,
                    fontFamily: BARLOW_COND,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  EMAIL
                </label>
                <input
                  id="gs-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  style={focusedField === 'email' ? INPUT_FOCUSED : INPUT_BASE}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="gs-password"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    color: '#8FA3C0',
                    fontSize: 11,
                    fontFamily: BARLOW_COND,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  PASSWORD
                </label>
                <input
                  id="gs-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  style={focusedField === 'password' ? INPUT_FOCUSED : INPUT_BASE}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    margin: '0 0 16px',
                    color: '#ef4444',
                    fontSize: 13,
                    fontFamily: BARLOW_COND,
                    lineHeight: 1.4,
                  }}
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                animate={{
                  opacity: loading || !email || !password ? 0.5 : 1,
                  filter: 'brightness(1) drop-shadow(0 0 0px transparent)',
                }}
                whileHover={
                  reduced || loading || !email || !password
                    ? {}
                    : { filter: 'brightness(1.1) drop-shadow(0 0 12px #00C9A740)' }
                }
                transition={{ default: { duration: 0.2 }, filter: { duration: 0.15 } }}
                style={{
                  width: '100%',
                  height: 44,
                  background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                  fontFamily: BARLOW_COND,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.2em',
                  color: '#060F1E',
                }}
              >
                {loading ? (mode === 'login' ? 'SIGNING IN...' : 'CREATING...') : (mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')}
              </motion.button>
            </form>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
