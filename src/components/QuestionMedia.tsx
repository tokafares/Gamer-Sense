import type { ReactNode } from 'react'
import { toYouTubeEmbed } from '../lib/youtube'

interface Props {
  imageUrl?: string | null
  fallback: ReactNode
}

function isVideo(url: string): boolean {
  return url.endsWith('.mp4') || url.toLowerCase().includes('video')
}

export default function QuestionMedia({ imageUrl, fallback }: Props) {
  if (!imageUrl) return <>{fallback}</>

  const ytEmbed = toYouTubeEmbed(imageUrl)
  if (ytEmbed) {
    return (
      <iframe
        key={ytEmbed}
        src={`${ytEmbed}?rel=0&modestbranding=1`}
        title="Question media"
        width="100%"
        height="100%"
        style={{ display: 'block', border: 'none', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (isVideo(imageUrl)) {
    return (
      <video
        key={imageUrl}
        src={imageUrl}
        autoPlay
        muted
        loop
        playsInline
        controls
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )
  }

  return (
    <img
      key={imageUrl}
      src={imageUrl}
      alt=""
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
