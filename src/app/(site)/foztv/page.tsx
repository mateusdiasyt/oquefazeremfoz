'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Tv, X, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

interface FozTVVideo {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  publishedAt: string | null
  order: number
  likeCount?: number
}

interface VideoDetails extends FozTVVideo {
  userLiked?: boolean
}

interface FozTVComment {
  id: string
  body: string
  createdAt: string
  user: { id: string; name: string; profileImage: string | null } | null
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`
  return d.toLocaleDateString('pt-BR')
}

export default function FozTVPage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<FozTVVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<FozTVVideo | null>(null)
  const [details, setDetails] = useState<VideoDetails | null>(null)
  const [comments, setComments] = useState<FozTVComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)

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

  const fetchDetailsAndComments = useCallback((videoId: string) => {
    Promise.all([
      fetch(`/api/public/foztv/${videoId}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/public/foztv/${videoId}/comments`, { cache: 'no-store' }).then((r) => r.json())
    ]).then(([detailRes, commentsRes]) => {
      if (detailRes.id) setDetails(detailRes)
      if (commentsRes.comments) setComments(commentsRes.comments)
    }).catch(() => {
      setDetails(null)
      setComments([])
    })
  }, [])

  useEffect(() => {
    if (!playing) {
      setDetails(null)
      setComments([])
      setCommentText('')
      return
    }
    setDetails({ ...playing, likeCount: playing.likeCount ?? 0, userLiked: false })
    fetchDetailsAndComments(playing.id)
  }, [playing?.id, fetchDetailsAndComments, playing])

  const handleClose = useCallback(() => setPlaying(null), [])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  useEffect(() => {
    if (!playing) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [playing, handleClose])

  const handleLike = async () => {
    if (!playing || !user) return
    setTogglingLike(true)
    try {
      const res = await fetch(`/api/public/foztv/${playing.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && details) {
        setDetails((d) => d ? { ...d, userLiked: data.liked, likeCount: data.likeCount } : null)
      }
    } finally {
      setTogglingLike(false)
    }
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/foztv` : ''
    if (navigator.share && playing) {
      try {
        await navigator.share({
          title: playing.title,
          text: playing.description || playing.title,
          url
        })
      } catch {
        await navigator.clipboard.writeText(url)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playing || !user || !commentText.trim()) return
    setSendingComment(true)
    try {
      const res = await fetch(`/api/public/foztv/${playing.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() })
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setComments((c) => [...c, data.comment])
        setCommentText('')
      }
    } finally {
      setSendingComment(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent" />
      </main>
    )
  }

  if (videos.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-700 px-4">
        <Tv className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900">FozTV</h1>
        <p className="text-gray-500 text-center">Em breve: vídeos sobre Foz do Iguaçu.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="pt-6 pb-4 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">FozTV</h1>
          <p className="text-gray-600 text-sm mt-1">Vídeos sobre Foz do Iguaçu</p>
        </div>
      </section>

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
                  className="group text-left rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                >
                  <div className="relative aspect-video bg-gray-100">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Play className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <span className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {video.title}
                    </p>
                    {typeof video.likeCount === 'number' && (
                      <p className="text-xs text-gray-500 mt-1">{video.likeCount} curtida{video.likeCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Assistir vídeo"
          onClick={handleOverlayClick}
        >
          <div
            className="relative flex flex-col md:flex-row w-full max-w-5xl max-h-[90vh] my-auto bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vídeo à esquerda (ou em cima no mobile) */}
            <div className="relative flex-1 min-w-0 min-h-[200px] aspect-video md:aspect-auto md:min-h-0 bg-black">
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

            {/* Painel à direita (ou embaixo no mobile): título, ícones e comentários */}
            <div className="relative flex flex-col w-full md:w-[320px] lg:w-[360px] md:border-l border-t md:border-t-0 border-gray-200 max-h-[50vh] md:max-h-none min-h-0">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-4 pb-2 flex-shrink-0">
                <h2 className="text-base font-bold text-gray-900 pr-8 line-clamp-2">{playing.title}</h2>
                {playing.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{playing.description}</p>
                )}
              </div>

              {/* Ícones de ação (curtir, comentar, compartilhar) */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 flex-shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={togglingLike}
                    className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 rounded-lg transition-colors ${
                      details?.userLiked ? 'text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Curtir"
                  >
                    <Heart className={`w-6 h-6 ${details?.userLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{details?.likeCount ?? 0}</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-500">
                    <Heart className="w-6 h-6" />
                    <span className="text-xs">{details?.likeCount ?? 0}</span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">{comments.length}</span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Compartilhar"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-xs font-medium">Compartilhar</span>
                </button>
              </div>

              {/* Comentários */}
              <div className="flex flex-col flex-1 min-h-0 border-t border-gray-100">
                <h3 className="px-4 py-2 text-sm font-semibold text-gray-900 flex-shrink-0">
                  Comentários {comments.length > 0 && `(${comments.length})`}
                </h3>
                <ul className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0">
                  {comments.length === 0 ? (
                    <li className="text-sm text-gray-500 py-4">Nenhum comentário ainda.</li>
                  ) : (
                    comments.map((c) => (
                      <li key={c.id} className="text-sm">
                        <span className="font-medium text-gray-900">{c.user?.name || 'Usuário'}</span>
                        <span className="text-gray-600"> {c.body}</span>
                        <span className="text-gray-400 text-xs ml-1 block">{formatDate(c.createdAt)}</span>
                      </li>
                    ))
                  )}
                </ul>
                {user ? (
                  <form onSubmit={handleSubmitComment} className="p-4 pt-2 flex-shrink-0 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || sendingComment}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 flex-shrink-0"
                      >
                        Enviar
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-500 flex-shrink-0 border-t border-gray-100">
                    Faça login para comentar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
