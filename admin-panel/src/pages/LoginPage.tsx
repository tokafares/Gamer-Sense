import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost, setToken } from '../lib/api'

interface LoginResponse {
  token: string
  user: { role: string }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiPost<LoginResponse>('/auth/login', { email, password })
      if (data.user.role !== 'admin') {
        setError('Access denied: admin role required')
        return
      }
      setToken(data.token)
      localStorage.setItem('gs_admin_role', data.user.role)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060F1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      <div style={{
        background: '#0D1F3C',
        border: '1px solid #1E3A5F',
        borderRadius: 10,
        padding: '40px 48px',
        width: 360,
      }}>
        <h1 style={{ color: '#00C9A7', fontSize: 22, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 28 }}>
          GAMERSENSE ADMIN
        </h1>

        {error && (
          <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <form onSubmit={(e) => { void handleSubmit(e) }}>
          <label style={{ fontSize: 12, color: '#8FA3C0', letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              background: '#112040',
              border: '1px solid #1E3A5F',
              borderRadius: 5,
              color: '#E8EDF5',
              padding: '10px 12px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />

          <label style={{ fontSize: 12, color: '#8FA3C0', letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              background: '#112040',
              border: '1px solid #1E3A5F',
              borderRadius: 5,
              color: '#E8EDF5',
              padding: '10px 12px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              marginBottom: 24,
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#00C9A7',
              color: '#060F1E',
              border: 'none',
              borderRadius: 5,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}
