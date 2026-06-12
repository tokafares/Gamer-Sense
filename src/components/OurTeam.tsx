import { motion, useReducedMotion } from 'framer-motion'
import LearnMoreBtn from '../assets/Group 171.svg'
import { scrollFadeUp, scrollFadeIn } from '../lib/animations'
import { useIsMobile } from '../hooks/useIsMobile'

export default function OurTeam() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const vp = { once: true }

  return (
    <div className="w-full">
      <div
        className="flex flex-col items-center text-center"
        style={{ paddingTop: isMobile ? '48px' : '80px', paddingBottom: isMobile ? '40px' : '60px', paddingLeft: '20px', paddingRight: '20px' }}
      >

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
            Our Team
          </h2>
          <h2
            className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
            style={{ fontSize: isMobile ? '35px' : undefined }}
            aria-hidden="true"
          >
            Our Team
          </h2>
        </motion.div>

        <motion.p
          className="font-['Inter',sans-serif] text-[22px] font-medium text-[#0E1B2F] text-center max-w-[1090px] leading-[30px] mt-[40px]"
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
          src={LearnMoreBtn}
          alt="Learn More"
          className="w-[215px] h-[60px] object-contain mt-[24px] cursor-pointer"
          variants={scrollFadeIn}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
          transition={{ delay: 0.3 }}
          whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
          whileTap={reduced ? {} : { scale: 0.97 }}
        />
      </div>
    </div>
  )
}
