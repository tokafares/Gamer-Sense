import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import RequireAuth from './components/RequireAuth'
import { prefetchPageImages } from './lib/prefetch'
import patternBg from './assets/Group 249.webp'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import WhatWeOffer from './components/WhatWeOffer'
import Leaderboard from './components/Leaderboard'
import OurPartners from './components/OurPartners'
import OurTeam from './components/OurTeam'
import Footer from './components/Footer'
import SeparatorLine from './assets/Rectangle 6.svg'
import LoginModal from './components/LoginModal'
import LevelUpToast from './components/LevelUpToast'
import { Link } from 'react-router-dom'

const Page1        = lazy(() => import('./pages/Page1'))
const Page2        = lazy(() => import('./pages/Page2'))
const Page3        = lazy(() => import('./pages/Page3'))
const Page4        = lazy(() => import('./pages/Page4'))
const Page5        = lazy(() => import('./pages/Page5'))
const Page6        = lazy(() => import('./pages/Page6'))
const Page7        = lazy(() => import('./pages/Page7'))
const Page8        = lazy(() => import('./pages/Page8'))
const Page9        = lazy(() => import('./pages/Page9'))
const Page10       = lazy(() => import('./pages/Page10'))
const Page11       = lazy(() => import('./pages/Page11'))
const Page12       = lazy(() => import('./pages/Page12'))
const GtrInvite    = lazy(() => import('./pages/GtrInvite'))
const AdminPanel   = lazy(() => import('./pages/AdminPanel'))
const MatchJoin    = lazy(() => import('./pages/MatchJoin'))
const ChampionDetail = lazy(() => import('./pages/ChampionDetail'))

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: '#060F1E' }}>
      <div style={{ color: '#E8EDF5', fontSize: 80, fontFamily: "'Beaufort for LOL', serif", fontWeight: 700, lineHeight: 1 }}>
        404
      </div>
      <div style={{ color: '#8FA3C0', fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}>
        PAGE NOT FOUND
      </div>
      <Link to="/" style={{ color: '#00C9A7', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.2em', textDecoration: 'none', border: '1px solid #00C9A7', padding: '10px 28px', borderRadius: 6 }}>
        ← HOME
      </Link>
    </div>
  )
}

function Landing() {
  return (
    <>
      <Header />
      <div className="w-full h-[1.2px] bg-gradient-to-r from-[#FFFCF6] to-[#969696]" />
      <HeroSection />
      <div style={{ marginTop: '-120px', paddingTop: '120px' }}>
        <WhatWeOffer />
      </div>
      <Leaderboard />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <OurPartners />
      </div>
      <div style={{ position: 'relative', zIndex: 20 }}>
        <OurTeam />
      </div>
      <img
        src={SeparatorLine}
        alt=""
        className="w-full h-[5px] object-cover pointer-events-none block relative z-[25]"
        style={{ display: 'block', lineHeight: 0, marginTop: 0 }}
      />
      <Footer />
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => { prefetchPageImages() }, [])

  // On a fresh tab/window session, always start at the landing page instead of
  // restoring whatever deep route the browser reopened. sessionStorage is empty
  // on a new tab but survives same-tab reloads, so refresh keeps you in place.
  // Shareable links (match invites, champion pages) are excluded.
  useEffect(() => {
    if (sessionStorage.getItem('gs_session')) return
    sessionStorage.setItem('gs_session', '1')
    const path = location.pathname
    const shareable =
      path === '/' ||
      path.startsWith('/match/join') ||
      path.startsWith('/champion')
    if (!shareable) navigate('/', { replace: true })
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundImage: `url(${patternBg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          pointerEvents: 'none',
        }}
      />
      <Suspense fallback={null}>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/leaderboard"   element={<Page1 />} />
      <Route path="/features"      element={<Page2 />} />
      <Route path="/scenarios"     element={<RequireAuth><Page3 /></RequireAuth>} />
      <Route path="/blitz"         element={<RequireAuth><Page4 /></RequireAuth>} />
      <Route path="/knowledge-hub" element={<Page5 />} />
      <Route path="/duels"         element={<RequireAuth><Page6 /></RequireAuth>} />
      <Route path="/trivia-invite" element={<RequireAuth><Page7 /></RequireAuth>} />
      <Route path="/trivia"        element={<RequireAuth><Page8 /></RequireAuth>} />
      <Route path="/match-winner"  element={<RequireAuth><Page9 /></RequireAuth>} />
      <Route path="/profile"       element={<RequireAuth><Page10 /></RequireAuth>} />
      <Route path="/match"         element={<RequireAuth><Page11 /></RequireAuth>} />
      <Route path="/results"       element={<RequireAuth><Page12 /></RequireAuth>} />
      <Route path="/champion/:id" element={<ChampionDetail />} />
      <Route path="/gtr-invite" element={<RequireAuth><GtrInvite /></RequireAuth>} />
      <Route path="/admin"     element={<AdminPanel />} />
      <Route path="/match/join/:token" element={<RequireAuth><MatchJoin /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <LoginModal />
      <LevelUpToast />
    </>
  )
}

export default App
