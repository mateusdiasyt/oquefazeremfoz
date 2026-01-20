'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { useNotification } from '../../../../contexts/NotificationContext'
import ProductForm from '../../../../components/ProductForm'
import CouponForm from '../../../../components/CouponForm'
import ReviewForm from '../../../../components/ReviewForm'
import PostForm from '../../../../components/PostForm'
import FollowersModal from '../../../../components/FollowersModal'
import VerificationBadge from '../../../../components/VerificationBadge'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Edit3, 
  Trash2,
  Plus, 
  Star,
  Camera,
  ExternalLink,
  CheckCircle,
  Users,
  Package,
  Gift,
  MessageSquare,
  ThumbsUp
} from 'lucide-react'

// Ícone simplificado do WhatsApp
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <path d="M8 12h.01M12 12h.01M16 12h.01"/>
  </svg>
)

// Types
interface Business {
  id: string
  name: string
  category: string
  description?: string
  coverImage?: string
  profileImage?: string
  address?: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  followersCount: number
  averageRating: number
  isFollowing: boolean
  isVerified?: boolean
}

interface Post {
  id: string
  title: string
  body?: string
  imageUrl?: string
  videoUrl?: string
  likes: number
  createdAt: string
  isLiked: boolean
  _count?: {
    postlike?: number
    comment?: number
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Product {
  id: string
  name: string
  priceCents: number
  imageUrl?: string
}

interface Coupon {
  id: string
  code: string
  discount: string
  description: string
  title: string
}

export default function BusinessProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  
  // Modal states
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showUnfollowModal, setShowUnfollowModal] = useState(false)
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editingDescription, setEditingDescription] = useState(false)
  const [newDescription, setNewDescription] = useState('')

  useEffect(() => {
    fetchBusinessData()
  }, [params.slug])

  useEffect(() => {
    if (user && business?.id) {
      updateFollowStatus()
    }
  }, [user])

  const fetchBusinessData = async () => {
    try {
      setLoading(true)
      
      // Fetch all business data at once using public API
      const businessResponse = await fetch(`/api/public/empresa?slug=${params.slug}`)
      if (!businessResponse.ok) {
        throw new Error('Empresa não encontrada')
      }
      const businessData = await businessResponse.json()
      
      if (!businessData) {
        throw new Error('Empresa não encontrada')
      }
      
      // Check if user is following this business
      let isFollowing = false
      if (user && businessData.id) {
        try {
          const followResponse = await fetch(`/api/business/follow?businessId=${businessData.id}`)
          if (followResponse.ok) {
            const followData = await followResponse.json()
            isFollowing = followData.isFollowing
      }
    } catch (error) {
          console.log('Erro ao verificar status de follow:', error)
        }
      }
      
      setBusiness({ ...businessData, isFollowing })
      setNewDescription(businessData.description || '')
      
      // Set related data from the response
      // Mapear os dados corretamente
      if (businessData.post) setPosts(businessData.post)
      if (businessData.businessreview) setReviews(businessData.businessreview)
      if (businessData.businessproduct) setProducts(businessData.businessproduct.filter((p: any) => p.isActive !== false))
      if (businessData.businesscoupon) setCoupons(businessData.businesscoupon)

    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error)
      showNotification('Erro ao carregar dados da empresa', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateFollowStatus = async () => {
    if (!user || !business?.id) return
    
    try {
      const followResponse = await fetch(`/api/business/follow?businessId=${business.id}`)
      if (followResponse.ok) {
        const followData = await followResponse.json()
        setBusiness(prev => prev ? { ...prev, isFollowing: followData.isFollowing } : null)
      }
    } catch (error) {
      console.log('Erro ao atualizar status de follow:', error)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      showNotification('Faça login para seguir empresas', 'error')
      return
    }

    try {
      const response = await fetch('/api/business/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business?.id })
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(prev => prev ? {
          ...prev,
          isFollowing: result.isFollowing, 
          followersCount: result.followersCount 
        } : null)
        showNotification('Agora você está seguindo esta empresa!', 'success')
      }
    } catch (error) {
      showNotification('Erro ao seguir empresa', 'error')
    }
  }

  const handleUnfollow = async () => {
    try {
      const response = await fetch('/api/business/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business?.id })
      })

      if (response.ok) {
        const result = await response.json()
        setBusiness(prev => prev ? {
          ...prev,
          isFollowing: result.isFollowing, 
          followersCount: result.followersCount 
        } : null)
    setShowUnfollowModal(false)
        showNotification('Você parou de seguir esta empresa', 'success')
      }
    } catch (error) {
      showNotification('Erro ao deixar de seguir empresa', 'error')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('Post excluído com sucesso', 'success')
        fetchBusinessData()
      } else {
        showNotification('Erro ao excluir post', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      showNotification('Erro ao excluir post', 'error')
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) {
      showNotification('Faça login para curtir posts', 'error')
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        fetchBusinessData()
        showNotification(result.liked ? 'Post curtido!' : 'Post descurtido', 'success')
      } else {
        showNotification('Erro ao curtir post', 'error')
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error)
      showNotification('Erro ao curtir post', 'error')
    }
  }

  const handleCommentPost = async (postId: string) => {
    if (!user) {
      showNotification('Faça login para comentar', 'error')
      return
    }

    const comment = prompt('Digite seu comentário:')
    if (!comment?.trim()) {
      return
    }

    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: comment.trim() })
      })

      if (response.ok) {
        fetchBusinessData()
        showNotification('Comentário adicionado!', 'success')
      } else {
        showNotification('Erro ao comentar', 'error')
      }
    } catch (error) {
      console.error('Erro ao comentar:', error)
      showNotification('Erro ao comentar', 'error')
    }
  }

  const handleDescriptionUpdate = async () => {
    try {
      const response = await fetch(`/api/business/${business?.id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription })
      })

      if (response.ok) {
        setBusiness(prev => prev ? { ...prev, description: newDescription } : null)
        setEditingDescription(false)
        showNotification('Descrição atualizada com sucesso!', 'success')
      }
    } catch (error) {
      showNotification('Erro ao atualizar descrição', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Empresa não encontrada</h1>
          <p className="text-gray-600">A empresa que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    )
  }

  const isOwner = user?.businessId === business?.id;
  const userHasReviewed = reviews.some(review => review.userId === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Cover Section */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {business.coverImage ? (
          <img
            src={business.coverImage}
            alt={`Capa de ${business.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Camera className="text-white/50 w-16 h-16" />
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="relative -mt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                {business.profileImage ? (
                  <img
                    src={business.profileImage}
                    alt={business.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600">
                      {business.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                  {business.isVerified && (
                    <VerificationBadge size="lg" />
                  )}
                </div>
                <p className="text-gray-600 mb-4">{business.category}</p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4">
                    <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">{business.followersCount || 0}</span>
                    <span className="text-gray-500">seguidores</span>
                    </button>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-700">{business.averageRating || 0}</span>
                    <span className="text-gray-500">({reviews.length} avaliações)</span>
                      </div>
              </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {business.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{business.address}</span>
                      </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{business.phone}</span>
              </div>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.facebook && (
                    <a
                      href={`https://facebook.com/${business.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <WhatsAppIcon size={20} />
                    </a>
                  )}
          </div>
        </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!isOwner && (
                  <>
                    {business?.isFollowing ? (
                      <button
                        onClick={() => setShowUnfollowModal(true)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Seguindo
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Seguir
                      </button>
                    )}
                  </>
                )}
                
                            <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Seguidores
                        </button>
                      </div>
          </div>

            {/* Posts Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
                {isOwner && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Post
                  </button>
                )}
              </div>

              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          {post.body && (
                            <p className="text-gray-600 mb-4">{post.body}</p>
                          )}
                        </div>
                        {isOwner && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPost(post)
                                setShowPostForm(true)
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {post.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      )}

                      {post.videoUrl && (
                        <div className="mb-4">
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-gray-600">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1 ${post.isLiked ? 'text-blue-600' : 'hover:text-blue-600'} transition-colors`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post._count?.postlike || 0}</span>
                        </button>
                        <button
                          onClick={() => handleCommentPost(post.id)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post._count?.comment || 0}</span>
                        </button>
                        <span className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <p className="text-gray-500">Nenhum post ainda.</p>
                  {isOwner && (
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Primeiro Post
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {editingDescription ? (
                <div className="space-y-3">
                    <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Descreva sua empresa..."
                  />
                  <div className="flex gap-3">
                      <button
                      onClick={handleDescriptionUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                                          onClick={() => {
                        setEditingDescription(false)
                        setNewDescription(business.description || '')
                                          }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="flex items-start justify-between">
                  <p className="text-gray-700 leading-relaxed">
                    {business.description || 'Sem descrição disponível.'}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                                              </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
            </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Posts
                  </h2>
                  {isOwner && (
                          <button
                      onClick={() => setShowPostForm(true)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                      <Plus className="w-4 h-4" />
                          </button>
                          )}
                  </div>

                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum post ainda.</p>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {business.name?.charAt(0)?.toUpperCase()}
                              </span>
              </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{business.name}</h3>
                                {business.isVerified && (
                                  <VerificationBadge size="sm" />
              )}
            </div>
                              <p className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                              </p>
              </div>
            </div>
                {isOwner && (
                            <div className="flex gap-2">
                  <button
                                onClick={() => setEditingPost(post)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                  </button>
              </div>
                )}
                  </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                        {post.body && <p className="text-gray-700 mb-3">{post.body}</p>}
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full h-64 object-cover rounded-lg mb-3"
                          />
                        )}
                        {post.videoUrl && (
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-64 rounded-lg mb-3"
                          />
                        )}
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">0</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                          </div>
                    ))
            )}
          </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Produtos
                  </h3>
                          {isOwner && (
                            <button
                      onClick={() => setShowProductForm(true)}
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                      <Plus className="w-4 h-4" />
                            </button>
                  )}
                          </div>
                <div className="space-y-3">
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum produto cadastrado.</p>
                  ) : (
                    products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-green-600 font-semibold">R$ {(product.priceCents / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    ))
              )}
            </div>
              </div>
              
              {/* Coupons */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    Cupons
                  </h3>
                              {isOwner && (
                                  <button
                      onClick={() => setShowCouponForm(true)}
                      className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                  >
                      <Plus className="w-4 h-4" />
                                  </button>
                  )}
                          </div>
                <div className="space-y-3">
                  {coupons.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum cupom disponível.</p>
                  ) : (
                    coupons.slice(0, 3).map((coupon) => (
                      <div key={coupon.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-purple-800">{coupon.code}</span>
                          <span className="text-sm font-semibold text-purple-600">{coupon.discount} OFF</span>
                    </div>
                        <h5 className="font-semibold text-purple-900 text-sm mb-1">{coupon.title}</h5>
                        <p className="text-sm text-gray-700">{coupon.description}</p>
                      </div>
                    ))
                  )}
            </div>
          </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Avaliações
                  </h3>
                  {business?.isFollowing && !userHasReviewed && (
                <button
                  onClick={() => setShowReviewForm(true)}
                      className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                      <Plus className="w-4 h-4" />
                </button>
                    )}
                  </div>
                <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma avaliação ainda.</p>
                  ) : (
                    reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                                  />
                                ))}
                              </div>
                          <span className="text-sm font-medium text-gray-700">{review.user?.name || review.user?.email || 'Usuário'}</span>
                            </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                    ))
                  )}
                                    </div>
                                </div>
                            </div>
                          </div>
        </div>
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          businessId={business?.id || ''}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          onProductCreated={() => {
            fetchBusinessData()
            setShowProductForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {showCouponForm && (
        <CouponForm
          businessId={business?.id || ''}
          onClose={() => {
            setShowCouponForm(false)
            setEditingCoupon(null)
          }}
          onCouponCreated={() => {
            fetchBusinessData()
            setShowCouponForm(false)
            setEditingCoupon(null)
          }}
        />
      )}

      {showReviewForm && (
        <ReviewForm
          businessId={business?.id || ''}
          onClose={() => setShowReviewForm(false)}
          onReviewCreated={() => {
            fetchBusinessData()
            setShowReviewForm(false)
          }}
        />
      )}

      {showPostForm && (
        <PostForm
          businessId={business?.id || ''}
          onClose={() => {
            setShowPostForm(false)
            setEditingPost(null)
          }}
          onPostCreated={() => {
            fetchBusinessData()
            setShowPostForm(false)
            setEditingPost(null)
          }}
        />
      )}

      {showFollowersModal && (
        <FollowersModal
          isOpen={showFollowersModal}
          businessId={business?.id || ''}
          businessName={business?.name || ''}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {showUnfollowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Deixar de seguir</h3>
              <p className="text-gray-600 mb-6">
              Você realmente quer parar de seguir <span className="font-semibold text-gray-800">{business?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                onClick={handleUnfollow}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                Deixar de seguir
                </button>
                <button
                onClick={() => setShowUnfollowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                Cancelar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}