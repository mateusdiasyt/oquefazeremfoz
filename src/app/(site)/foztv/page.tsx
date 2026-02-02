'use client'

import { useState, useEffect } from 'react'
import { Play, Tv, X } from 'lucide-react'

interface FozTVVideo {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  publishedAt: string | null
  order: number
}

// Converte URL do YouTube (watch ou youtu.be) em URL de embed
function getEmbedUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/)
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([^&\s?#]+)/)
  const id = watchMatch?.[1] || embedMatch?.[1]
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : trimmed
}

// Thumbnail do YouTube a partir da URL
function getYouTubeThumbnail(url: string): string | null {
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/)
  const embedMatch = url.match(/youtube\.com\/embed\/([^&\s?#]+)/)
  const id = watchMatch?.[1] || embedMatch?.[1]
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}

// Verifica se é link do YouTube (embed) ou vídeo próprio (upload/link direto)
function isYouTubeUrl(url: string): boolean {
  if (!url?.trim()) return false
  return /youtube\.com|youtu\.be/i.test(url.trim())
}

export default function FozTVPage() {
  const [videos, setVideos] = useState<FozTVVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<FozTVVideo | null>(null)

  useEffect(() => {
    fetch('/api/public/foztv', { cache: 'no-store' })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) return setVideos([])
        const list = Array.isArray(data) ? data : (data?.videos ?? [])
        setVideos(Array.isArray(list) ? list : [])
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [])

  // Fechar popup ao pressionar Escape
  useEffect(() => {
    if (!playing) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlaying(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [playing])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-600 border-t-transparent" />
      </main>
    )
  }

  if (videos.length === 0) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white px-4">
        <Tv className="w-16 h-16 text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">FozTV</h1>
        <p className="text-gray-400 text-center">Em breve: vídeos sobre Foz do Iguaçu.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Cabeçalho da seção */}
      <section className="pt-6 pb-4 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">FozTV</h1>
          <p className="text-gray-400 text-sm mt-1">Vídeos sobre Foz do Iguaçu</p>
        </div>
      </section>

      {/* Grade de vídeos */}
      <section className="pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {videos.map((video) => {
              const thumb = video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl)
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setPlaying(video)}
                  className="group text-left rounded-lg overflow-hidden bg-gray-900/80 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                >
                  <div className="relative aspect-video bg-gray-800">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Play className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                      <span className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-white text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popup do vídeo */}
      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Assistir vídeo"
        >
          <button
            type="button"
            onClick={() => setPlaying(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            {isYouTubeUrl(playing.videoUrl) ? (
              <iframe
                src={getEmbedUrl(playing.videoUrl)}
                title={playing.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={playing.videoUrl}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-contain bg-black"
                playsInline
              />
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-16 max-w-4xl">
            <h2 className="text-lg font-bold text-white drop-shadow-md">{playing.title}</h2>
            {playing.description && (
              <p className="text-sm text-gray-300 mt-1 line-clamp-2">{playing.description}</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
