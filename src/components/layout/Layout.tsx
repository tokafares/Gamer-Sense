import { useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from '../Header'
import { Footer } from './Footer'
import { BgPattern } from './BgPattern'
import { PageWrapper } from './PageWrapper'

import Page1 from '../../pages/Page1'
import Page2 from '../../pages/Page2'
import Page3 from '../../pages/Page3'
import Page4 from '../../pages/Page4'
import Page5 from '../../pages/Page5'
import Page6 from '../../pages/Page6'
import Page7 from '../../pages/Page7'
import Page8 from '../../pages/Page8'
import Page9 from '../../pages/Page9'
import Page10 from '../../pages/Page10'
import Page11 from '../../pages/Page11'
import Page12 from '../../pages/Page12'
import GtrInvite from '../../pages/GtrInvite'

export const Layout = () => {
  const location = useLocation()

  return (
    <>
      <BgPattern />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/leaderboard"   element={<PageWrapper><Page1 /></PageWrapper>} />
              <Route path="/features"      element={<PageWrapper><Page2 /></PageWrapper>} />
              <Route path="/scenarios"     element={<PageWrapper><Page3 /></PageWrapper>} />
              <Route path="/blitz"         element={<PageWrapper><Page4 /></PageWrapper>} />
              <Route path="/knowledge-hub" element={<PageWrapper><Page5 /></PageWrapper>} />
              <Route path="/duels"         element={<PageWrapper><Page6 /></PageWrapper>} />
              <Route path="/trivia-invite" element={<PageWrapper><Page7 /></PageWrapper>} />
              <Route path="/trivia"        element={<PageWrapper><Page8 /></PageWrapper>} />
              <Route path="/match-winner"  element={<PageWrapper><Page9 /></PageWrapper>} />
              <Route path="/profile"       element={<PageWrapper><Page10 /></PageWrapper>} />
              <Route path="/match"         element={<PageWrapper><Page11 /></PageWrapper>} />
              <Route path="/results"       element={<PageWrapper><Page12 /></PageWrapper>} />
              <Route path="/gtr-invite"    element={<PageWrapper><GtrInvite /></PageWrapper>} />
              <Route path="/"           element={<PageWrapper><Page6 /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout
