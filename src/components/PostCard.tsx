'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Heart, Edit3, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
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
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<any[]>(post.comments || [])
  const [commentsCount, setCommentsCount] = useState(
    post._count?.comment ?? post.commentsCount ?? post.comments?.length ?? 0
  )
  const [commentLoading, setCommentLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string } | null>(null)
  const [editingComment, setEditingComment] = useState<{ id: string; body: string; createdAt: string } | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [commentAsBusiness, setCommentAsBusiness] = useState(false) // false = pessoal, true = empresa
  const [userBusiness, setUserBusiness] = useState<{ id: string; name: string; profileImage: string | null } | null>(null)

  useEffect(() => {
    // Verificar se o usuário curtiu o post
    checkIfLiked()
    
    // Buscar informações da empresa do usuário
    if (user?.businessId) {
      fetchUserBusiness()
    }
    
    // Pré-carregar comentários em background para reduzir delay ao abrir
    if (post._count?.comment && post._count.comment > 0) {
      setTimeout(() => {
        if (comments.length === 0) {
          fetchComments()
        }
      }, 100)
    }
  }, [user])

  useEffect(() => {
    // Definir padrão: se o post é da própria empresa, comentar como empresa
    if (user?.businessId && post.business?.id === user.businessId) {
      setCommentAsBusiness(true)
    } else {
      setCommentAsBusiness(false)
    }
  }, [user?.businessId, post.business?.id])

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
          content: newComment.trim(),
          parentId: replyingTo?.id || null,
          businessId: commentAsBusiness && user?.businessId ? user.businessId : null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Limpar o formulário imediatamente
        setNewComment('')
        const wasReplying = !!replyingTo
        setReplyingTo(null)
        
        // Recarregar todos os comentários para garantir estrutura completa e evitar duplicações
        await fetchComments()
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

  const fetchUserBusiness = async () => {
    if (!user?.businessId) return
    
    try {
      const response = await fetch(`/api/business/profile`)
      if (response.ok) {
        const data = await response.json()
        if (data.business) {
          setUserBusiness({
            id: data.business.id,
            name: data.business.name,
            profileImage: data.business.profileImage
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar empresa do usuário:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/comments?postId=${post.id}`)
      if (response.ok) {
        const data = await response.json()
        const fetchedComments = data.comments || []
        
        // Deduplicar respostas em cada comentário
        const deduplicatedComments = fetchedComments.map((comment: any) => {
          if (comment.replies && comment.replies.length > 0) {
            // Usar Map para deduplicar por ID
            const uniqueReplies = new Map()
            comment.replies.forEach((reply: any) => {
              if (!uniqueReplies.has(reply.id)) {
                uniqueReplies.set(reply.id, reply)
              }
            })
            
            return {
              ...comment,
              replies: Array.from(uniqueReplies.values())
            }
          }
          return comment
        })
        
        setComments(deduplicatedComments)
        // Atualizar a contagem apenas com comentários principais (sem replies)
        const mainCommentsCount = deduplicatedComments.length
        setCommentsCount(mainCommentsCount)
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    }
  }

  const handleCommentLike = async (commentId: string, currentLikes: number, isCurrentlyLiked: boolean) => {
    try {
      const response = await fetch(`/api/posts/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar o comentário na lista
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              _count: { ...comment._count, commentlike: data.likesCount },
              commentlike: data.liked ? [{ id: 'temp' }] : [],
              isLiked: data.liked
            }
          }
          // Atualizar também nas respostas
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    _count: { ...reply._count, commentlike: data.likesCount },
                    commentlike: data.liked ? [{ id: 'temp' }] : [],
                    isLiked: data.liked
                  }
                }
                return reply
              })
            }
          }
          return comment
        }))
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const handleReply = (comment: any) => {
    const userName = comment.user?.name || comment.user?.email?.split('@')[0] || 'usuário'
    setReplyingTo({ id: comment.id, userName })
    setNewComment(`@${userName} `)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment('')
  }

  const handleEditComment = (comment: any) => {
    // Verificar se passou 5 minutos
    const commentAge = Date.now() - new Date(comment.createdAt).getTime()
    const fiveMinutes = 5 * 60 * 1000 // 5 minutos em milissegundos

    if (commentAge > fiveMinutes) {
      alert('Você só pode editar comentários dentro de 5 minutos após a criação')
      return
    }

    setEditingComment(comment)
    // Remover @ se houver no início (para respostas)
    const textWithoutAt = comment.body.replace(/^@\w+\s+/, '')
    setEditCommentText(textWithoutAt)
    setReplyingTo(null)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const handleSaveEdit = async () => {
    if (!editingComment || !editCommentText.trim()) return

    try {
      const response = await fetch('/api/posts/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: editingComment.id,
          content: editCommentText.trim()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar o comentário na lista
        setComments(prev => prev.map(comment => {
          if (comment.id === editingComment.id) {
            return {
              ...comment,
              body: data.comment.body,
              ...data.comment
            }
          }
          // Atualizar também nas respostas
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) => {
                if (reply.id === editingComment.id) {
                  return {
                    ...reply,
                    body: data.comment.body,
                    ...data.comment
                  }
                }
                return reply
              })
            }
          }
          return comment
        }))
        setEditingComment(null)
        setEditCommentText('')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Erro ao editar comentário')
      }
    } catch (error) {
      console.error('Erro ao editar comentário:', error)
      alert('Erro ao editar comentário')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return

    try {
      const response = await fetch(`/api/posts/comments?id=${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remover o comentário da lista
        setComments(prev => {
          // Verificar se é um comentário principal ou resposta
          let found = false
          const updatedComments = prev.map(comment => {
            if (comment.id === commentId) {
              found = true
              return null // Marcar para remover
            }
            // Verificar nas respostas
            if (comment.replies) {
              const updatedReplies = comment.replies.filter((reply: any) => reply.id !== commentId)
              if (updatedReplies.length !== comment.replies.length) {
                found = true
                return {
                  ...comment,
                  replies: updatedReplies,
                  _count: {
                    ...comment._count,
                    replies: (comment._count?.replies || 0) - 1
                  }
                }
              }
            }
            return comment
          })

          // Filtrar comentários removidos
          const filtered = updatedComments.filter(c => c !== null)
          
          // Atualizar contagem apenas se for comentário principal
          if (found) {
            setCommentsCount(prev => Math.max(0, prev - 1))
          }

          return filtered
        })
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Erro ao excluir comentário')
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
      alert('Erro ao excluir comentário')
    }
  }

  const canEditComment = (comment: any) => {
    if (!user) return false
    // Verificar se o usuário é dono (como usuário ou como empresa)
    const isOwner = comment.userId === user.id || comment.businessId === user.businessId
    if (!isOwner) return false
    const commentAge = Date.now() - new Date(comment.createdAt).getTime()
    const fiveMinutes = 5 * 60 * 1000
    return commentAge <= fiveMinutes
  }

  // Pré-carregar comentários quando o componente é montado
  useEffect(() => {
    // Se não há comentários carregados ainda, carregar imediatamente
    if (comments.length === 0 && post._count?.comment && post._count.comment > 0) {
      fetchComments()
    }
  }, [])

  // Atualizar comentários quando showComments muda para true
  useEffect(() => {
    if (showComments) {
      // Se já temos comentários, não precisa recarregar a menos que sejam muito antigos
      // Recarregar apenas se não temos comentários ou se o usuário explicitamente abriu
      if (comments.length === 0) {
        fetchComments()
      }
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
    <div className="bg-white border-b-2 border-gray-200 md:border md:border-gray-100 md:rounded-3xl md:shadow-sm hover:md:shadow-md transition-all duration-200 p-4 md:p-6 mb-0 md:mb-6">
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
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
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
                  {replyingTo && (
                    <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-purple-700">
                        Respondendo a <strong>{replyingTo.userName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={cancelReply}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {/* Seletor de identidade - apenas se usuário tem empresa */}
                  {user?.businessId && userBusiness && (
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCommentAsBusiness(!commentAsBusiness)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm"
                      >
                        {commentAsBusiness ? (
                          <>
                            {userBusiness.profileImage ? (
                              <img src={userBusiness.profileImage} alt={userBusiness.name} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {userBusiness.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-gray-700 font-medium">Comentar como {userBusiness.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-700 font-medium">Comentar como {user?.name || 'Usuário'}</span>
                          </>
                        )}
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyingTo ? `Responder ${replyingTo.userName}...` : "Adicione um comentário..."}
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
              comments.map((comment) => {
                const likesCount = comment._count?.commentlike || 0
                const isLiked = comment.commentlike && comment.commentlike.length > 0
                const replies = comment.replies || []

                return (
                  <div key={comment.id}>
                    <div className="flex space-x-3 group">
                      <div className="flex-shrink-0">
                        {/* Avatar: mostrar empresa se businessId estiver presente, senão usuário */}
                        {comment.business ? (
                          comment.business.profileImage ? (
                            <img src={comment.business.profileImage} alt={comment.business.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-medium text-xs">
                              {comment.business.name.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-medium text-xs">
                            {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-2xl px-4 py-2.5 group-hover:bg-gray-100 transition-colors duration-200 border border-transparent group-hover:border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-xs" style={{ letterSpacing: '-0.01em' }}>
                          {comment.business?.name || comment.user?.name || comment.user?.email || 'Usuário'}
                        </span>
                        {comment.business?.isVerified && (
                          <img src="/icons/verificado.png" alt="Verificado" className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      {/* Modo de edição ou visualização */}
                      {editingComment && editingComment.id === comment.id ? (
                        <div className="mb-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 bg-white rounded-xl resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 text-sm"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={!editCommentText.trim()}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm leading-relaxed mb-2" style={{ letterSpacing: '-0.01em' }}>
                          {comment.body}
                        </p>
                      )}
                          {/* Ações do comentário */}
                          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleCommentLike(comment.id, likesCount, isLiked)}
                              className={`flex items-center gap-1.5 text-xs transition-colors ${
                                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                              <span>{likesCount}</span>
                            </button>
                            <button
                              onClick={() => handleReply(comment)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              <span>Responder</span>
                            </button>
                            {/* Botões de editar/excluir apenas para o dono do comentário (usuário ou empresa) */}
                            {user && ((comment.userId === user.id) || (comment.businessId === user.businessId)) && (
                              <>
                                {canEditComment(comment) && (
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Editar</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Excluir</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Respostas */}
                    {replies.length > 0 && (
                      <div className="ml-11 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                        {(() => {
                          console.log(`🖼️ [RENDER] Renderizando ${replies.length} respostas para comentário ${comment.id}`)
                          const uniqueReplies = Array.from(new Map(replies.map((r: any) => [r.id, r])).values())
                          if (uniqueReplies.length !== replies.length) {
                            console.log(`⚠️ [RENDER] DUPLICATAS ENCONTRADAS NA RENDERIZAÇÃO! ${replies.length} → ${uniqueReplies.length}`)
                            console.log('   IDs originais:', replies.map((r: any) => r.id))
                            console.log('   IDs únicos:', uniqueReplies.map((r: any) => r.id))
                          }
                          return uniqueReplies.map((reply: any) => {
                          const replyLikesCount = reply._count?.commentlike || 0
                          const replyIsLiked = reply.commentlike && reply.commentlike.length > 0

                          return (
                            <div key={reply.id} className="flex space-x-3 group">
                              <div className="flex-shrink-0">
                                {/* Avatar: mostrar empresa se businessId estiver presente, senão usuário */}
                                {reply.business ? (
                                  reply.business.profileImage ? (
                                    <img src={reply.business.profileImage} alt={reply.business.name} className="w-6 h-6 rounded-lg object-cover border border-gray-100" />
                                  ) : (
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium text-xs">
                                      {reply.business.name.charAt(0).toUpperCase()}
                                    </div>
                                  )
                                ) : (
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium text-xs">
                                    {reply.user?.name ? reply.user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-xl px-3 py-2 group-hover:bg-gray-100 transition-colors duration-200 border border-transparent group-hover:border-gray-200">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 text-xs" style={{ letterSpacing: '-0.01em' }}>
                                      {reply.business?.name || reply.user?.name || reply.user?.email || 'Usuário'}
                                    </span>
                                    {reply.business?.isVerified && (
                                      <img src="/icons/verificado.png" alt="Verificado" className="w-3.5 h-3.5 object-contain" />
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  {/* Modo de edição ou visualização da resposta */}
                                  {editingComment && editingComment.id === reply.id ? (
                                    <div className="mb-2">
                                      <textarea
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                        className="w-full px-3 py-2 border border-purple-300 bg-white rounded-xl resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 text-xs"
                                        rows={2}
                                        autoFocus
                                      />
                                      <div className="flex items-center gap-2 mt-2">
                                        <button
                                          onClick={handleSaveEdit}
                                          disabled={!editCommentText.trim()}
                                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                          Salvar
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-gray-700 text-xs leading-relaxed mb-2" style={{ letterSpacing: '-0.01em' }}>
                                        {reply.body}
                                      </p>
                                      {/* Ações da resposta */}
                                      <div className="flex items-center gap-4 mt-1.5 pt-1.5 border-t border-gray-200">
                                        <button
                                          onClick={() => handleCommentLike(reply.id, replyLikesCount, replyIsLiked)}
                                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                                            replyIsLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                          }`}
                                        >
                                          <Heart className={`w-3.5 h-3.5 ${replyIsLiked ? 'fill-current' : ''}`} />
                                          <span>{replyLikesCount}</span>
                                        </button>
                                        <button
                                          onClick={() => handleReply(reply)}
                                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                          </svg>
                                          <span>Responder</span>
                                        </button>
                                        {/* Botões de editar/excluir apenas para o dono da resposta (usuário ou empresa) */}
                                        {user && ((reply.userId === user.id) || (reply.businessId === user.businessId)) && (
                                          <>
                                            {canEditComment(reply) && (
                                              <button
                                                onClick={() => handleEditComment(reply)}
                                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                                              >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Editar</span>
                                              </button>
                                            )}
                                            <button
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Excluir</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                        })()}
                      </div>
                    )}
                  </div>
                )
              })
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