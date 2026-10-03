import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { useAuthStore } from './store/authStore'
import { DEMO_MODE } from './lib/env'
import { DEMO_TOKEN, GUEST_USER } from './lib/demo/mockApi'

useAuthStore.getState().loadFromStorage()

// Demo build: there is no account system, so visitors start signed in as a guest.
if (DEMO_MODE && !useAuthStore.getState().isAuthenticated) {
  useAuthStore.getState().login(DEMO_TOKEN, GUEST_USER)
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
