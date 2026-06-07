import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './lib/api'
import LoginPage from './pages/LoginPage'
import AdminPanel from './pages/AdminPanel'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = getToken()
  const role = localStorage.getItem('gs_admin_role')
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
