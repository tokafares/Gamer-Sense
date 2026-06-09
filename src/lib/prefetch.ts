// Import large page-specific images so their hashed URLs are available at runtime.
// Actual downloads are triggered lazily via new Image() during idle time — not on import.
import group245 from '../assets/Group 245.webp'
import group309 from '../assets/Group 309.webp'
import image21 from '../assets/image 21.webp'
import card1 from '../assets/Group 232.webp'
import card2 from '../assets/Group 233.webp'
import card3 from '../assets/Group 231.webp'

// Ordered by priority: most-visited pages first
const PAGE_IMAGES = [
  group245,    // /features hero illustration
group309,    // /knowledge-hub header
  card1,       // "What we offer" cards (lazy on landing but user will scroll)
  card2,
  card3,
  image21,     // /profile avatar placeholder
]

function loadImage(src: string): void {
  const img = new Image()
  img.src = src
}

export function prefetchPageImages(): void {
  const run = () => {
    PAGE_IMAGES.forEach(src => loadImage(src))
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 3000 })
  } else {
    // Safari fallback — fire after a short delay so it doesn't compete with initial render
    setTimeout(run, 1500)
  }
}
