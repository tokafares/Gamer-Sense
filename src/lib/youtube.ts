// Normalises any YouTube URL (watch, youtu.be, shorts, or already-embed) to the
// embeddable iframe form. Returns null when the URL is not a YouTube link, so
// callers can fall back to <img>/<video>.
export function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null
  const patterns = [
    /youtube\.com\/embed\/([\w-]{6,})/,
    /[?&]v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
}
