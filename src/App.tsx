import { Routes, Route } from 'react-router-dom'
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
      <Route path="/page3"  element={<Page3 />} />
      <Route path="/page4"  element={<Page4 />} />
      <Route path="/page5"  element={<Page5 />} />
      <Route path="/page6"  element={<Page6 />} />
      <Route path="/page7"  element={<Page7 />} />
      <Route path="/page8"  element={<Page8 />} />
      <Route path="/page9"  element={<Page9 />} />
      <Route path="/page10" element={<Page10 />} />
      <Route path="/page11" element={<Page11 />} />
      <Route path="/page12" element={<Page12 />} />
      </Routes>
    </>
  )
}

export default App
