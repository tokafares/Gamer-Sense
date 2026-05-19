import { motion, useReducedMotion } from 'framer-motion'
import LeaderboardTable from '../assets/Group 386.svg'
import PrizeDraw from '../assets/Group 391.svg'
import ViewBtn from '../assets/Group 390.svg'
import { scrollFadeUp, scrollFadeIn } from '../lib/animations'

export default function Leaderboard() {
  const reduced = useReducedMotion()
  const vp = { once: true }

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
          Leaderboard
        </h2>
        <h2
          className="absolute inset-0 font-beaufort text-[90px] font-bold leading-none tracking-[-0.02em] bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          aria-hidden="true"
        >
          Leaderboard
        </h2>
      </motion.div>

      <motion.img
        src={LeaderboardTable}
        className="w-[1111px] h-[465px] object-contain mt-[40px]"
        alt="Leaderboard table"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
        transition={{ delay: 0.2 }}
      />

      <motion.img
        src={PrizeDraw}
        className="w-[1111px] h-[206px] object-contain mt-[16px]"
        alt="Prize Draw"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
        transition={{ delay: 0.35 }}
      />

      <motion.img
        src={ViewBtn}
        className="w-[236px] h-[65px] object-contain mt-[32px] cursor-pointer"
        alt="View"
        variants={scrollFadeIn}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
        transition={{ delay: 0.5 }}
        whileHover={reduced ? {} : { scale: 1.04, filter: 'brightness(1.1)' }}
        whileTap={reduced ? {} : { scale: 0.97 }}
      />

    </section>
  )
}
