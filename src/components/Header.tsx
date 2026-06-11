import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Logo from '../assets/Layer _1.svg'
import NavIcon from '../assets/Vector _3.svg'
import { navSlideDown } from '../lib/animations'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../hooks/useIsMobile'

const FEATURE_NAV = [
  { label: 'SCENARIOS',      to: '/scenarios' },
  { label: 'KNOWLEDGE HUB', to: '/knowledge-hub' },
  { label: 'BLITZ',          to: '/blitz' },
  { label: 'TRIVIA',         to: '/trivia' },
  { label: 'GUESS RANK',     to: '/match' },
  { label: 'PROFILE',        to: '/profile' },
  { label: 'DUELS',          to: '/duels' },
]

// Full nav list shown in the mobile drawer (home + features + all feature pages)
const MOBILE_NAV = [
  { label: 'HOME',     to: '/' },
  { label: 'FEATURES', to: '/features' },
  ...FEATURE_NAV,
]

const DUELS_PATHS  = new Set(['/duels', '/trivia-invite', '/gtr-invite', '/match-winner', '/results'])
const BLITZ_PATHS  = new Set(['/blitz'])
const FEATURE_PATHS = new Set([...FEATURE_NAV.map(n => n.to), ...DUELS_PATHS, ...BLITZ_PATHS])

export default function Header() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, openLoginModal, logout } = useAuthStore()

  const isHome        = pathname === '/'
  const isFeatures    = pathname === '/features'
  const isChampion    = pathname.startsWith('/champion/')
  const isFeaturePage = FEATURE_PATHS.has(pathname) || isChampion

  const isActive = (to: string) =>
    to === '/duels' ? DUELS_PATHS.has(pathname)
    : to === '/blitz' ? BLITZ_PATHS.has(pathname)
    : to === '/knowledge-hub' ? (pathname === to || isChampion)
    : pathname === to

  // Hooks must run unconditionally (before the mobile early-return)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 120], reduced ? [1, 1] : [1, 0.85])
  const headerBlur    = useTransform(scrollY, [0, 120], reduced ? ['blur(0px)', 'blur(0px)'] : ['blur(0px)', 'blur(8px)'])

  // ── Mobile: hamburger + slide-in drawer ──────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header
          className="fixed top-0 left-0 w-full z-50 h-[85.2px] flex items-center"
          style={{ backgroundColor: 'rgba(0, 20, 51, 0.95)', borderBottom: '1px solid rgba(58,249,255,0.18)' }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ position: 'absolute', left: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}
          >
            <span style={{ display: 'block', width: 24, height: 2, background: '#E8EDF5', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#E8EDF5', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: '#E8EDF5', borderRadius: 2 }} />
          </button>

          <Link to="/" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', lineHeight: 0 }}>
            <img src={Logo} alt="GamerSense" style={{ width: 150, height: 'auto', objectFit: 'contain' }} />
          </Link>

          <div style={{ position: 'absolute', right: 14, display: 'flex', alignItems: 'center' }}>
            {isAuthenticated && user ? (
              <button onClick={logout} className="font-beaufort font-bold" style={{ background: 'none', border: '1px solid #1E3A5F', color: '#8FA3C0', cursor: 'pointer', padding: '5px 9px', fontSize: 10, letterSpacing: '0.08em', borderRadius: 3 }}>
                LOGOUT
              </button>
            ) : (
              <button onClick={openLoginModal} className="font-beaufort font-bold" style={{ background: 'linear-gradient(to right, #3AF9FF, #00A7AD)', border: 'none', color: '#0F1E2D', cursor: 'pointer', padding: '6px 14px', fontSize: 11, letterSpacing: '0.08em', borderRadius: 3 }}>
                LOGIN
              </button>
            )}
          </div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
              />
              <motion.nav
                key="drawer"
                initial={reduced ? { opacity: 0 } : { x: '-100%' }}
                animate={reduced ? { opacity: 1 } : { x: 0 }}
                exit={reduced ? { opacity: 0 } : { x: '-100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70,
                  width: '80%', maxWidth: 320, background: '#0A1628',
                  borderRight: '1px solid #1E3A5F', padding: '24px 0',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 18px' }}>
                  <img src={Logo} alt="GamerSense" style={{ width: 150, height: 'auto' }} />
                  <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', color: '#8FA3C0', fontSize: 26, lineHeight: 1, cursor: 'pointer', padding: 4 }}>×</button>
                </div>
                <div style={{ height: 1, background: '#1E3A5F', margin: '0 0 8px' }} />
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {MOBILE_NAV.map(({ label, to }) => {
                    const active = isActive(to)
                    return (
                      <Link
                        key={label}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="font-beaufort font-medium"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '14px 24px', textDecoration: 'none',
                          fontSize: 16, color: active ? '#01F7FF' : '#E8EDF5',
                          borderLeft: active ? '3px solid #01F7FF' : '3px solid transparent',
                          background: active ? 'rgba(1,247,255,0.06)' : 'transparent',
                        }}
                      >
                        {active && <img src={NavIcon} alt="" style={{ width: 9, height: 12, transform: 'rotate(180deg)' }} />}
                        {label}
                      </Link>
                    )
                  })}
                </div>
                {isAuthenticated && user && (
                  <div style={{ padding: '14px 24px', borderTop: '1px solid #1E3A5F', color: '#8FA3C0', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>
                    Signed in as <span style={{ color: '#E8EDF5' }}>{user.username}</span>
                  </div>
                )}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <motion.header
      className="fixed top-0 left-0 w-full z-50 h-[85.2px] overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 20, 51, 0.9)', opacity: headerOpacity, backdropFilter: headerBlur }}
      variants={navSlideDown}
      initial={reduced ? false : 'hidden'}
      animate="show"
    >
      <motion.div
        className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3AF9FF]/40 to-transparent z-10"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      />

      <div className="relative z-10 flex items-center w-full h-full">

        <Link to="/" style={{ marginLeft: '79px', flexShrink: 0, lineHeight: 0 }}>
          <motion.img
            src={Logo}
            alt="GamerSense"
            className="w-[170px] h-[30.74px] object-contain"
            style={{ cursor: 'pointer' }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-[28px]">
          {isFeaturePage ? (
            FEATURE_NAV.map(({ label, to }, i) => {
              const active = label === 'DUELS'          ? DUELS_PATHS.has(pathname)
                           : label === 'BLITZ'          ? BLITZ_PATHS.has(pathname)
                           : label === 'KNOWLEDGE HUB'  ? (pathname === to || isChampion)
                           : pathname === to
              return (
                <Link key={label} to={to} className="flex items-center gap-[4px] no-underline cursor-pointer">
                  {active && (
                    <img src={NavIcon} alt="" className="w-[10px] h-[13px] rotate-180 flex-shrink-0" />
                  )}
                  <motion.span
                    className="font-beaufort font-medium leading-none transition-colors duration-200"
                    style={{
                      fontSize: '15px',
                      color: active ? '#01F7FF' : '#FFFCF6',
                    }}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                  >
                    {label}
                  </motion.span>
                </Link>
              )
            })
          ) : (
            <>
              <Link to="/" className="flex items-center gap-[4px] no-underline cursor-pointer">
                {isHome && (
                  <img src={NavIcon} alt="" className="w-[10.44px] h-[13.92px] rotate-180 flex-shrink-0" />
                )}
                <motion.span
                  className="font-beaufort text-[17px] font-medium leading-none transition-colors duration-200"
                  style={{ color: isHome ? '#01F7FF' : '#FFFCF6' }}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  HOME
                </motion.span>
              </Link>

              <Link to="/features" className="flex items-center gap-[4px] no-underline cursor-pointer">
                {isFeatures && (
                  <img src={NavIcon} alt="" className="w-[10.44px] h-[13.92px] rotate-180 flex-shrink-0" />
                )}
                <motion.span
                  className="font-beaufort text-[17px] font-medium leading-none transition-colors duration-200"
                  style={{ color: isFeatures ? '#01F7FF' : '#FFFCF6' }}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  FEATURES
                </motion.span>
              </Link>
            </>
          )}
        </nav>

        {/* Authenticated: show username + logout on all pages */}
        {isAuthenticated && user && (
          <motion.div
            className="absolute right-[89px] top-1/2 -translate-y-1/2 flex items-center gap-[12px]"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-beaufort font-medium text-[13px] text-[#E8EDF5] leading-none">
              {user.username}
            </span>
            <motion.button
              onClick={logout}
              className="font-beaufort font-bold text-[11px] leading-none"
              style={{
                background: 'none',
                border: '1px solid #1E3A5F',
                color: '#8FA3C0',
                cursor: 'pointer',
                padding: '5px 10px',
                letterSpacing: '0.1em',
                borderRadius: 3,
              }}
              animate={{ filter: 'brightness(1) drop-shadow(0 0 0px transparent)' }}
              transition={{ filter: { duration: 0.15 } }}
              whileHover={reduced ? {} : {
                color: '#E8EDF5',
                borderColor: '#00C9A7',
                filter: 'brightness(1.1) drop-shadow(0 0 6px #00C9A740)',
              }}
            >
              LOGOUT
            </motion.button>
          </motion.div>
        )}

        {/* Not authenticated: LOGIN button on home page only */}
        {!isAuthenticated && isHome && (
          <motion.div
            onClick={openLoginModal}
            className="absolute right-[89px] top-1/2 -translate-y-1/2 w-[103px] h-[34px] p-[2px] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            whileTap={reduced ? {} : { scale: 0.97 }}
          >
            <div className="w-full h-full bg-[#0F1E2D]/95 flex items-center justify-center">
              <span className="font-beaufort text-[12px] font-bold text-[#FFFCF6] tracking-wider leading-none">
                LOGIN
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </motion.header>
  )
}
