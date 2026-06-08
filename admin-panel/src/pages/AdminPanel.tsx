import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiPut, ApiError, getToken, clearToken } from '../lib/api'

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminQuestion {
  id: string
  type: string
  lane: string
  text: string
  hint: string | null
  imageUrl: string | null
  options: { id: string; text: string }[]
  correctAnswer: string
  explanation: string
}

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  level: number
  membershipTier: string
  createdAt: string
  stats: { points: number; quizCompleted: number; triviaPlayed: number; gtrCompleted: number } | null
}

interface AdminGTRRound {
  id: string
  imageUrl: string
  correctRank: string
  createdAt: string
}

// ── Styles ─────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#060F1E',
    color: '#E8EDF5',
    fontFamily: "'Barlow Condensed', sans-serif",
    padding: '0 0 60px',
  } as React.CSSProperties,
  header: {
    background: '#0D1F3C',
    borderBottom: '1px solid #1E3A5F',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#00C9A7',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '20px 32px 0',
    borderBottom: '1px solid #1E3A5F',
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    background: active ? '#00C9A7' : 'transparent',
    color: active ? '#060F1E' : '#8FA3C0',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: '0.1em',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.2s',
  }),
  content: {
    padding: '32px',
    maxWidth: 1100,
  } as React.CSSProperties,
  card: {
    background: '#0D1F3C',
    border: '1px solid #1E3A5F',
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
  } as React.CSSProperties,
  btn: (variant: 'primary' | 'danger' | 'ghost'): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    background: variant === 'primary' ? '#00C9A7' : variant === 'danger' ? '#c0392b' : '#1E3A5F',
    color: variant === 'primary' ? '#060F1E' : '#E8EDF5',
    transition: 'opacity 0.15s',
  }),
  label: {
    fontSize: 12,
    color: '#8FA3C0',
    letterSpacing: '0.08em',
    marginBottom: 4,
    display: 'block',
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: '#112040',
    border: '1px solid #1E3A5F',
    borderRadius: 5,
    color: '#E8EDF5',
    padding: '8px 12px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: 'border-box',
  } as React.CSSProperties,
  select: {
    background: '#112040',
    border: '1px solid #1E3A5F',
    borderRadius: 5,
    color: '#E8EDF5',
    padding: '8px 12px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 14,
    marginBottom: 12,
  } as React.CSSProperties,
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  badge: (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    background: color,
    color: '#060F1E',
  }),
  error: {
    color: '#e74c3c',
    fontSize: 13,
    marginBottom: 12,
  } as React.CSSProperties,
  success: {
    color: '#00C9A7',
    fontSize: 13,
    marginBottom: 12,
  } as React.CSSProperties,
}

// ── Questions Tab ──────────────────────────────────────────────────────────

const EMPTY_QUESTION = {
  type: 'trivia',
  lane: 'top',
  text: '',
  hint: '',
  imageUrl: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ],
  correctAnswer: 'A',
  explanation: '',
}

function QuestionsTab() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_QUESTION)
  const [editId, setEditId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ questions: AdminQuestion[] }>('/admin/questions')
      setQuestions(data.questions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function startEdit(q: AdminQuestion) {
    setForm({
      type: q.type,
      lane: q.lane,
      text: q.text,
      hint: q.hint ?? '',
      imageUrl: q.imageUrl ?? '',
      options: q.options as typeof EMPTY_QUESTION.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })
    setEditId(q.id)
    setShowForm(true)
    setMsg(null)
  }

  function resetForm() {
    setForm(EMPTY_QUESTION)
    setEditId(null)
    setShowForm(false)
    setMsg(null)
  }

  async function handleSubmit() {
    try {
      const body = { ...form, hint: form.hint || null, imageUrl: form.imageUrl || null }
      if (editId) {
        await apiPut(`/admin/questions/${editId}`, body)
        setMsg({ type: 'ok', text: 'Question updated.' })
      } else {
        await apiPost('/admin/questions', body)
        setMsg({ type: 'ok', text: 'Question created.' })
      }
      resetForm()
      await load()
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof ApiError ? e.message : 'Error saving question' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken() ?? ''}` },
      })
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  function setOption(idx: number, text: string) {
    setForm(f => ({
      ...f,
      options: f.options.map((o, i) => i === idx ? { ...o, text } : o),
    }))
  }

  return (
    <div>
      <div style={S.row}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, flex: 1 }}>
          Questions ({questions.length})
        </h2>
        <button style={S.btn('primary')} onClick={() => { resetForm(); setShowForm(true) }}>
          + Add Question
        </button>
      </div>

      {showForm && (
        <div style={{ ...S.card, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#00C9A7' }}>{editId ? 'Edit Question' : 'New Question'}</h3>
          {msg && <div style={msg.type === 'ok' ? S.success : S.error}>{msg.text}</div>}

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>TYPE</label>
              <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="trivia">trivia</option>
                <option value="scenario">scenario</option>
                <option value="blitz">blitz</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>LANE</label>
              <select style={S.select} value={form.lane} onChange={e => setForm(f => ({ ...f, lane: e.target.value }))}>
                <option value="top">top</option>
                <option value="jungle">jungle</option>
                <option value="mid">mid</option>
                <option value="adc">adc</option>
                <option value="support">support</option>
              </select>
            </div>
          </div>

          <label style={S.label}>QUESTION TEXT</label>
          <textarea
            style={{ ...S.input, minHeight: 60, resize: 'vertical' }}
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          />

          <label style={S.label}>HINT (optional)</label>
          <input style={S.input} value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} />

          {(form.type === 'blitz' || form.type === 'trivia') && (
            <>
              <label style={S.label}>IMAGE URL (optional)</label>
              <input
                style={S.input}
                placeholder="https://res.cloudinary.com/... or https://..."
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
            </>
          )}
          {form.type === 'scenario' && (
            <>
              <label style={S.label}>VIDEO URL (optional)</label>
              <input
                style={S.input}
                placeholder="https://res.cloudinary.com/....mp4"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
            </>
          )}

          {form.options.map((o, i) => (
            <div key={o.id}>
              <label style={S.label}>OPTION {o.id}</label>
              <input style={S.input} value={o.text} onChange={e => setOption(i, e.target.value)} />
            </div>
          ))}

          <label style={S.label}>CORRECT ANSWER</label>
          <select style={S.select} value={form.correctAnswer} onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}>
            {form.options.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
          </select>

          <label style={S.label}>EXPLANATION</label>
          <textarea
            style={{ ...S.input, minHeight: 60, resize: 'vertical' }}
            value={form.explanation}
            onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
          />

          <div style={S.row}>
            <button style={S.btn('primary')} onClick={() => { void handleSubmit() }}>
              {editId ? 'Save Changes' : 'Create Question'}
            </button>
            <button style={S.btn('ghost')} onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#8FA3C0' }}>Loading...</div>
      ) : (
        questions.map(q => (
          <div key={q.id} style={S.card}>
            <div style={{ ...S.row, marginBottom: 8 }}>
              <span style={S.badge('#00C9A7')}>{q.type}</span>
              <span style={S.badge('#C9A227')}>{q.lane}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{q.text.slice(0, 100)}{q.text.length > 100 ? '…' : ''}</span>
              <button style={S.btn('ghost')} onClick={() => startEdit(q)}>Edit</button>
              <button style={S.btn('danger')} onClick={() => { void handleDelete(q.id) }}>Delete</button>
            </div>
            <div style={{ fontSize: 12, color: '#8FA3C0' }}>
              Correct: <strong style={{ color: '#00C9A7' }}>{q.correctAnswer}</strong>
              {' · '}
              {q.options.map(o => `${o.id}: ${o.text.slice(0, 30)}`).join(' | ')}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ── GTR Rounds Tab ─────────────────────────────────────────────────────────

const RANKS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger']

function GTRTab() {
  const [rounds, setRounds] = useState<AdminGTRRound[]>([])
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [correctRank, setCorrectRank] = useState('gold')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ rounds: AdminGTRRound[] }>('/admin/gtr/rounds')
      setRounds(data.rounds)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function handleAdd() {
    if (!imageUrl.trim()) { setMsg({ type: 'err', text: 'Video URL is required' }); return }
    try {
      await apiPost('/admin/gtr/rounds', { imageUrl, correctRank })
      setImageUrl('')
      setCorrectRank('gold')
      setMsg({ type: 'ok', text: 'GTR round added.' })
      await load()
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof ApiError ? e.message : 'Error adding round' })
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>GTR Rounds ({rounds.length})</h2>

      <div style={{ ...S.card, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, color: '#00C9A7' }}>Add New Round</h3>
        {msg && <div style={msg.type === 'ok' ? S.success : S.error}>{msg.text}</div>}
        <label style={S.label}>VIDEO URL</label>
        <input
          style={S.input}
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        <div style={{ fontSize: 11, color: '#8FA3C0', marginTop: -8, marginBottom: 12, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID
        </div>
        <label style={S.label}>CORRECT RANK</label>
        <select style={S.select} value={correctRank} onChange={e => setCorrectRank(e.target.value)}>
          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button style={S.btn('primary')} onClick={() => { void handleAdd() }}>Add Round</button>
      </div>

      {loading ? (
        <div style={{ color: '#8FA3C0' }}>Loading...</div>
      ) : (
        rounds.map((r, i) => (
          <div key={r.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'center' }}>
            {r.imageUrl.startsWith('https://www.youtube.com/embed/') ? (
              <iframe
                src={r.imageUrl}
                title={`GTR Round ${i + 1}`}
                style={{ width: 120, height: 68, borderRadius: 4, border: '1px solid #1E3A5F', flexShrink: 0 }}
                allowFullScreen
              />
            ) : (
              <img
                src={r.imageUrl}
                alt={`GTR Round ${i + 1}`}
                style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4, border: '1px solid #1E3A5F', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Round #{rounds.length - i}</div>
              <div style={{ fontSize: 12, color: '#8FA3C0', wordBreak: 'break-all' }}>{r.imageUrl}</div>
            </div>
            <span style={S.badge('#C9A227')}>{r.correctRank}</span>
          </div>
        ))
      )}
    </div>
  )
}

// ── Users Tab ──────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ users: AdminUser[] }>('/admin/users')
      setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function toggleRole(user: AdminUser) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change ${user.username}'s role to ${newRole}?`)) return
    try {
      await apiPut(`/admin/users/${user.id}/role`, { role: newRole })
      setMsg(`${user.username} is now ${newRole}`)
      await load()
    } catch {
      setMsg('Failed to update role')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Users ({users.length})</h2>
      {msg && <div style={S.success}>{msg}</div>}
      {loading ? (
        <div style={{ color: '#8FA3C0' }}>Loading...</div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px',
            gap: 8,
            padding: '8px 12px',
            fontSize: 11,
            color: '#8FA3C0',
            letterSpacing: '0.1em',
            borderBottom: '1px solid #1E3A5F',
            marginBottom: 4,
          }}>
            <span>USERNAME</span>
            <span>EMAIL</span>
            <span>ROLE</span>
            <span>TIER</span>
            <span>POINTS</span>
            <span>JOINED</span>
            <span></span>
          </div>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px',
              gap: 8,
              padding: '10px 12px',
              background: '#0D1F3C',
              borderRadius: 6,
              marginBottom: 6,
              alignItems: 'center',
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 600 }}>{u.username}</span>
              <span style={{ color: '#8FA3C0', fontSize: 12 }}>{u.email}</span>
              <span>
                <span style={S.badge(u.role === 'admin' ? '#C9A227' : '#1E3A5F')}>
                  {u.role}
                </span>
              </span>
              <span style={{ color: '#8FA3C0' }}>{u.membershipTier}</span>
              <span style={{ color: '#00C9A7' }}>{u.stats?.points ?? 0}</span>
              <span style={{ color: '#8FA3C0', fontSize: 11 }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
              <button style={S.btn('ghost')} onClick={() => { void toggleRole(u) }}>
                {u.role === 'admin' ? 'Demote' : 'Promote'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main AdminPanel ────────────────────────────────────────────────────────

type Tab = 'questions' | 'gtr' | 'users'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('questions')

  function handleLogout() {
    clearToken()
    localStorage.removeItem('gs_admin_role')
    navigate('/login')
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <span style={S.title}>GAMERSENSE ADMIN</span>
        <button style={S.btn('ghost')} onClick={handleLogout}>Logout</button>
      </div>

      <div style={S.tabs}>
        {(['questions', 'gtr', 'users'] as Tab[]).map(t => (
          <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'gtr' ? 'GTR ROUNDS' : t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'gtr' && <GTRTab />}
        {tab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}
