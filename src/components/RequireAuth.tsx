import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, openLoginModal } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) openLoginModal()
  }, [isAuthenticated, openLoginModal])

  if (!isAuthenticated) return null
  return <>{children}</>
}
