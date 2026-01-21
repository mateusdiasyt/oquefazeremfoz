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
  ThumbsUp,
  Images,
  X
} from 'lucide-react'

// Ícone simplificado do WhatsApp
const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
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

interface GalleryItem {
  id: string
  imageUrl: string
  order: number
  createdAt: string
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
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  
  // Modal states
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showUnfollowModal, setShowUnfollowModal] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editingDescription, setEditingDescription] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [editingInfo, setEditingInfo] = useState(false)
  const [editAddress, setEditAddress] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editInstagram, setEditInstagram] = useState('')
  const [editFacebook, setEditFacebook] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')

  useEffect(() => {
    fetchBusinessData()
  }, [params.slug])

  useEffect(() => {
    if (user && business?.id) {
      updateFollowStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, business?.id])

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
      
      // Buscar galeria separadamente
      if (businessData.id) {
        const galleryResponse = await fetch(`/api/business/gallery?businessId=${businessData.id}`)
        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json()
          setGallery(galleryData.gallery || [])
        }
      }

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
      const response = await fetch('/api/business/description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription })
      })

      if (response.ok) {
        const data = await response.json()
        setBusiness(prev => prev ? { ...prev, description: newDescription } : null)
        setEditingDescription(false)
        showNotification('Descrição atualizada com sucesso!', 'success')
        // Recarregar dados da empresa
        fetchBusinessData()
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || 'Erro ao atualizar descrição', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error)
      showNotification('Erro ao atualizar descrição', 'error')
    }
  }

  const handleInfoUpdate = async () => {
    try {
      // Limpar e formatar número do WhatsApp (remover caracteres não numéricos)
      const cleanWhatsapp = editWhatsapp.replace(/\D/g, '')
      
      const response = await fetch('/api/business/info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: editAddress,
          phone: null, // Remover telefone, usar só WhatsApp
          website: editWebsite,
          instagram: editInstagram,
          facebook: editFacebook,
          whatsapp: cleanWhatsapp || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBusiness(prev => prev ? { ...prev, ...data.business } : null)
        setEditingInfo(false)
        showNotification('Informações atualizadas com sucesso!', 'success')
        // Recarregar dados da empresa
        fetchBusinessData()
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || 'Erro ao atualizar informações', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar informações', 'error')
    }
  }

  const startEditingInfo = () => {
    setEditAddress(business?.address || '')
    setEditWebsite(business?.website || '')
    setEditInstagram(business?.instagram || '')
    setEditFacebook(business?.facebook || '')
    setEditWhatsapp(business?.whatsapp || '')
    setEditingInfo(true)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !business?.id) return

    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('businessId', business.id)

      const response = await fetch('/api/business/gallery', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setGallery(prev => [...prev, data.galleryItem])
        showNotification('Foto adicionada à galeria com sucesso!', 'success')
        fetchBusinessData()
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || 'Erro ao adicionar foto', 'error')
      }
    } catch (error) {
      console.error('Erro ao adicionar foto à galeria:', error)
      showNotification('Erro ao adicionar foto à galeria', 'error')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleGalleryDelete = async (galleryId: string) => {
    if (!confirm('Tem certeza que deseja remover esta foto da galeria?')) return

    try {
      const response = await fetch(`/api/business/gallery?id=${galleryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGallery(prev => prev.filter(item => item.id !== galleryId))
        showNotification('Foto removida da galeria com sucesso!', 'success')
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || 'Erro ao remover foto', 'error')
      }
    } catch (error) {
      console.error('Erro ao remover foto da galeria:', error)
      showNotification('Erro ao remover foto da galeria', 'error')
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
    <div className="min-h-screen bg-white">
      {/* Cover Section */}
      <div className="relative h-64 md:h-80 overflow-hidden group">
        {business.coverImage ? (
          <img
            src={business.coverImage}
            alt={`Capa de ${business.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Camera className="text-white/30 w-12 h-12" />
          </div>
        )}
        {isOwner && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                
                const formData = new FormData()
                formData.append('cover', file)
                
                try {
                  const response = await fetch('/api/business/cover', {
                    method: 'POST',
                    body: formData
                  })
                  
                  if (response.ok) {
                    const data = await response.json()
                    setBusiness(prev => prev ? { ...prev, coverImage: data.coverImage } : null)
                    showNotification('Capa atualizada com sucesso!', 'success')
                  } else {
                    const error = await response.json()
                    showNotification(error.message || 'Erro ao atualizar capa', 'error')
                  }
                } catch (error) {
                  showNotification('Erro ao atualizar capa', 'error')
                }
              }}
            />
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Alterar Capa</span>
            </div>
          </label>
        )}
      </div>

      {/* Profile Section */}
      <div className="relative -mt-16 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image - agora na mesma linha do título */}
              <div className="relative group flex-shrink-0">
                {business.profileImage ? (
                  <img
                    src={business.profileImage}
                    alt={business.name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-md object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-purple-600" style={{ letterSpacing: '-0.02em' }}>
                      {business.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                {isOwner && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        const formData = new FormData()
                        formData.append('profilePhoto', file)
                        
                        try {
                          const response = await fetch('/api/business/profile-photo', {
                            method: 'POST',
                            body: formData
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            setBusiness(prev => prev ? { ...prev, profileImage: data.profileImage } : null)
                            showNotification('Foto de perfil atualizada com sucesso!', 'success')
                          } else {
                            const error = await response.json()
                            showNotification(error.message || 'Erro ao atualizar foto', 'error')
                          }
                        } catch (error) {
                          showNotification('Erro ao atualizar foto de perfil', 'error')
                        }
                      }}
                    />
                    <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </label>
                )}
              </div>

              {/* Business Info - foto e título na mesma linha */}
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{business.name}</h1>
                  {business.isVerified && (
                    <img 
                      src="/icons/verificado.png" 
                      alt="Verificado" 
                      className="w-6 h-6 md:w-7 md:h-7 object-contain"
                      title="Empresa verificada"
                    />
                  )}
                </div>
                <p className="text-base text-gray-600 mb-5" style={{ letterSpacing: '-0.01em' }}>{business.category}</p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-5">
                    <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-100"
                    >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>{business.followersCount || 0}</span>
                    <span className="text-sm text-gray-500">seguidores</span>
                    </button>
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>{business.averageRating || 0}</span>
                    <span className="text-sm text-gray-500">({reviews.length} avaliações)</span>
                      </div>
              </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>Informações de Contato</h3>
                    {isOwner && !editingInfo && (
                      <button
                        onClick={startEditingInfo}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Editar informações"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {editingInfo ? (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Ex: Avenida República Argentina, 1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          placeholder="Ex: https://www.example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Instagram</label>
                        <input
                          type="text"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          placeholder="Ex: @empresa ou empresa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Facebook</label>
                        <input
                          type="text"
                          value={editFacebook}
                          onChange={(e) => setEditFacebook(e.target.value)}
                          placeholder="Ex: empresa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          placeholder="Ex: 5545999999999 ou (45) 99999-9999 (será convertido automaticamente)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-300 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">O número será usado para criar um link direto do WhatsApp</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleInfoUpdate}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingInfo(false)
                            setEditAddress('')
                            setEditWebsite('')
                            setEditInstagram('')
                            setEditFacebook('')
                            setEditWhatsapp('')
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {business.address && (
                          <div className="flex items-center gap-2 text-gray-700 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="text-sm" style={{ letterSpacing: '-0.01em' }}>{business.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Social Links - Website, Instagram e WhatsApp */}
                      <div className="flex gap-2">
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                            title="Website"
                          >
                            <Globe className="w-5 h-5 text-purple-600" />
                          </a>
                        )}
                        {business.instagram && (
                          <a
                            href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 group relative"
                            title="Instagram"
                          >
                            <img 
                              src="/icons/instagram-icon.png" 
                              alt="Instagram" 
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                // Fallback para ícone SVG se a imagem não existir
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.parentElement?.querySelector('.instagram-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'block'
                              }}
                            />
                            <Instagram className="w-5 h-5 text-pink-600 absolute top-2.5 left-2.5 instagram-fallback hidden" />
                          </a>
                        )}
                        {business.facebook && (
                          <a
                            href={`https://facebook.com/${business.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                            title="Facebook"
                          >
                            <Facebook className="w-5 h-5 text-blue-600" />
                          </a>
                        )}
                        {business.whatsapp && (
                          <a
                            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group relative"
                            title="WhatsApp"
                          >
                            <img 
                              src="/icons/whatsapp-icon.png" 
                              alt="WhatsApp" 
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                // Fallback para ícone SVG se a imagem não existir
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.parentElement?.querySelector('.whatsapp-fallback') as HTMLElement
                                if (fallback) fallback.style.display = 'block'
                              }}
                            />
                            <WhatsAppIcon size={20} className="text-green-600 absolute top-2.5 left-2.5 whatsapp-fallback hidden" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
        </div>

              {/* Action Buttons */}
              {!isOwner && (
                <div className="flex flex-col gap-3">
                  {business?.isFollowing ? (
                    <button
                      onClick={() => setShowUnfollowModal(true)}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium shadow-sm"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Seguindo
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 font-medium shadow-md shadow-purple-500/20"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      <Plus className="w-4 h-4" />
                      Seguir
                    </button>
                  )}
                </div>
              )}
          </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {editingDescription ? (
                <div className="space-y-3">
                    <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 text-sm"
                    rows={4}
                    placeholder="Descreva sua empresa..."
                    style={{ letterSpacing: '-0.01em' }}
                  />
                  <div className="flex gap-2">
                      <button
                      onClick={handleDescriptionUpdate}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-sm shadow-sm shadow-purple-500/20"
                      style={{ letterSpacing: '-0.01em' }}
                      >
                        Salvar
                      </button>
                      <button
                                          onClick={() => {
                        setEditingDescription(false)
                        setNewDescription(business.description || '')
                                          }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                      style={{ letterSpacing: '-0.01em' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="flex items-start justify-between">
                  <p className="text-gray-700 leading-relaxed text-sm" style={{ letterSpacing: '-0.01em' }}>
                    {business.description || 'Sem descrição disponível.'}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    Posts
                  </h2>
                  {isOwner && (
                          <button
                      onClick={() => setShowPostForm(true)}
                      className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm shadow-purple-500/20"
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
                      <div key={post.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {business.profileImage ? (
                              <img
                                src={business.profileImage}
                                alt={business.name}
                                className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="w-11 h-11 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center border border-gray-100">
                                <span className="text-sm font-semibold text-purple-600" style={{ letterSpacing: '-0.01em' }}>
                                  {business.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-sm" style={{ letterSpacing: '-0.01em' }}>{business.name}</h3>
                                {business.isVerified && (
                                  <img 
                                    src="/icons/verificado.png" 
                                    alt="Verificado" 
                                    className="w-4 h-4 object-contain"
                                    title="Empresa verificada"
                                  />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {isOwner && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPost(post)
                                  setShowPostForm(true)
                                }}
                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Editar post"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-base" style={{ letterSpacing: '-0.01em' }}>{post.title}</h4>
                        {post.body && <p className="text-gray-700 mb-4 text-sm leading-relaxed" style={{ letterSpacing: '-0.01em' }}>{post.body}</p>}
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full h-auto object-cover rounded-2xl mb-4 border border-gray-100"
                          />
                        )}
                        {post.videoUrl && (
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-auto rounded-2xl mb-4 border border-gray-100"
                          />
                        )}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{post._count?.comment || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
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
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <Package className="w-5 h-5 text-purple-600" />
                    Produtos
                  </h3>
                          {isOwner && (
                            <button
                      onClick={() => {
                        setEditingProduct(null)
                        setShowProductForm(true)
                      }}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm shadow-purple-500/20"
                      title="Adicionar produto"
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
                      <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-colors group">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100">
                            <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm" style={{ letterSpacing: '-0.01em' }}>{product.name}</h4>
                          <p className="text-sm text-purple-600 font-semibold" style={{ letterSpacing: '-0.01em' }}>R$ {(product.priceCents / 100).toFixed(2)}</p>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowProductForm(true)
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
              )}
            </div>
              </div>
              
              {/* Coupons */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <Gift className="w-5 h-5 text-purple-600" />
                    Cupons
                  </h3>
                              {isOwner && (
                                  <button
                      onClick={() => setShowCouponForm(true)}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm shadow-purple-500/20"
                                  >
                      <Plus className="w-4 h-4" />
                                  </button>
                  )}
                          </div>
                <div className="space-y-3">
                  {coupons.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Nenhum cupom disponível.</p>
                  ) : (
                    coupons.slice(0, 3).map((coupon) => (
                      <div key={coupon.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl hover:border-purple-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-purple-800 text-sm" style={{ letterSpacing: '-0.01em' }}>{coupon.code}</span>
                          {coupon.discount && (
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">{coupon.discount}</span>
                          )}
                    </div>
                        <h5 className="font-semibold text-purple-900 text-sm mb-1" style={{ letterSpacing: '-0.01em' }}>{coupon.title}</h5>
                        <p className="text-sm text-gray-700" style={{ letterSpacing: '-0.01em' }}>{coupon.description}</p>
                      </div>
                    ))
                  )}
            </div>
          </div>

              {/* Gallery */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <Images className="w-5 h-5 text-purple-600" />
                    Galeria
                  </h3>
                  {isOwner && (
                    <label className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm shadow-purple-500/20 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                  )}
                </div>
                <div className="space-y-3">
                  {gallery.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Nenhuma foto na galeria ainda.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {gallery.map((item) => (
                        <div key={item.id} className="relative group">
                          <img
                            src={item.imageUrl}
                            alt="Galeria"
                            className="w-full h-24 object-cover rounded-xl border border-gray-100"
                          />
                          {isOwner && (
                            <button
                              onClick={() => handleGalleryDelete(item.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remover foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadingGallery && (
                    <p className="text-sm text-purple-600 text-center">Enviando foto...</p>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    Avaliações
                  </h3>
                  {business?.isFollowing && !userHasReviewed && (
                <button
                  onClick={() => setShowReviewForm(true)}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm shadow-purple-500/20"
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
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
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
                          <span className="text-sm font-medium text-gray-900" style={{ letterSpacing: '-0.01em' }}>{review.user?.name || review.user?.email || 'Usuário'}</span>
                            </div>
                        <p className="text-sm text-gray-600 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>{review.comment}</p>
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
          editProduct={editingProduct ? {
            id: editingProduct.id,
            name: editingProduct.name,
            description: (editingProduct as any).description || '',
            priceCents: editingProduct.priceCents,
            productUrl: (editingProduct as any).productUrl || '',
            imageUrl: editingProduct.imageUrl || ''
          } : undefined}
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
          editPost={editingPost ? {
            id: editingPost.id,
            title: editingPost.title,
            body: editingPost.body || '',
            imageUrl: editingPost.imageUrl || '',
            videoUrl: editingPost.videoUrl || ''
          } : undefined}
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
          <div className="bg-white border border-gray-100 rounded-3xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.01em' }}>Deixar de seguir</h3>
              <p className="text-gray-600 mb-6 text-sm" style={{ letterSpacing: '-0.01em' }}>
              Você realmente quer parar de seguir <span className="font-semibold text-gray-900">{business?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                onClick={handleUnfollow}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
                style={{ letterSpacing: '-0.01em' }}
                >
                Deixar de seguir
                </button>
                <button
                onClick={() => setShowUnfollowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                style={{ letterSpacing: '-0.01em' }}
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