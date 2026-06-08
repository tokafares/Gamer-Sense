import { motion, useReducedMotion } from 'framer-motion'
import Card1 from '../assets/Group 232.webp'
import Card2 from '../assets/Group 233.webp'
import Card3 from '../assets/Group 231.webp'
import { scrollFadeUp, scrollFadeIn, staggerCards, cardItemAnim } from '../lib/animations'

const vp = { once: true }

export default function WhatWeOffer() {
  const reduced = useReducedMotion()

  return (
    <section className="w-full py-[80px] flex flex-col items-center">

      <motion.div
        className="relative text-center"
        variants={scrollFadeUp}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      >
        <h2
          className="font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          style={{ mixBlendMode: 'multiply' as const }}
        >
          What we offer
        </h2>
        <h2
          className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          aria-hidden="true"
        >
          What we offer
        </h2>
      </motion.div>

      <motion.p
        className="font-['Inter',sans-serif] text-[25px] font-medium text-[#0E1B2F] text-center max-w-[1200px] mt-[40px] leading-[30px] px-[20px]"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
        transition={{ delay: 0.2 }}
      >
        Gamersense is designed to improve your game sense without the stress of ranked games or coaching. Inspired by chess.com, we provide quizzed in-game scenarios focusing on rotations, trades, fights, and macro decisions.
      </motion.p>

      <motion.div
        className="flex flex-row justify-center gap-[23px] mt-[60px]"
        variants={staggerCards}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      >
        <motion.img
          src={Card1}
          alt="Scenario-Based Learning"
          loading="lazy"
          className="w-[441px] h-[573px] object-contain"
          variants={cardItemAnim}
          whileHover={reduced ? {} : { y: -6, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))' }}
          whileTap={reduced ? {} : { scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
        <motion.img
          src={Card2}
          alt="Self-Paced Environment"
          loading="lazy"
          className="w-[441px] h-[573px] object-contain"
          variants={cardItemAnim}
          whileHover={reduced ? {} : { y: -6, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))' }}
          whileTap={reduced ? {} : { scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
        <motion.img
          src={Card3}
          alt="Community Interaction"
          loading="lazy"
          className="w-[441px] h-[573px] object-contain"
          variants={cardItemAnim}
          whileHover={reduced ? {} : { y: -6, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))' }}
          whileTap={reduced ? {} : { scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </motion.div>

    </section>
  )
}
