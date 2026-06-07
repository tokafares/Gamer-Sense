import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import patternBg from './assets/Group 249.png'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import WhatWeOffer from './components/WhatWeOffer'
import Leaderboard from './components/Leaderboard'
import OurPartners from './components/OurPartners'
import OurTeam from './components/OurTeam'
import Footer from './components/Footer'
import SeparatorLine from './assets/Rectangle 6.svg'
import Page1 from './pages/Page1'
import Page2 from './pages/Page2'
import Page3 from './pages/Page3'
import Page4 from './pages/Page4'
import Page5 from './pages/Page5'
import Page6 from './pages/Page6'
import Page7 from './pages/Page7'
import Page8 from './pages/Page8'
import Page9 from './pages/Page9'
import Page10 from './pages/Page10'
import Page11 from './pages/Page11'
import Page12 from './pages/Page12'
import ChampionDetail from './pages/ChampionDetail'
import LoginModal from './components/LoginModal'
import { Link } from 'react-router-dom'

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
      <WhatWeOffer />
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
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/page1"  element={<Page1 />} />
      <Route path="/page2"  element={<Page2 />} />
      <Route path="/page3"  element={<RequireAuth><Page3 /></RequireAuth>} />
      <Route path="/page4"  element={<RequireAuth><Page4 /></RequireAuth>} />
      <Route path="/page5"  element={<Page5 />} />
      <Route path="/page6"  element={<RequireAuth><Page6 /></RequireAuth>} />
      <Route path="/page7"  element={<RequireAuth><Page7 /></RequireAuth>} />
      <Route path="/page8"  element={<RequireAuth><Page8 /></RequireAuth>} />
      <Route path="/page9"  element={<RequireAuth><Page9 /></RequireAuth>} />
      <Route path="/page10" element={<RequireAuth><Page10 /></RequireAuth>} />
      <Route path="/page11" element={<RequireAuth><Page11 /></RequireAuth>} />
      <Route path="/page12" element={<RequireAuth><Page12 /></RequireAuth>} />
      <Route path="/champion/:id" element={<ChampionDetail />} />
      <Route path="/match/join/:token" element={<RequireAuth><Page12 /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
      </Routes>
      <LoginModal />
    </>
  )
}

export default App
