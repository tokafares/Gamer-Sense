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
              <Route path="/page1"  element={<PageWrapper><Page1 /></PageWrapper>} />
              <Route path="/page2"  element={<PageWrapper><Page2 /></PageWrapper>} />
              <Route path="/page3"  element={<PageWrapper><Page3 /></PageWrapper>} />
              <Route path="/page4"  element={<PageWrapper><Page4 /></PageWrapper>} />
              <Route path="/page5"  element={<PageWrapper><Page5 /></PageWrapper>} />
              <Route path="/page6"  element={<PageWrapper><Page6 /></PageWrapper>} />
              <Route path="/page7"  element={<PageWrapper><Page7 /></PageWrapper>} />
              <Route path="/page8"  element={<PageWrapper><Page8 /></PageWrapper>} />
              <Route path="/page9"  element={<PageWrapper><Page9 /></PageWrapper>} />
              <Route path="/page10" element={<PageWrapper><Page10 /></PageWrapper>} />
              <Route path="/page11" element={<PageWrapper><Page11 /></PageWrapper>} />
              <Route path="/page12" element={<PageWrapper><Page12 /></PageWrapper>} />
              <Route path="/"       element={<PageWrapper><Page6 /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout
