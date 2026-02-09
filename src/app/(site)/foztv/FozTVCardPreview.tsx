'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test((url || '').trim())
}

function getYouTubeEmbedUrl(url: string): string {
  const trimmed = (url || '').trim()
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/)
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([^&\s?#]+)/)
  const id = watchMatch?.[1] || embedMatch?.[1]
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&start=0` : ''
}

interface FozTVVideo {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl: string | null
  likeCount?: number
}

interface FozTVCardPreviewProps {
  video: FozTVVideo
  isHovering: boolean
  onPlay: () => void
}

const PREVIEW_DURATION_SEC = 8
const FADE_OUT_START_SEC = 6

export default function FozTVCardPreview({
  video,
  isHovering,
  onPlay,
}: FozTVCardPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [previewReady, setPreviewReady] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isYouTube = isYouTubeUrl(video.videoUrl)

  useEffect(() => {
    if (!isHovering) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      const v = videoRef.current
      if (v) {
        v.pause()
        v.currentTime = 0
        v.volume = 1
      }
      setPreviewReady(false)
      return
    }

    if (isYouTube) {
      setPreviewReady(true)
      return
    }

    const v = videoRef.current
    if (!v) return

    v.currentTime = 0
    v.muted = false
    v.volume = 1

    const playPromise = v.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setPreviewReady(true))
        .catch(() => {
          v.muted = true
          v.play().then(() => setPreviewReady(true)).catch(() => setPreviewReady(true))
        })
    } else {
      setPreviewReady(true)
    }

    intervalRef.current = setInterval(() => {
      const el = videoRef.current
      if (!el) return
      const t = el.currentTime
      if (t >= PREVIEW_DURATION_SEC) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        el.pause()
        el.currentTime = 0
        el.volume = 1
        return
      }
      if (t >= FADE_OUT_START_SEC) {
        const fadeDuration = PREVIEW_DURATION_SEC - FADE_OUT_START_SEC
        const fadeProgress = (t - FADE_OUT_START_SEC) / fadeDuration
        el.volume = Math.max(0, 1 - fadeProgress)
      }
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isHovering, isYouTube])

  if (!isHovering) return null

  return (
    <div
      className="absolute inset-0 z-10 bg-black flex items-center justify-center rounded-xl overflow-hidden"
      onClick={(e) => {
        e.stopPropagation()
        onPlay()
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(video.videoUrl)}
          title={video.title}
          className="absolute inset-0 w-full h-full pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          muted={false}
          loop={false}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
        <span className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center shadow-lg opacity-90">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </span>
      </div>
      <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium drop-shadow-md line-clamp-2">
        {video.title}
      </p>
    </div>
  )
}

export { isYouTubeUrl }
