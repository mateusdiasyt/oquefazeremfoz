'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getTimeAgo, capitalizeWords } from '../utils/formatters'
import UrlPreview from './UrlPreview'
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
  _count?: {
    comment?: number
    postlike?: number
  }
}

interface PostDetailModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
  onLike?: () => void
}

export default function PostDetailModal({ post, isOpen, onClose, onLike }: PostDetailModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [comments, setComments] = useState<any[]>([])
  const [commentsCount, setCommentsCount] = useState(post._count?.comment ?? 0)
  const [showComments, setShowComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [selectedCommentIdentity, setSelectedCommentIdentity] = useState<'user' | string>('user')
  const [userBusinesses, setUserBusinesses] = useState<Array<{ id: string; name: string; profileImage: string | null; slug: string | null }>>([])
  const [showCommentIdentityDropdown, setShowCommentIdentityDropdown] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const commentIdentityDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      checkIfLiked()
      fetchComments()
      // Buscar todas as empresas do usuário
      if (user?.roles?.includes('COMPANY')) {
        fetchUserBusinesses()
      }
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, post.id, user])

  useEffect(() => {
    // Definir padrão: se o post é de uma das empresas do usuário, comentar como essa empresa
    if (userBusinesses.length > 0 && post.business?.id) {
      const userOwnsPost = userBusinesses.some(b => b.id === post.business?.id)
      if (userOwnsPost) {
        setSelectedCommentIdentity(post.business.id)
      } else {
        setSelectedCommentIdentity('user')
      }
    }
  }, [userBusinesses, post.business?.id])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentIdentityDropdownRef.current && !commentIdentityDropdownRef.current.contains(event.target as Node)) {
        setShowCommentIdentityDropdown(false)
      }
    }

    if (showCommentIdentityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCommentIdentityDropdown])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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

  const fetchUserBusinesses = async () => {
    if (!user?.roles?.includes('COMPANY')) return
    
    try {
      const response = await fetch('/api/business/my-businesses')
      if (response.ok) {
        const data = await response.json()
        const businesses = data.businesses || []
        setUserBusinesses(businesses)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas do usuário:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/comments?postId=${post.id}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
        setCommentsCount(data.comments?.length || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }
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
        if (onLike) onLike()
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
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
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
          parentId: null,
          businessId: selectedCommentIdentity !== 'user' ? selectedCommentIdentity : null
        }),
      })

      if (response.ok) {
        setNewComment('')
        await fetchComments()
      }
    } catch (error) {
      console.error('Erro ao comentar:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const copyPostUrl = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    const url = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar URL:', error)
    }
  }

  if (!isOpen) return null

  const postUrl = `${window.location.origin}/post/${post.id}`
  const urlData = extractUrlsFromText(post.body || '')
  const urls = urlData.urls || []

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
              {post.business.profileImage ? (
                <img
                  src={post.business.profileImage}
                  alt={post.business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-semibold text-lg border-2 border-purple-200">
                  {post.business.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{capitalizeWords(post.business.name)}</h3>
                {post.business.isVerified && (
                  <img
                    src="/icons/verificado.png"
                    alt="Verificado"
                    className="w-5 h-5 object-contain"
                    title="Empresa verificada"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPostUrl}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Copiar link do post"
            >
              {urlCopied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>
            {post.body && (
              <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                {post.body.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            )}

            {/* URL Previews */}
            {urls.length > 0 && (
              <div className="space-y-3 mb-4">
                {urls.map((url, index) => (
                  <UrlPreview key={index} url={url} />
                ))}
              </div>
            )}

            {/* Image or Video */}
            {post.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            {post.videoUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full h-auto"
                >
                  Seu navegador não suporta vídeos.
                </video>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likesCount}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{commentsCount}</span>
              </button>
              <button
                onClick={copyPostUrl}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Compartilhar</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Comentários ({commentsCount})</h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum comentário ainda</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {(comment.user?.name || comment.business?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-2xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {comment.business?.name ? capitalizeWords(comment.business.name) : (comment.user?.name || 'Usuário')}
                            </span>
                            <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Form */}
              {user && (
                <div className="space-y-2">
                  {/* Seletor de identidade - apenas se usuário tem empresa */}
                  {userBusinesses.length > 0 && (
                    <div className="relative" ref={commentIdentityDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCommentIdentityDropdown(!showCommentIdentityDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm w-full text-left"
                      >
                        {selectedCommentIdentity === 'user' ? (
                          <>
                            <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-700 font-medium truncate">Comentar como {user?.name || 'Usuário'}</span>
                          </>
                        ) : (
                          (() => {
                            const selectedBusiness = userBusinesses.find(b => b.id === selectedCommentIdentity)
                            if (!selectedBusiness) return null
                            return (
                              <>
                                {selectedBusiness.profileImage ? (
                                  <img src={selectedBusiness.profileImage} alt={selectedBusiness.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-medium border border-purple-200 flex-shrink-0">
                                    {selectedBusiness.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-gray-700 font-medium truncate">Comentar como {selectedBusiness.name}</span>
                              </>
                            )
                          })()
                        )}
                        <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showCommentIdentityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCommentIdentityDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {/* Opção de comentar como usuário */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCommentIdentity('user')
                              setShowCommentIdentityDropdown(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              selectedCommentIdentity === 'user' ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-700 font-medium">{user?.name || 'Usuário'}</span>
                            {selectedCommentIdentity === 'user' && (
                              <svg className="w-4 h-4 text-purple-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          
                          {/* Opções de empresas */}
                          {userBusinesses.map((business) => (
                            <button
                              key={business.id}
                              type="button"
                              onClick={() => {
                                setSelectedCommentIdentity(business.id)
                                setShowCommentIdentityDropdown(false)
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                selectedCommentIdentity === business.id ? 'bg-purple-50' : ''
                              }`}
                            >
                              {business.profileImage ? (
                                <img src={business.profileImage} alt={business.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-medium border border-purple-200 flex-shrink-0">
                                  {business.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-gray-700 font-medium truncate">{business.name}</span>
                              {selectedCommentIdentity === business.id && (
                                <svg className="w-4 h-4 text-purple-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <form onSubmit={handleComment} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none text-sm"
                        disabled={commentLoading}
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || commentLoading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                      >
                        {commentLoading ? '...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
