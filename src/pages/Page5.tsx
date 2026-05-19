import { motion, useReducedMotion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SeparatorLine from '../assets/Rectangle 6.svg'
import Group309   from '../assets/Group 309.png'
import ChampionBg from '../assets/ChampionBg.svg'

import BtnTopLane from '../assets/knowledgehub-btn-toplane.svg'
import BtnJungle  from '../assets/knowledgehub-btn-jungle.svg'
import BtnMidLane from '../assets/knowledgehub-btn-midlane.svg'
import BtnADC     from '../assets/knowledgehub-btn-adc.svg'
import BtnSupport from '../assets/knowledgehub-btn-support.svg'

import C275 from '../assets/Group 275.png'
import C276 from '../assets/Group 276.png'
import C277 from '../assets/Group 277.png'
import C278 from '../assets/Group 278.png'
import C279 from '../assets/Group 279.png'
import C280 from '../assets/Group 280.png'
import C281 from '../assets/Group 281.png'
import C282 from '../assets/Group 282.png'
import C283 from '../assets/Group 283.png'
import C284 from '../assets/Group 284.png'
import C285 from '../assets/Group 285.png'
import C286 from '../assets/Group 286.png'
import C287 from '../assets/Group 287.png'
import C288 from '../assets/Group 288.png'
import C289 from '../assets/Group 289.png'
import C290 from '../assets/Group 290.png'
import C291 from '../assets/Group 291.png'
import C292 from '../assets/Group 292.png'

const LANE_BTNS = [
  { src: BtnTopLane, alt: 'Top Lane' },
  { src: BtnJungle,  alt: 'Jungle'   },
  { src: BtnMidLane, alt: 'Mid Lane' },
  { src: BtnADC,     alt: 'ADC'      },
  { src: BtnSupport, alt: 'Support'  },
]

const CHAMPIONS = [
  C275, C276, C277, C278, C279, C280,
  C281, C282, C283, C284, C285, C286,
  C287, C288, C289, C290, C291, C292,
]

// Group 309.png = esports players illus.
const PANEL_W  = 780   // wider panel for spacious cards
const GRID_GAP = 16    // was 12
const GRID_PAD = 22    // was 18
const TOP_PAD  = 48    // was 20
const TITLE_MB = 24    // was 20
const TABS_MB  = 20    // was 12
const BOT_PAD  = 80    // was 48

export default function Page5() {
  const reduced = useReducedMotion()

  const tabs_h    = Math.round(113 * 670 / 1088)   // ~69 px — fixed scale
  const grid_h    = Math.round(557 * PANEL_W / 1087) // ~400 px
  const SECTION_H = TOP_PAD + 60 + TITLE_MB + tabs_h + TABS_MB + grid_h + BOT_PAD

  return (
    <>
      <Header />

      <main style={{ paddingTop: '85.2px', background: 'transparent', position: 'relative' }}>
        {/* position:relative wrapper so illustration can be anchored right:0 top:0 */}
        <div style={{ position: 'relative', overflow: 'visible' }}>

          {/* Illustration — absolute, right:0 top:0, bleeds to right edge */}
          <motion.img
            src={Group309}
            alt=""
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: `${SECTION_H}px`,
              width: '38%',
              objectFit: 'contain',
              objectPosition: 'right top',
              pointerEvents: 'none',
              zIndex: 1,
              display: 'block',
            }}
            initial={reduced ? false : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            whileHover={reduced ? {} : { scale: 1.03, transition: { duration: 0.3 } }}
          />

          {/* Left content — max-width 68%, sits above illustration */}
          <div
            style={{
              maxWidth: '68%',
              paddingLeft: '79px',
              paddingTop: `${TOP_PAD}px`,
              paddingBottom: `${BOT_PAD}px`,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Title */}
            <motion.h1
              className="font-beaufort font-bold"
              style={{
                fontSize: '54px',
                lineHeight: 1,
                marginTop: 0,
                marginBottom: `${TITLE_MB}px`,
                background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={reduced ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              Knowledge Hub
            </motion.h1>

            {/* Lane buttons — one per SVG file, individual hover glow */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: `${TABS_MB}px`,
                width: `${PANEL_W}px`,
              }}
            >
              {LANE_BTNS.map(({ src, alt }, i) => (
                <motion.button
                  key={alt}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'block',
                    lineHeight: 0,
                  }}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, filter: 'brightness(1) drop-shadow(0 0 0px #00D4D8)' }}
                  transition={{
                    default: { duration: 0.35, delay: 0.12 + i * 0.05 },
                    filter: { duration: 0.15 },
                  }}
                  whileHover={reduced ? {} : {
                    filter: 'brightness(1.3) drop-shadow(0 0 6px #00D4D8)',
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    style={{ display: 'block', height: `${tabs_h}px`, width: 'auto' }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Champion grid — plain CSS div, dark navy bg, #B4B4B4 border, 6×3 grid */}
            <motion.div
              style={{
                backgroundImage: `url(${ChampionBg})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: `${GRID_GAP}px`,
                padding: `${GRID_PAD}px`,
                width: `${PANEL_W}px`,
                height: `${grid_h}px`,
                boxSizing: 'border-box',
              }}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
            >
              {CHAMPIONS.map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer',
                  }}
                  whileHover={reduced ? {} : {
                    scale: 1.06,
                    filter: 'brightness(1.2)',
                    zIndex: 5,
                    transition: { duration: 0.2 },
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <img
        src={SeparatorLine}
        alt=""
        style={{ display: 'block', width: '100%', height: '5px', objectFit: 'cover', margin: 0, position: 'relative', zIndex: 2 }}
      />
      <Footer />
    </>
  )
}
