import { motion, useReducedMotion } from 'framer-motion'
import RiotLogo from '../assets/Group 74.svg'
import LearnMoreBtn from '../assets/Group 171.svg'
import PartnerIllustration from '../assets/C6 2.webp'
import { scrollFadeUp, scrollFadeIn, scaleInSpring } from '../lib/animations'
import { useIsMobile } from '../hooks/useIsMobile'

export default function OurPartners() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const vp = { once: true }

  return (
    <div className="w-full">

      <div className="flex flex-col items-center pb-[40px]" style={{ paddingTop: isMobile ? '48px' : '80px' }}>

        <motion.div
          className="relative text-center"
          variants={scrollFadeUp}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
        >
          <h2
            className="font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
            style={{ mixBlendMode: 'multiply' as const, fontSize: isMobile ? '35px' : undefined }}
          >
            Our Partners
          </h2>
          <h2
            className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
            style={{ fontSize: isMobile ? '35px' : undefined }}
            aria-hidden="true"
          >
            Our Partners
          </h2>
        </motion.div>

        <motion.p
          className="font-['Inter',sans-serif] text-[25px] font-medium text-[#0E1B2F] text-center max-w-[1090px] mt-[40px] leading-[30px] px-[20px]"
          style={isMobile ? { fontSize: '11px', lineHeight: '15px', marginTop: '20px' } : undefined}
          variants={scrollFadeIn}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
          transition={{ delay: 0.15 }}
        >
          Collaborative excellence with the industry's best. We are proud to work alongside these visionaries to push the boundaries of what's possible.
        </motion.p>

        <motion.img
          src={RiotLogo}
          className="w-[236px] h-[85px] object-contain mt-[48px]"
          alt="Riot Games"
          variants={scaleInSpring}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
          transition={{ delay: 0.3 }}
        />

        <motion.img
          src={LearnMoreBtn}
          className="w-[215px] h-[60px] object-contain mt-[24px] cursor-pointer"
          alt="Learn More"
          variants={scrollFadeIn}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
          transition={{ delay: 0.45 }}
          whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
          whileTap={reduced ? {} : { scale: 0.97 }}
        />

      </div>

      {/* Illustration flush at bottom — centred cutout */}
      <div style={{ lineHeight: 0, fontSize: 0, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <motion.img
          src={PartnerIllustration}
          alt=""
          loading="lazy"
          className="h-auto block"
          style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: isMobile ? '420px' : '760px' }}
          variants={scrollFadeIn}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
        />
      </div>

    </div>
  )
}
