import { useRef, useEffect } from 'react'
import { useMotionValue, useTransform, useInView, animate } from 'framer-motion'

export function useCountUp(target: number, duration = 1.2) {
  const ref = useRef<HTMLElement>(null)
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, { duration, ease: 'easeOut' })
    return () => controls.stop()
  }, [inView, target, count, duration])

  return { value: rounded, ref }
}
