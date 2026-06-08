import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ArenaBright from '../assets/image 18.png'
import ArenaDark from '../assets/image 19.png'
import PlayersBright from '../assets/C11 1.png'
import PlayersDark from '../assets/C11 2.png'
import GetStartedBtn from '../assets/Group 68.svg'
import {
  heroTitle,
  heroTitleLarge,
  heroSubtitleAnim,
  heroButtonAnim,
} from '../lib/animations'

export default function HeroSection() {
  const reduced = useReducedMotion()

  return (
    <section
      className="relative w-full h-[calc(100vh-86.4px)] min-h-[500px] bg-[#091528] mt-[86.4px]"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 120px), 0 100%)' }}
    >

      {/* Background container — overflow-hidden here so images never bleed */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Layer 1: Base color */}
        <div className="absolute inset-0 z-[0] bg-[#091528]" />

        {/* Layer 2: Bright arena — Ken Burns zoom loop */}
        <motion.img
          src={ArenaBright}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center z-[1] pointer-events-none"
          animate={reduced ? {} : { scale: [1, 1.08, 1] }}
          transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Layer 3: Dark arena overlay — static */}
        <img
          src={ArenaDark}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center z-[2] pointer-events-none"
        />

        {/* Layer 4: Bright players — idle float */}
        <motion.img
          src={PlayersBright}
          alt=""
          className="z-[3] pointer-events-none select-none"
          style={{
            position: 'absolute',
            right: '0',
            bottom: '0',
            height: '75%',
            width: '55%',
            objectFit: 'cover',
            objectPosition: 'left top',
          }}
          animate={reduced ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Layer 5: Dark players overlay — Screen blend, same float */}
        <motion.img
          src={PlayersDark}
          alt=""
          className="z-[4] pointer-events-none select-none"
          style={{
            position: 'absolute',
            right: '0',
            bottom: '0',
            height: '75%',
            width: '55%',
            objectFit: 'cover',
            objectPosition: 'left top',
            mixBlendMode: 'screen' as const,
          }}
          animate={reduced ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Layer 6: Left-to-right gradient */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #091528 0%, #091528bb 28%, transparent 55%)',
          }}
        />

        {/* Layer 7: Top-to-bottom gradient */}
        <div
          className="absolute inset-0 z-[6] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(9,21,40,0.8) 100%)',
          }}
        />

      </div>

      {/* Content — not clipped, text can breathe */}
      <div className="absolute z-[10]" style={{ top: 0, left: 0, bottom: 0, right: 0, overflow: 'visible' }}>

        {/* "Master" */}
        <motion.h2
          className="absolute left-[79px] top-[20%] font-beaufort text-[53.58px] font-bold leading-none bg-gradient-to-b from-[#FFFCF6] to-[#CCCCCC] bg-clip-text text-transparent whitespace-nowrap"
          variants={heroTitle}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          Master
        </motion.h2>

        {/* "League of Legends" — inline styles preserved, motion added */}
        <motion.h1
          className="absolute font-beaufort font-bold"
          style={{
            left: '79px',
            top: '30%',
            fontSize: '90px',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            width: 'max-content',
            paddingRight: '6px',
            paddingBottom: '8px',
            background: 'linear-gradient(to right, #3AF9FF, #00A7AD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
          variants={heroTitleLarge}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          League of Legends
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="absolute left-[79px] top-[46%] font-['Inter',sans-serif] text-[17px] font-normal leading-snug w-[400px] h-auto pb-[8px] bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent"
          variants={heroSubtitleAnim}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          Enhance your decision-making skills with scenario based learning.
        </motion.p>

        {/* GET STARTED button */}
        <Link to="/features" style={{ position: 'absolute', left: '79px', top: '62%', lineHeight: 0 }}>
          <motion.img
            src={GetStartedBtn}
            alt="Get Started"
            className="w-[345px] h-[65px] cursor-pointer flex-shrink-0"
            variants={heroButtonAnim}
            initial={reduced ? false : 'hidden'}
            animate="show"
            whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </Link>
      </div>

    </section>
  )
}
