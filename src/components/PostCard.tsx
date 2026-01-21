'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import UrlPreview from './UrlPreview'
import ShareModal from './ShareModal'
import { extractUrlsFromText } from '../utils/urlDetector'

interface Post {
  id: string
  title: string
  body: string | null
  imageUrl: string | null
  videoUrl: string | null
  likes: number
  createdAt: string
  business: {
    id: string
    name: string
    isApproved: boolean
    profileImage: string | null
    isVerified: boolean
    slug: string | null
  }
  comments: Array<{
    id: string
    body: string
    createdAt: string
    user: {
      id: string
      name: string | null
    }
  }>
  postLikes: Array<{
    userId: string
  }>
  _count?: {
    comment?: number
    postlike?: number
  }
  commentsCount?: number
}

interface PostCardProps {
  post: Post
  onLike?: () => void
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(post.comments)
  const [commentsCount, setCommentsCount] = useState(
    post._count?.comment ?? post.commentsCount ?? post.comments?.length ?? 0
  )
  const [commentLoading, setCommentLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    // Verificar se o usuário curtiu o post
    checkIfLiked()
  }, [])

  const checkIfLiked = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error('Erro ao verificar like:', error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
        
        // Chamar callback se fornecido
        if (onLike) {
          onLike()
        }
      } else {
        console.error('Erro ao curtir post:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setCommentLoading(true)

    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId: post.id,
          content: newComment.trim()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Adicionar o novo comentário no início da lista
        if (data.comment) {
          setComments(prev => [data.comment, ...prev])
          setCommentsCount(prev => prev + 1)
          setNewComment('')
        } else {
          // Se não veio no formato esperado, recarregar os comentários
          await fetchComments()
          setNewComment('')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao comentar' }))
        console.error('Erro ao comentar:', errorData.message)
        alert(errorData.message || 'Erro ao comentar')
      }
    } catch (error) {
      console.error('Erro ao comentar:', error)
      alert('Erro ao comentar. Tente novamente.')
    } finally {
      setCommentLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/comments?postId=${post.id}`)
      if (response.ok) {
        const data = await response.json()
        const fetchedComments = data.comments || []
        setComments(fetchedComments)
        // Atualizar a contagem com o valor real quando os comentários são carregados
        setCommentsCount(fetchedComments.length)
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    }
  }

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
      {/* Header do post */}
      <div className="flex items-center space-x-3 mb-5">
        {/* Foto de perfil da empresa */}
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200">
          {post.business.profileImage ? (
            <img
              src={post.business.profileImage}
              alt={post.business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-base">
              {post.business.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <a
              href={post.business.slug ? `/empresa/${post.business.slug}` : `/empresa/${post.business.id}`}
              className="font-semibold text-gray-900 text-base hover:text-purple-600 transition-colors duration-200 cursor-pointer truncate"
              style={{ letterSpacing: '-0.01em' }}
            >
              {post.business.name}
            </a>
            {post.business.isVerified && (
              <img 
                src="/icons/verificado.png" 
                alt="Verificado" 
                className="w-5 h-5 object-contain"
                title="Empresa verificada"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>{post.title}</h2>
        {post.body && (
          <>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm mb-3" style={{ letterSpacing: '-0.01em' }}>
              {extractUrlsFromText(post.body).cleanText}
            </p>
            {extractUrlsFromText(post.body).urls.map((url, index) => (
              <UrlPreview key={index} url={url} />
            ))}
          </>
        )}
        {post.imageUrl && (
          <div className="mt-4">
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100" style={{ aspectRatio: '4/3' }}>
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        {post.videoUrl && (
          <div className="mt-4">
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100" style={{ aspectRatio: '4/3' }}>
              <video 
                src={post.videoUrl} 
                controls
                className="absolute inset-0 w-full h-full object-cover"
              >
                Seu navegador não suporta vídeos.
              </video>
            </div>
          </div>
        )}
      </div>

      {/* Ações do post */}
      <div className="flex items-center space-x-6 border-t border-gray-100 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1.5 transition-all duration-200 ${
            isLiked ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1.5 text-gray-500 hover:text-purple-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1.5 text-gray-500 hover:text-purple-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span className="text-sm font-medium">Compartilhar</span>
        </button>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          {/* Formulário de comentário minimalista */}
          <form onSubmit={handleComment} className="mb-5">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="w-full px-4 py-3 pr-12 border border-gray-200 bg-gray-50 rounded-2xl resize-none focus:ring-2 focus:ring-purple-200 focus:bg-white focus:border-purple-300 transition-all duration-200 text-sm placeholder-gray-400"
                    rows={2}
                    disabled={commentLoading}
                    style={{ letterSpacing: '-0.01em' }}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {commentLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Lista de comentários minimalista */}
          <div className="space-y-2.5">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm" style={{ letterSpacing: '-0.01em' }}>Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 group">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-medium text-xs">
                      {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-2.5 group-hover:bg-gray-100 transition-colors duration-200 border border-transparent group-hover:border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-xs" style={{ letterSpacing: '-0.01em' }}>
                          {comment.user.name || 'Usuário'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed" style={{ letterSpacing: '-0.01em' }}>
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={{
          id: post.id,
          title: post.title,
          business: {
            name: post.business.name,
            slug: post.business.slug || post.business.id
          }
        }}
      />
    </div>
  )
}