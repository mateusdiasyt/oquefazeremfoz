'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface FozTVNativePlayerProps {
  src: string
  title: string
  onClose?: () => void
}

export default function FozTVNativePlayer({ src, title, onClose }: FozTVNativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [progressHover, setProgressHover] = useState<{ x: number; time: number } | null>(null)
  const [previewThumb, setPreviewThumb] = useState<string | null>(null)
  const [isSeeking, setIsSeeking] = useState(false)

  const video = videoRef.current
  const previewVideo = previewVideoRef.current

  const updateTime = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (!isSeeking) setCurrentTime(v.currentTime)
  }, [isSeeking])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTimeUpdate = () => updateTime()
    const onLoadedMetadata = () => setDuration(v.duration)
    const onEnded = () => setPlaying(false)
    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('loadedmetadata', onLoadedMetadata)
    v.addEventListener('ended', onEnded)
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('loadedmetadata', onLoadedMetadata)
      v.removeEventListener('ended', onEnded)
    }
  }, [updateTime])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [])

  const toggleMuted = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const formatTime = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current
      const v = videoRef.current
      if (!bar || !v) return
      const rect = bar.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      v.currentTime = x * duration
      setCurrentTime(v.currentTime)
    },
    [duration]
  )

  const handleProgressMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current
      if (!bar) return
      const rect = bar.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const t = Math.max(0, Math.min(duration, x * duration))
      setProgressHover({ x: Math.max(0, Math.min(1, x)), time: t })
    },
    [duration]
  )

  const handleProgressMouseLeave = useCallback(() => {
    setProgressHover(null)
    setPreviewThumb(null)
  }, [])

  // Gerar thumbnail de preview ao hover na timeline (vídeo nativo)
  useEffect(() => {
    if (!progressHover || !previewVideoRef.current || !canvasRef.current) {
      setPreviewThumb(null)
      return
    }
    const preview = previewVideoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const time = progressHover.time
    if (preview.currentTime !== time) {
      preview.currentTime = time
    }

    const onSeeked = () => {
      try {
        if (canvas.width !== preview.videoWidth) {
          canvas.width = preview.videoWidth
          canvas.height = preview.videoHeight
        }
        ctx.drawImage(preview, 0, 0)
        setPreviewThumb(canvas.toDataURL('image/jpeg', 0.85))
      } catch {
        setPreviewThumb(null)
      }
    }
    preview.addEventListener('seeked', onSeeked, { once: true })
    return () => preview.removeEventListener('seeked', onSeeked)
  }, [progressHover])

  const handleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col bg-black group/controls">
      {/* Vídeo principal */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Vídeo oculto para gerar preview da timeline */}
      <video
        ref={previewVideoRef}
        src={src}
        preload="auto"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        crossOrigin="anonymous"
      />

      <canvas ref={canvasRef} className="hidden" width={640} height={360} />

      {/* Barra de controles estilo YouTube */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-2 px-3 opacity-0 group-hover/controls:opacity-100 transition-opacity">
        {/* Timeline com preview ao hover */}
        <div
          ref={progressRef}
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-2 group/timeline"
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
        >
          <div
            className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          {/* Preview ao passar o mouse na timeline */}
          {progressHover != null && previewThumb && (
            <div
              className="absolute bottom-full left-0 -translate-x-1/2 mb-2 pointer-events-none z-10"
              style={{ left: `${progressHover.x * 100}%` }}
            >
              <div className="bg-black rounded overflow-hidden shadow-xl border border-white/20" style={{ width: 160 }}>
                <img src={previewThumb} alt="" className="w-full aspect-video object-contain block" />
                <div className="px-2 py-1 text-xs text-white font-mono bg-black/80">
                  {formatTime(progressHover.time)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={toggleMuted}
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <span className="text-white text-xs font-mono select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleFullscreen}
            className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tela cheia"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
