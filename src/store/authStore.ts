import { create } from 'zustand'
import { getToken, setToken, clearToken } from '../lib/api'

const USER_KEY = 'gs_user'

export type MembershipTier = 'free' | 'premium'

export interface AuthUser {
  id: string
  username: string
  email: string
  avatarUrl: string
  level: number
  membershipTier: MembershipTier
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loginModalOpen: boolean
}

interface AuthActions {
  login: (token: string, user: AuthUser) => void
  logout: () => void
  loadFromStorage: () => void
  openLoginModal: () => void
  closeLoginModal: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loginModalOpen: false,

  login: (token, user) => {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user, isAuthenticated: true, loginModalOpen: false })
  },

  logout: () => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null, isAuthenticated: false })
  },

  loadFromStorage: () => {
    const token = getToken()
    const raw = localStorage.getItem(USER_KEY)
    if (!token || !raw) return
    try {
      const user = JSON.parse(raw) as AuthUser
      set({ token, user, isAuthenticated: true })
    } catch {
      clearToken()
      localStorage.removeItem(USER_KEY)
    }
  },

  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}))
