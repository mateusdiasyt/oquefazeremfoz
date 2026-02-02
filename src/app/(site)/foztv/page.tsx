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

  const featured = videos[0]
  const rest = videos.slice(1)

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
      </main>
    )
  }

  if (videos.length === 0) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <Tv className="w-16 h-16 text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">FozTV</h1>
        <p className="text-gray-400 text-center">Em breve: vídeos sobre Foz do Iguaçu.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero – vídeo em destaque */}
      <section className="relative w-full aspect-video max-h-[85vh] bg-gray-900">
        {playing ? (
          <>
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
            <button
              type="button"
              onClick={() => setPlaying(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              aria-label="Fechar vídeo"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
              <h2 className="text-xl md:text-2xl font-bold drop-shadow">{playing.title}</h2>
              {playing.description && (
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{playing.description}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPlaying(featured)}
              className="absolute inset-0 w-full h-full group flex items-center justify-center bg-cover bg-center"
              style={{
                backgroundImage: `url(${featured.thumbnailUrl || getYouTubeThumbnail(featured.videoUrl) || ''})`,
              }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              <span className="relative z-10 w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </span>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
              <h2 className="text-xl md:text-2xl font-bold drop-shadow">{featured.title}</h2>
              {featured.description && (
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{featured.description}</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* Prateleiras */}
      <section className="py-6 px-4 md:px-6 lg:px-8">
        {rest.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4 px-1">Mais vídeos</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-900 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
              {rest.map((video) => {
                const thumb = video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl)
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setPlaying(video)}
                    className="flex-shrink-0 w-[280px] md:w-[320px] group text-left rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-red-500 transition-all"
                  >
                    <div className="relative aspect-video bg-gray-800">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <span className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                        {video.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
