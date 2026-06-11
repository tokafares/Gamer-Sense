import { useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import FooterBg from '../assets/Group 73.svg'
import Woman from '../assets/C15 1.webp'
import { scrollFadeIn, footerStagger, footerItem, scaleInSpring } from '../lib/animations'
import { useIsMobile } from '../hooks/useIsMobile'

interface Particle {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  driftPhase: number
  alpha: number
}

interface BlobConfig {
  baseX: number
  baseY: number
  r: number
  rgb: [number, number, number]
  baseOpacity: number
  driftX: number
  driftY: number
  speedX: number
  speedY: number
  phaseX: number
  phaseY: number
  pulseSpeed: number
  pulsePhase: number
}

export default function Footer() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const blobCanvasRef = useRef<HTMLCanvasElement>(null)
  const vp = { once: true }

  // Floating particles
  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const count = Math.floor(Math.random() * 11) + 35
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 1.5,
      speed: 0.3 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.4,
      driftPhase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.3,
    }))

    let raf: number
    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      for (const p of particles) {
        p.y -= p.speed
        p.x += Math.sin(frame * 0.02 + p.driftPhase) * p.drift
        if (p.y < -p.r * 2) {
          p.y = canvas.height + p.r
          p.x = Math.random() * canvas.width
        }
        const fadeZone   = canvas.height * 0.15
        const fadeFactor = p.y < fadeZone ? Math.max(0, p.y / fadeZone) : 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 230, 220, ${p.alpha * fadeFactor})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [reduced])

  // Glowing blobs
  useEffect(() => {
    if (reduced) return

    const canvas = blobCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const blobs: BlobConfig[] = [
      { baseX: 0.15, baseY: 0.70, r: 200, rgb: [0, 180, 180], baseOpacity: 0.07, driftX: 45, driftY: 30, speedX: 0.0004, speedY: 0.0003, phaseX: 0.0, phaseY: 0.5,  pulseSpeed: 0.0007, pulsePhase: 0.0 },
      { baseX: 0.50, baseY: 0.80, r: 150, rgb: [0, 160, 200], baseOpacity: 0.05, driftX: 35, driftY: 25, speedX: 0.0006, speedY: 0.0005, phaseX: 1.2, phaseY: 2.1,  pulseSpeed: 0.0009, pulsePhase: 1.5 },
      { baseX: 0.82, baseY: 0.60, r: 220, rgb: [0, 200, 210], baseOpacity: 0.06, driftX: 55, driftY: 35, speedX: 0.0003, speedY: 0.0004, phaseX: 2.5, phaseY: 0.8,  pulseSpeed: 0.0005, pulsePhase: 3.0 },
      { baseX: 0.08, baseY: 0.30, r: 110, rgb: [0, 150, 170], baseOpacity: 0.04, driftX: 30, driftY: 20, speedX: 0.0005, speedY: 0.0003, phaseX: 4.1, phaseY: 1.7,  pulseSpeed: 0.0008, pulsePhase: 2.0 },
    ]

    let raf: number

    const draw = (time: number) => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (const b of blobs) {
        const bx = width  * b.baseX + Math.sin(time * b.speedX + b.phaseX) * b.driftX
        const by = height * b.baseY + Math.cos(time * b.speedY + b.phaseY) * b.driftY
        const opacity = b.baseOpacity * (0.85 + 0.15 * Math.sin(time * b.pulseSpeed + b.pulsePhase))
        const [cr, cg, cb] = b.rgb

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r)
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${opacity})`)
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`)
        ctx.beginPath()
        ctx.arc(bx, by, b.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [reduced])

  return (
    <footer
      className="relative w-full"
      style={{ height: isMobile ? '360px' : '500px', position: 'relative', zIndex: 30, marginTop: 0, paddingTop: 0 }}
    >
      {/* Background */}
      <img
        src={FooterBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      {/* Glowing blobs */}
      <canvas
        ref={blobCanvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          display: reduced ? 'none' : 'block',
        }}
      />

      {/* Floating particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          display: reduced ? 'none' : 'block',
        }}
      />

      {/* Woman — fade in (desktop only; too cramped on mobile) */}
      {!isMobile && (
        <motion.img
          src={Woman}
          alt=""
          loading="lazy"
          className="absolute pointer-events-none select-none z-[5]"
          style={{ left: '0px', bottom: '0px', height: 'calc(100% + 60px)', width: 'auto' }}
          variants={scrollFadeIn}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={vp}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Text content — staggered columns (full-width on mobile) */}
      <motion.div
        className="absolute z-[10]"
        style={isMobile ? { left: '24px', right: '24px', top: '48px' } : { left: '55%', top: '80px' }}
        variants={footerStagger}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={vp}
      >
        <motion.h3
          className="font-beaufort text-[40px] font-bold leading-none bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent"
          style={isMobile ? { fontSize: '28px' } : undefined}
          variants={footerItem}
        >
          About Us
        </motion.h3>

        <motion.p
          className="font-['Inter',sans-serif] text-[20px] font-normal leading-[30px] tracking-[0.10em] bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent mt-[14px]"
          style={isMobile ? { maxWidth: '100%', fontSize: '14px', lineHeight: '21px' } : { maxWidth: '420px' }}
          variants={footerItem}
        >
          Our mission is to enhance your League of Legends gameplay through strategic decision-making.
        </motion.p>

        <motion.h3
          className="font-beaufort text-[40px] font-bold leading-none bg-gradient-to-r from-[#3AF9FF] to-[#00A7AD] bg-clip-text text-transparent mt-[32px]"
          style={isMobile ? { fontSize: '28px', marginTop: '22px' } : undefined}
          variants={footerItem}
        >
          Quick Link
        </motion.h3>

        <motion.div
          className="flex flex-row gap-[40px] mt-[16px]"
          style={isMobile ? { gap: '22px' } : undefined}
          variants={footerItem}
        >
          {['Features', 'Community', 'Contact'].map(link => (
            <a
              key={link}
              href="#"
              className="font-['Inter',sans-serif] text-[20px] font-normal tracking-[0.10em] bg-gradient-to-b from-[#FFFCF6] to-[#969696] bg-clip-text text-transparent no-underline cursor-pointer hover:opacity-80 transition-opacity duration-200"
              style={isMobile ? { fontSize: '14px' } : undefined}
            >
              {link}
            </a>
          ))}
        </motion.div>

        {/* Social icons — each individually interactive */}
        <motion.div className="flex flex-row gap-[14px] mt-[32px]" variants={scaleInSpring}>

          {/* Instagram */}
          <motion.a
            href="#" aria-label="Instagram"
            animate={reduced ? {} : { filter: 'drop-shadow(0 0 0px rgba(58,249,255,0))' }}
            whileHover={reduced ? {} : { scale: 1.13, y: -4, filter: 'drop-shadow(0 0 10px rgba(58,249,255,0.55))' }}
            whileTap={reduced ? {} : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <svg width="39" height="39" viewBox="0 0 38.648 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-grad" x1="19.323" y1="-12.9526" x2="19.323" y2="48.5433" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3AF9FF"/><stop offset="1" stopColor="#00A7AD"/>
                </linearGradient>
              </defs>
              <rect x="2.484" y="2.484" width="33.6796" height="33.6796" fill="#0F1E2D" fillOpacity="0.95" stroke="black" strokeOpacity="0.5" strokeWidth="4.96759"/>
              <rect x="2.484" y="2.484" width="33.6796" height="33.6796" stroke="url(#ig-grad)" strokeWidth="1.65957"/>
              <path d="M22.6769 11.0256H15.9696C14.6586 11.0267 13.4016 11.574 12.4746 12.5473C11.5476 13.5206 11.0264 14.8404 11.0254 16.2169V23.2591C11.0262 24.6358 11.5473 25.9558 12.4744 26.9293C13.4014 27.9027 14.6585 28.4501 15.9696 28.4512H22.6769C23.9879 28.4499 25.245 27.9025 26.1719 26.929C27.0989 25.9556 27.6201 24.6357 27.6211 23.2591V16.2169C27.6205 14.8403 27.0994 13.5202 26.1723 12.5468C25.2452 11.5734 23.988 11.0263 22.6769 11.0256ZM25.9524 23.2591C25.9522 24.1712 25.6071 25.0459 24.9928 25.6908C24.3786 26.3357 23.5456 26.6981 22.6769 26.6983H15.9696C15.5395 26.6983 15.1136 26.6094 14.7163 26.4365C14.3189 26.2637 13.9578 26.0103 13.6537 25.691C13.3496 25.3716 13.1084 24.9925 12.9439 24.5752C12.7794 24.1579 12.6947 23.7108 12.6948 23.2591V16.2169C12.6947 15.7653 12.7794 15.3181 12.9439 14.9009C13.1085 14.4837 13.3497 14.1046 13.6538 13.7853C13.9579 13.466 14.319 13.2128 14.7163 13.04C15.1137 12.8672 15.5396 12.7784 15.9696 12.7785H22.6769C23.5454 12.7787 24.3782 13.141 24.9923 13.7858C25.6064 14.4306 25.9515 15.305 25.9517 16.2169L25.9524 23.2591Z" fill="#FFFCF6"/>
              <path d="M19.3236 15.2331C16.9564 15.2331 15.0327 17.2537 15.0327 19.7384C15.0327 22.2231 16.9571 24.2437 19.3236 24.2437C21.6902 24.2437 23.6146 22.2231 23.6146 19.7384C23.6146 17.2537 21.6909 15.2331 19.3236 15.2331ZM19.3236 22.4909C18.6284 22.491 17.9616 22.2011 17.4699 21.685C16.9782 21.1689 16.7019 20.4688 16.7018 19.7388C16.7017 19.0088 16.9778 18.3087 17.4693 17.7924C17.9609 17.2762 18.6276 16.9861 19.3229 16.986C20.0181 16.9859 20.685 17.2757 21.1767 17.7919C21.6684 18.308 21.9447 19.008 21.9448 19.738C21.9449 20.468 21.6688 21.1681 21.1772 21.6844C20.6857 22.2007 20.0189 22.4907 19.3236 22.4909ZM23.6236 14.1868C23.8269 14.1869 24.0256 14.2504 24.1946 14.3691C24.3636 14.4878 24.4953 14.6564 24.573 14.8536C24.6507 15.0508 24.671 15.2678 24.6313 15.4772C24.5916 15.6865 24.4937 15.8788 24.35 16.0298C24.2062 16.1807 24.0231 16.2835 23.8237 16.3252C23.6243 16.3669 23.4176 16.3456 23.2297 16.2639C23.0419 16.1823 22.8813 16.0441 22.7683 15.8667C22.6552 15.6892 22.5948 15.4806 22.5947 15.2672C22.5947 14.6715 22.9794 14.1868 23.6236 14.1868Z" fill="#FFFCF6"/>
            </svg>
          </motion.a>

          {/* X / Twitter */}
          <motion.a
            href="#" aria-label="X"
            animate={reduced ? {} : { filter: 'drop-shadow(0 0 0px rgba(58,249,255,0))' }}
            whileHover={reduced ? {} : { scale: 1.13, y: -4, filter: 'drop-shadow(0 0 10px rgba(58,249,255,0.55))' }}
            whileTap={reduced ? {} : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <svg width="39" height="39" viewBox="53.17 0 38.648 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="x-grad" x1="72.4929" y1="-12.9526" x2="72.4929" y2="48.5433" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3AF9FF"/><stop offset="1" stopColor="#00A7AD"/>
                </linearGradient>
              </defs>
              <rect x="55.6543" y="2.484" width="33.6796" height="33.6796" fill="#0F1E2D" fillOpacity="0.95" stroke="black" strokeOpacity="0.5" strokeWidth="4.96759"/>
              <rect x="55.6543" y="2.484" width="33.6796" height="33.6796" stroke="url(#x-grad)" strokeWidth="1.65957"/>
              <path d="M64.2358 11.8557L70.6432 20.5516L64.1953 27.6217H65.6465L71.2916 21.4317L75.8527 27.6217H80.7911L74.0231 18.4367L80.0248 11.8557H78.5736L73.3747 17.5566L69.1741 11.8557H64.2358ZM66.3698 12.9407H68.6385L78.6567 26.5365H76.388L66.3698 12.9407Z" fill="#FFFCF6"/>
            </svg>
          </motion.a>

          {/* Facebook */}
          <motion.a
            href="#" aria-label="Facebook"
            animate={reduced ? {} : { filter: 'drop-shadow(0 0 0px rgba(58,249,255,0))' }}
            whileHover={reduced ? {} : { scale: 1.13, y: -4, filter: 'drop-shadow(0 0 10px rgba(58,249,255,0.55))' }}
            whileTap={reduced ? {} : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <svg width="39" height="39" viewBox="106.34 0 38.648 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fb-grad" x1="125.663" y1="-12.9526" x2="125.663" y2="48.5433" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3AF9FF"/><stop offset="1" stopColor="#00A7AD"/>
                </linearGradient>
              </defs>
              <rect x="108.824" y="2.484" width="33.6796" height="33.6796" fill="#0F1E2D" fillOpacity="0.95" stroke="black" strokeOpacity="0.5" strokeWidth="4.96759"/>
              <rect x="108.824" y="2.484" width="33.6796" height="33.6796" stroke="url(#fb-grad)" strokeWidth="1.65957"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M127.329 15.862C127.686 15.5221 128.238 15.5591 128.279 15.561L130.591 15.5601L130.641 12.1318L130.292 12.0438C130.069 11.9873 129.385 11.8557 127.877 11.8557C125.192 11.8557 123.387 13.7871 123.387 16.6605V17.4322H120.684V21.1374H123.387V27.6217H126.993V21.1374H129.842L130.338 17.4322H126.993V16.8643C126.993 16.4132 127.106 16.0751 127.329 15.862Z" fill="#FFFCF6"/>
            </svg>
          </motion.a>

        </motion.div>
      </motion.div>

    </footer>
  )
}
