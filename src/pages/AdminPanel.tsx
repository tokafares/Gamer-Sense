import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { apiGet, apiPost, apiPut, getToken } from '../lib/api'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Question {
  id: string
  type: string
  lane: string
  text: string
  hint: string | null
  options: { id: string; text: string }[]
  correctAnswer: string
  explanation: string
}

interface GTRRound {
  id: string
  imageUrl: string
  correctRank: string
  totalVotes?: number
}

interface AppUser {
  id: string
  username: string
  email: string
  role: string
  membershipTier: string
}

interface Video {
  id: string
  url: string
  type: string
  lane: string
  title?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? ''

async function apiDelete(path: string) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`${res.status}`)
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const C = {
  bg:       '#060F1E',
  card:     '#0D1F3C',
  border:   '#1E3A5F',
  teal:     '#00C9A7',
  tealText: '#3AF9FF',
  muted:    '#8FA3C0',
  text:     '#E8EDF5',
  red:      '#ef4444',
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: C.bg, border: `1px solid ${C.border}`,
  color: C.text, borderRadius: 4, padding: '8px 12px',
  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
  outline: 'none',
}

const btnStyle = (color = C.teal): React.CSSProperties => ({
  padding: '7px 18px', background: color, color: C.bg,
  border: 'none', borderRadius: 4, cursor: 'pointer',
  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  fontSize: 13, letterSpacing: '0.08em', whiteSpace: 'nowrap',
})

const ghostBtn: React.CSSProperties = {
  padding: '6px 14px', background: 'none',
  border: `1px solid ${C.border}`, color: C.muted,
  borderRadius: 4, cursor: 'pointer',
  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
}

const tableHead: React.CSSProperties = {
  textAlign: 'left', padding: '10px 14px',
  borderBottom: `1px solid ${C.border}`,
  color: C.muted, fontSize: 12, letterSpacing: '0.12em',
  fontFamily: "'Barlow Condensed', sans-serif",
}

const tableCell: React.CSSProperties = {
  padding: '10px 14px', borderBottom: `1px solid ${C.border}`,
  color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
}

// ── Videos tab ────────────────────────────────────────────────────────────────

const LANES  = ['top', 'jungle', 'mid', 'adc', 'support']
const TYPES  = ['scenario', 'blitz', 'trivia', 'gtr']

function VideosTab() {
  const [videos,  setVideos]  = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [form, setForm] = useState({ url: '', type: 'scenario', lane: 'top', title: '' })
  const [saving,  setSaving]  = useState(false)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ videos: Video[] }>('/videos')
      setVideos(data.videos)
    } catch {
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleAdd = useCallback(async () => {
    if (!form.url.trim()) return
    setSaving(true)
    try {
      await apiPost('/videos', { ...form })
      setForm({ url: '', type: 'scenario', lane: 'top', title: '' })
      await load()
    } catch {
      setError('Failed to add video')
    } finally {
      setSaving(false)
    }
  }, [form, load])

  const handleSaveEdit = useCallback(async (id: string) => {
    try {
      await apiPut(`/videos/${id}`, { url: editUrl })
      setEditId(null)
      await load()
    } catch {
      setError('Failed to update video')
    }
  }, [editUrl, load])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiDelete(`/videos/${id}`)
      await load()
    } catch {
      setError('Failed to delete video')
    }
  }, [load])

  return (
    <div>
      {/* Add video form */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px', marginBottom: 24 }}>
        <p style={{ color: C.tealText, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', margin: '0 0 16px' }}>
          ADD VIDEO
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>TYPE</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>LANE</label>
            <select value={form.lane} onChange={e => setForm(f => ({ ...f, lane: e.target.value }))} style={inputStyle}>
              {LANES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>TITLE (optional)</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Top Lane Scenario #1" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>VIDEO URL</label>
          <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="YouTube embed URL, Cloudinary .mp4, or direct image URL" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { void handleAdd() }} disabled={saving || !form.url.trim()} style={btnStyle(C.teal)}>
            {saving ? 'SAVING…' : 'ADD VIDEO'}
          </button>
          <span style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, alignSelf: 'center' }}>
            Supports: YouTube embed (https://www.youtube.com/embed/…), Cloudinary .mp4, or any image URL
          </span>
        </div>
      </div>

      {error && <p style={{ color: C.red, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {loading ? (
        <p style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14 }}>Loading…</p>
      ) : videos.length === 0 ? (
        <p style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14 }}>No videos yet.</p>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHead}>TITLE</th>
                <th style={tableHead}>TYPE</th>
                <th style={tableHead}>LANE</th>
                <th style={tableHead}>URL</th>
                <th style={tableHead}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td style={tableCell}>{v.title ?? '—'}</td>
                  <td style={tableCell}>{v.type}</td>
                  <td style={tableCell}>{v.lane}</td>
                  <td style={{ ...tableCell, maxWidth: 280 }}>
                    {editId === v.id ? (
                      <input
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        style={{ ...inputStyle, fontSize: 12 }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: C.muted, wordBreak: 'break-all' }}>{v.url}</span>
                    )}
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {editId === v.id ? (
                        <>
                          <button onClick={() => { void handleSaveEdit(v.id) }} style={btnStyle(C.teal)}>SAVE</button>
                          <button onClick={() => setEditId(null)} style={ghostBtn}>CANCEL</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(v.id); setEditUrl(v.url) }} style={ghostBtn}>EDIT</button>
                          <button onClick={() => { void handleDelete(v.id) }} style={{ ...btnStyle('#ef4444'), background: 'none', color: '#ef4444', border: '1px solid #ef4444' }}>DELETE</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Questions tab ──────────────────────────────────────────────────────────────

function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'scenario', lane: 'top', text: '', hint: '',
    optA: '', optB: '', optC: '', correctAnswer: 'A', explanation: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ questions: Question[] }>('/questions?type=scenario')
      setQuestions(data.questions)
    } catch {
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleAdd = useCallback(async () => {
    if (!form.text.trim() || !form.optA.trim() || !form.optB.trim() || !form.optC.trim()) return
    setSaving(true)
    try {
      await apiPost('/questions', {
        type: form.type, lane: form.lane,
        text: form.text, hint: form.hint || null,
        options: [
          { id: 'A', text: form.optA },
          { id: 'B', text: form.optB },
          { id: 'C', text: form.optC },
        ],
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
      })
      setForm({ type: 'scenario', lane: 'top', text: '', hint: '', optA: '', optB: '', optC: '', correctAnswer: 'A', explanation: '' })
      await load()
    } catch {
      setError('Failed to add question')
    } finally {
      setSaving(false)
    }
  }, [form, load])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiDelete(`/questions/${id}`)
      await load()
    } catch {
      setError('Failed to delete question')
    }
  }, [load])

  const F = (label: string, key: keyof typeof form, placeholder = '') => (
    <div>
      <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>{label}</label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inputStyle} />
    </div>
  )

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
        <p style={{ color: C.tealText, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', margin: '0 0 16px' }}>ADD QUESTION</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>TYPE</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>LANE</label>
            <select value={form.lane} onChange={e => setForm(f => ({ ...f, lane: e.target.value }))} style={inputStyle}>
              {LANES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {F('QUESTION TEXT', 'text', 'What is the best item for...')}
          {F('HINT (optional)', 'hint', 'Think about damage type...')}
          {F('OPTION A', 'optA')}
          {F('OPTION B', 'optB')}
          {F('OPTION C', 'optC')}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>CORRECT ANSWER</label>
            <select value={form.correctAnswer} onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))} style={inputStyle}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          {F('EXPLANATION', 'explanation', 'This is correct because...')}
        </div>
        <button onClick={() => { void handleAdd() }} disabled={saving} style={btnStyle()}>{saving ? 'SAVING…' : 'ADD QUESTION'}</button>
      </div>

      {error && <p style={{ color: C.red, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {loading ? <p style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif" }}>Loading…</p> : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHead}>TYPE</th>
                <th style={tableHead}>LANE</th>
                <th style={tableHead}>QUESTION</th>
                <th style={tableHead}>CORRECT</th>
                <th style={tableHead}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id}>
                  <td style={tableCell}>{q.type}</td>
                  <td style={tableCell}>{q.lane}</td>
                  <td style={{ ...tableCell, maxWidth: 320 }}>{q.text}</td>
                  <td style={tableCell}>{q.correctAnswer}</td>
                  <td style={tableCell}>
                    <button onClick={() => { void handleDelete(q.id) }} style={{ ...ghostBtn, color: C.red, borderColor: C.red }}>DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── GTR Rounds tab ─────────────────────────────────────────────────────────────

function GTRTab() {
  const [rounds,  setRounds]  = useState<GTRRound[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [form, setForm] = useState({ imageUrl: '', correctRank: 'gold' })
  const [saving, setSaving]   = useState(false)

  const RANKS = ['iron', 'bronze', 'silver', 'gold', 'emerald', 'platinum', 'diamond', 'master', 'challenger']

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ rounds: GTRRound[] }>('/gtr/rounds')
      setRounds(data.rounds)
    } catch {
      setError('Failed to load rounds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleAdd = useCallback(async () => {
    if (!form.imageUrl.trim()) return
    setSaving(true)
    try {
      await apiPost('/gtr/rounds', form)
      setForm({ imageUrl: '', correctRank: 'gold' })
      await load()
    } catch {
      setError('Failed to add round')
    } finally {
      setSaving(false)
    }
  }, [form, load])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiDelete(`/gtr/rounds/${id}`)
      await load()
    } catch {
      setError('Failed to delete round')
    }
  }, [load])

  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
        <p style={{ color: C.tealText, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', margin: '0 0 16px' }}>ADD GTR ROUND</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>VIDEO / IMAGE URL</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="YouTube embed or Cloudinary .mp4 URL" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>CORRECT RANK</label>
            <select value={form.correctRank} onChange={e => setForm(f => ({ ...f, correctRank: e.target.value }))} style={inputStyle}>
              {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => { void handleAdd() }} disabled={saving || !form.imageUrl.trim()} style={btnStyle()}>{saving ? 'SAVING…' : 'ADD ROUND'}</button>
      </div>

      {error && <p style={{ color: C.red, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {loading ? <p style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif" }}>Loading…</p> : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHead}>URL</th>
                <th style={tableHead}>CORRECT RANK</th>
                <th style={tableHead}>TOTAL VOTES</th>
                <th style={tableHead}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r.id}>
                  <td style={{ ...tableCell, maxWidth: 320, fontSize: 12, color: C.muted, wordBreak: 'break-all' }}>{r.imageUrl}</td>
                  <td style={tableCell}>{r.correctRank}</td>
                  <td style={tableCell}>{r.totalVotes ?? 0}</td>
                  <td style={tableCell}>
                    <button onClick={() => { void handleDelete(r.id) }} style={{ ...ghostBtn, color: C.red, borderColor: C.red }}>DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Users tab ──────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users,   setUsers]   = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ users: AppUser[] }>('/admin/users')
      setUsers(data.users)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const toggleRole = useCallback(async (id: string, currentRole: string) => {
    try {
      await apiPut(`/admin/users/${id}/role`, { role: currentRole === 'admin' ? 'user' : 'admin' })
      await load()
    } catch {
      setError('Failed to update role')
    }
  }, [load])

  return (
    <div>
      {error && <p style={{ color: C.red, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {loading ? <p style={{ color: C.muted, fontFamily: "'Barlow Condensed', sans-serif" }}>Loading…</p> : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHead}>USERNAME</th>
                <th style={tableHead}>EMAIL</th>
                <th style={tableHead}>ROLE</th>
                <th style={tableHead}>TIER</th>
                <th style={tableHead}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={tableCell}>{u.username}</td>
                  <td style={tableCell}>{u.email}</td>
                  <td style={tableCell}><span style={{ color: u.role === 'admin' ? C.teal : C.muted }}>{u.role}</span></td>
                  <td style={tableCell}>{u.membershipTier}</td>
                  <td style={tableCell}>
                    <button onClick={() => { void toggleRole(u.id, u.role) }} style={ghostBtn}>
                      {u.role === 'admin' ? 'REMOVE ADMIN' : 'MAKE ADMIN'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main AdminPanel ────────────────────────────────────────────────────────────

type Tab = 'videos' | 'questions' | 'gtr' | 'users'

const TABS: { key: Tab; label: string }[] = [
  { key: 'videos',    label: 'VIDEOS'     },
  { key: 'questions', label: 'QUESTIONS'  },
  { key: 'gtr',       label: 'GTR ROUNDS' },
  { key: 'users',     label: 'USERS'      },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('videos')

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{
          margin: 0, fontSize: 28, letterSpacing: '0.1em',
          fontFamily: "'Beaufort for LOL', 'Beaufort for LOL Bold', serif",
          fontWeight: 700,
          background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          ADMIN PANEL
        </h1>
        <button onClick={() => navigate('/')} style={ghostBtn}>← BACK TO SITE</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 24px', background: 'none', border: 'none',
              borderBottom: tab === t.key ? `2px solid ${C.teal}` : '2px solid transparent',
              color: tab === t.key ? C.teal : C.muted,
              cursor: 'pointer', marginBottom: -1,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 13, letterSpacing: '0.1em',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'videos'    && <VideosTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'gtr'       && <GTRTab />}
      {tab === 'users'     && <UsersTab />}
    </div>
  )
}
