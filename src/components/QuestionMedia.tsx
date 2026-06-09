import type { ReactNode } from 'react'

interface Props {
  imageUrl?: string | null
  fallback: ReactNode
}

function isVideo(url: string): boolean {
  return url.endsWith('.mp4') || url.toLowerCase().includes('video')
}

export default function QuestionMedia({ imageUrl, fallback }: Props) {
  if (!imageUrl) return <>{fallback}</>

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
