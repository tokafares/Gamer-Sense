import { motion, useReducedMotion } from 'framer-motion'
import MaskGroup from '../assets/Mask group.webp'
import TeamGroup from '../assets/C6 2.webp'
import LearnMoreBtn from '../assets/Group 171.svg'
import { scrollFadeIn, scrollFadeUp, slideFromLeftScroll, slideFromRightScroll } from '../lib/animations'
import { useIsMobile } from '../hooks/useIsMobile'

export default function OurTeam() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const vp = { once: true }

  // Mobile: centred text-only section (gamers art lives in Our Partners on mobile)
  if (isMobile) {
    return (
      <div className="w-full">
        <div
          className="flex flex-col items-center text-center"
          style={{ paddingTop: '48px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px' }}
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
              style={{ mixBlendMode: 'multiply' as const, fontSize: '35px' }}
            >
              Our Team
            </h2>
            <h2
              className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
              style={{ fontSize: '35px' }}
              aria-hidden="true"
            >
              Our Team
            </h2>
          </motion.div>

          <motion.p
            className="font-['Inter',sans-serif] text-[22px] font-medium text-[#0E1B2F] text-center max-w-[1090px] leading-[30px]"
            style={{ fontSize: '11px', lineHeight: '15px', marginTop: '20px' }}
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

  // Desktop: original layout — gamers art on the right, text on the left
  return (
    <section
      className="relative w-full"
      style={{ height: '590px', marginTop: '-4px', marginBottom: 0, paddingBottom: 0, zIndex: 20, position: 'relative', clipPath: 'inset(-250px 0 0 0)' }}
    >

      {/* TEAM GROUP — slide in from right (opacity only to preserve rotate transform) */}
      <motion.img
        src={TeamGroup}
        alt="Our Team"
        loading="lazy"
        className="absolute z-[2] pointer-events-none select-none"
        style={{
          right: '0px',
          top: '-150px',
          height: '100%',
          width: 'auto',
          maxWidth: '52%',
          objectFit: 'contain',
          objectPosition: 'right top',
          transform: 'rotate(-5.35deg)',
          transformOrigin: 'top right',
        }}
        variants={slideFromRightScroll}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      />

      {/* MASK GROUP — static overlay */}
      <img
        src={MaskGroup}
        alt=""
        loading="lazy"
        className="absolute left-0 w-full z-[5] pointer-events-none select-none"
        style={{
          top: '42%',
          height: '65%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* TEXT CONTENT — slide in from left */}
      <motion.div
        className="absolute z-[10]"
        style={{ left: '79px', top: '60px', maxWidth: '500px' }}
        variants={slideFromLeftScroll}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      >

        <div className="relative">
          <h2
            className="font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
            style={{ mixBlendMode: 'multiply' as const }}
          >
            Our Team
          </h2>
          <h2
            className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
            aria-hidden="true"
          >
            Our Team
          </h2>
        </div>

        <p
          className="font-['Inter',sans-serif] text-[22px] font-medium text-[#0E1B2F] leading-[30px] mt-[16px]"
        >
          Collaborative excellence with the industry's best. We are proud to work alongside these visionaries to push the boundaries of what's possible.
        </p>

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
      </motion.div>

    </section>
  )
}
