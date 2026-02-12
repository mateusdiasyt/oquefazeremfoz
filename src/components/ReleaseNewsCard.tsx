'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Globe, Share2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ShareModal from './ShareModal'
import { capitalizeWords, getTimeAgo } from '@/utils/formatters'

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export interface ReleaseNewsCardRelease {
  id: string
  title: string
  slug: string
  lead: string | null
  body: string
  featuredImageUrl: string | null
  publishedAt: string | null
  createdAt: string
  likes?: number
  business: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
  }
}

interface ReleaseNewsCardProps {
  release: ReleaseNewsCardRelease
  baseUrl?: string
}

interface ReleaseCommentItem {
  id: string
  body: string
  createdAt: string
  user?: { id: string; name: string | null; email: string | null }
  business?: { id: string; name: string; profileImage: string | null; isVerified: boolean; slug?: string }
  replies?: ReleaseCommentItem[]
}

export default function ReleaseNewsCard({ release, baseUrl }: ReleaseNewsCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const releaseHref = `/empresa/${release.business.slug}/release/${release.slug}`
  const companyHref = `/empresa/${release.business.slug}`
  const [displayUrl, setDisplayUrl] = useState(baseUrl ? `${baseUrl.replace(/\/$/, '')}${releaseHref}` : releaseHref)
  const [domain, setDomain] = useState(baseUrl ? (() => { try { return new URL(baseUrl).host } catch { return 'Portal' } })() : 'Portal')
  const [showShareModal, setShowShareModal] = useState(false)
  const [fullReleaseUrl, setFullReleaseUrl] = useState('')

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(release.likes ?? 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<ReleaseCommentItem[]>([])
  const [commentsCount, setCommentsCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDisplayUrl(`${window.location.origin}${releaseHref}`)
      setDomain(window.location.host)
      setFullReleaseUrl(`${window.location.origin}${releaseHref}`)
    }
  }, [releaseHref])

  useEffect(() => {
    if (user) checkIfLiked()
  }, [user, release.id])

  useEffect(() => {
    if (showComments && comments.length === 0) fetchComments()
  }, [showComments])

  const checkIfLiked = async () => {
    if (!user) return
    try {
      const response = await fetch(`/api/releases/${release.id}/like`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch {
      // ignore
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    try {
      const response = await fetch(`/api/releases/${release.id}/like`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount ?? likesCount)
      }
    } catch {
      // ignore
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/releases/comments?releaseId=${release.id}`)
      if (response.ok) {
        const data = await response.json()
        const list = data.comments || []
        setComments(list)
        const total = list.length + list.reduce((acc: number, c: ReleaseCommentItem) => acc + (c.replies?.length || 0), 0)
        setCommentsCount(total)
      }
    } catch {
      setComments([])
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const response = await fetch('/api/releases/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: release.id, content: newComment.trim() })
      })
      if (response.ok) {
        setNewComment('')
        await fetchComments()
      } else {
        const err = await response.json()
        alert(err.message || 'Erro ao comentar')
      }
    } catch {
      alert('Erro ao comentar. Tente novamente.')
    } finally {
      setCommentLoading(false)
    }
  }

  const excerpt = release.lead || stripHtml(release.body).slice(0, 180) + (release.body.length > 180 ? '...' : '')

  return (
    <article className="bg-white border-b-2 border-gray-200 md:border md:border-gray-100 md:rounded-3xl md:shadow-sm hover:md:shadow-md transition-all duration-200 overflow-hidden p-4 md:p-6 mb-0 md:mb-6">
      {/* Cabeçalho */}
      <Link href={companyHref} className="flex items-start gap-3 pb-2 hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-purple-100">
          {release.business.profileImage ? (
            <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-sm">
              {release.business.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm" style={{ letterSpacing: '-0.01em' }}>
              {release.business.name}
            </span>
            {release.business.isVerified && (
              <img
                src="/icons/verificado.png"
                alt="Verificado"
                className="w-4 h-4 object-contain"
                title="Verificado"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(release.publishedAt || release.createdAt)}</p>
        </div>
      </Link>

      {/* Conteúdo do post: clique vai para o link da release */}
      <Link href={releaseHref} className="block">
        <div className="pb-3">
          <span className="text-sm text-blue-600 hover:underline break-all font-medium">{displayUrl}</span>
        </div>
        <div className="border-t border-gray-100 bg-white rounded-2xl overflow-hidden border border-gray-100">
          {release.featuredImageUrl && (
            <div className="relative w-full aspect-[16/10] bg-gray-200">
              <img
                src={release.featuredImageUrl}
                alt={release.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-base leading-snug mb-2" style={{ letterSpacing: '-0.01em' }}>
              {release.title}
            </h3>
            {excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3" style={{ letterSpacing: '-0.01em' }}>
                {excerpt}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{domain || 'Portal'}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Ações: mesmo estilo do PostCard (curtir, comentar, compartilhar) */}
      <div className="flex items-center space-x-6 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center space-x-1.5 transition-all duration-200 ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1.5 text-gray-500 hover:text-purple-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              router.push('/login')
              return
            }
            setShowShareModal(true)
          }}
          className="flex items-center space-x-1.5 text-gray-500 hover:text-purple-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span className="text-sm font-medium">Compartilhar</span>
        </button>
      </div>

      {/* Comentários (mesmo padrão do PostCard) */}
      {showComments && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <form onSubmit={handleComment} className="mb-5">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || commentLoading}
                className="px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {commentLoading ? '...' : 'Enviar'}
              </button>
            </div>
          </form>
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum comentário ainda.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {comment.business?.profileImage ? (
                      <img src={comment.business.profileImage} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-purple-600 font-medium text-sm border border-purple-200">
                        {(comment.business?.name || comment.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-900">
                        {comment.business?.name ? capitalizeWords(comment.business.name) : (comment.user?.name || 'Usuário')}
                      </span>
                      <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id}>
                            <p className="text-sm text-gray-700">{reply.body}</p>
                            <span className="text-xs text-gray-500">
                              {reply.business?.name || reply.user?.name || 'Usuário'} · {getTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={{
          id: release.id,
          title: release.title,
          business: { name: release.business.name, slug: release.business.slug }
        }}
        shareUrl={fullReleaseUrl || releaseHref}
      />
    </article>
  )
}
