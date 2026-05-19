import type { Variants } from 'framer-motion'

export const DURATION = { fast: 0.15, base: 0.45, slow: 0.7 }
export const STAGGER  = { tight: 0.05, normal: 0.08, loose: 0.12 }
export const SPRING   = {
stiff: { type: 'spring', stiffness: 400, damping: 22 },
soft:  { type: 'spring', stiffness: 220, damping: 18 }
}

export const fadeUp: Variants = {
hidden: { opacity: 0, y: 20 },
show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
}

export const staggerContainer: Variants = {
hidden: {},
show:   { transition: { staggerChildren: 0.08 } }
}

export const scaleIn: Variants = {
hidden: { scale: 0, opacity: 0 },
show:   { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
}

export const slideFromLeft: Variants = {
hidden: { x: -50, opacity: 0 },
show:   { x: 0, opacity: 1 }
}

export const slideFromRight: Variants = {
hidden: { x: 50, opacity: 0 },
show:   { x: 0, opacity: 1 }
}

// ── Navbar ──────────────────────────────────────────────────────────────────

export const navSlideDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

// ── Hero load animations ─────────────────────────────────────────────────────

export const heroTitle: Variants = {
  hidden: { x: -30, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut', delay: 0.5 } }
}

export const heroTitleLarge: Variants = {
  hidden: { x: -40, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut', delay: 0.75 } }
}

export const heroSubtitleAnim: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, ease: 'easeOut', delay: 1 } }
}

export const heroButtonAnim: Variants = {
  hidden: { y: 15, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut', delay: 1.2 } }
}

// ── Scroll-triggered entrance ─────────────────────────────────────────────────

export const scrollFadeUp: Variants = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

export const scrollFadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

export const slideFromLeftScroll: Variants = {
  hidden: { x: -30, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

export const slideFromRightScroll: Variants = {
  hidden: { x: 30, opacity: 0 },
  show:   { x: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

// ── Cards ──────────────────────────────────────────────────────────────────

export const staggerCards: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } }
}

export const cardItemAnim: Variants = {
  hidden: { y: 40, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

// ── Spring scale ──────────────────────────────────────────────────────────────

export const scaleInSpring: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show:   { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 20 } }
}

// ── Footer ────────────────────────────────────────────────────────────────────

export const footerStagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

export const footerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}
