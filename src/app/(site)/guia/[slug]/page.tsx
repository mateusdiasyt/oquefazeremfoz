'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { useNotification } from '../../../../contexts/NotificationContext'
import { capitalizeWords } from '../../../../utils/formatters'
import { 
  Phone, 
  Globe, 
  Instagram, 
  Facebook,
  Mail,
  Star,
  Users,
  Award,
  Languages,
  ArrowLeft,
  Camera,
  Edit3,
  X,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2
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

interface Guide {
  id: string
  name: string
  slug?: string | null
  description?: string
  specialties?: string | null
  languages?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  instagram?: string | null
  facebook?: string | null
  website?: string | null
  presentationVideo?: string | null
  profileImage?: string | null
  coverImage?: string | null
  ratingAvg: number
  ratingCount: number
  followersCount: number
  isVerified?: boolean
  isApproved?: boolean
  userId: string
}

interface Review {
  id: string
  rating: number
  comment?: string
  imageUrl?: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface GalleryItem {
  id: string
  imageUrl: string
  order: number
}

interface Post {
  id: string
  title: string
  body?: string
  imageUrl?: string
  videoUrl?: string
  likes: number
  createdAt: string
}

type Tab = 'sobre' | 'galeria' | 'avaliacoes' | 'posts' | 'contato'

export default function GuideProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('sobre')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowingLoading, setIsFollowingLoading] = useState(false)
  
  // Estados de edição
  const [editingDescription, setEditingDescription] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [editingInfo, setEditingInfo] = useState(false)
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editSpecialties, setEditSpecialties] = useState('')
  const [editLanguages, setEditLanguages] = useState('')
  
  // Estados de modais
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showGalleryPreview, setShowGalleryPreview] = useState(false)
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  
  // Estados de post
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [postImageFile, setPostImageFile] = useState<File | null>(null)
  const [postVideoFile, setPostVideoFile] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null)
  const [uploadingPost, setUploadingPost] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchGuideData()
    }
  }, [params.slug, user])

  useEffect(() => {
    if (guide?.id) {
      fetchReviews()
      fetchGallery()
      fetchPosts()
      checkFollowing()
    }
  }, [guide?.id])

  const fetchGuideData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/guide/${params.slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          showNotification('Guia não encontrado', 'error')
          router.push('/guias')
          return
        }
        throw new Error('Erro ao carregar guia')
      }

      const guideData = await response.json()
      setGuide(guideData)
      setNewDescription(guideData.description || '')
    } catch (error) {
      console.error('Erro ao carregar dados do guia:', error)
      showNotification('Erro ao carregar dados do guia', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!guide?.id) return
    try {
      const response = await fetch(`/api/guide/reviews?guideId=${guide.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
    }
  }

  const fetchGallery = async () => {
    if (!guide?.id) return
    try {
      const response = await fetch(`/api/guide/gallery?guideId=${guide.id}`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error('Erro ao buscar galeria:', error)
    }
  }

  const fetchPosts = async () => {
    if (!guide?.id) return
    try {
      const response = await fetch(`/api/guide/posts?guideId=${guide.id}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    }
  }

  const checkFollowing = async () => {
    if (!guide?.id || !user) return
    try {
      const response = await fetch(`/api/guide/follow?guideId=${guide.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      }
    } catch (error) {
      console.error('Erro ao verificar follow:', error)
    }
  }

  const handleFollow = async () => {
    if (!guide?.id || !user) {
      showNotification('Faça login para seguir este guia', 'error')
      return
    }

    setIsFollowingLoading(true)
    try {
      const response = await fetch('/api/guide/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: guide.id })
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
        await fetchGuideData()
        showNotification(data.message, 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao seguir guia', 'error')
      }
    } catch (error) {
      showNotification('Erro ao seguir guia', 'error')
    } finally {
      setIsFollowingLoading(false)
    }
  }

  const handleUpdateDescription = async () => {
    if (!guide?.id) return
    try {
      const response = await fetch(`/api/guide/info?id=${guide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription })
      })

      if (response.ok) {
        const data = await response.json()
        setGuide(prev => prev ? { ...prev, description: newDescription } : null)
        setEditingDescription(false)
        showNotification('Descrição atualizada com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao atualizar descrição', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar descrição', 'error')
    }
  }

  const handleUpdateInfo = async () => {
    if (!guide?.id) return
    try {
      const cleanWhatsapp = editWhatsapp.replace(/\D/g, '')
      
      const response = await fetch(`/api/guide/info?id=${guide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: cleanWhatsapp || null,
          website: editWebsite || null,
          specialties: editSpecialties || null,
          languages: editLanguages || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGuide(prev => prev ? { ...prev, ...data.guide } : null)
        setEditingInfo(false)
        showNotification('Informações atualizadas com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao atualizar informações', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar informações', 'error')
    }
  }

  const startEditingInfo = () => {
    setEditWhatsapp(guide?.whatsapp || '')
    setEditWebsite(guide?.website || '')
    setEditSpecialties(guide?.specialties || '')
    setEditLanguages(guide?.languages || '')
    setEditingInfo(true)
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !guide?.id) return

    const formData = new FormData()
    formData.append('profilePhoto', file)
    formData.append('guideId', guide.id)

    try {
      const response = await fetch('/api/guide/profile-photo', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setGuide(prev => prev ? { ...prev, profileImage: data.profileImage } : null)
        showNotification('Foto de perfil atualizada com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao atualizar foto', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar foto de perfil', 'error')
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !guide?.id) return

    const formData = new FormData()
    formData.append('cover', file)
    formData.append('guideId', guide.id)

    try {
      const response = await fetch('/api/guide/cover', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setGuide(prev => prev ? { ...prev, coverImage: data.coverImage } : null)
        showNotification('Capa atualizada com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao atualizar capa', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar capa', 'error')
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !guide?.id) return

    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('guideId', guide.id)

      const response = await fetch('/api/guide/gallery', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setGallery(prev => [...prev, data.galleryItem])
        showNotification('Foto adicionada à galeria com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao adicionar foto', 'error')
      }
    } catch (error) {
      showNotification('Erro ao adicionar foto à galeria', 'error')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleGalleryDelete = async (galleryId: string) => {
    if (!confirm('Tem certeza que deseja remover esta foto da galeria?')) return

    try {
      const response = await fetch(`/api/guide/gallery?id=${galleryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGallery(prev => prev.filter(item => item.id !== galleryId))
        showNotification('Foto removida da galeria com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao remover foto', 'error')
      }
    } catch (error) {
      showNotification('Erro ao remover foto da galeria', 'error')
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guide?.id || !postTitle.trim()) return

    setUploadingPost(true)
    try {
      const formData = new FormData()
      formData.append('guideId', guide.id)
      formData.append('title', postTitle)
      formData.append('body', postBody)
      if (postImageFile) formData.append('image', postImageFile)
      if (postVideoFile) formData.append('video', postVideoFile)

      const response = await fetch('/api/guide/posts', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(prev => [data.post, ...prev])
        setPostTitle('')
        setPostBody('')
        setPostImageFile(null)
        setPostVideoFile(null)
        setPostImagePreview(null)
        setPostVideoPreview(null)
        setShowPostForm(false)
        showNotification('Post criado com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao criar post', 'error')
      }
    } catch (error) {
      showNotification('Erro ao criar post', 'error')
    } finally {
      setUploadingPost(false)
    }
  }

  const handlePostDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return

    try {
      const response = await fetch(`/api/guide/posts?postId=${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
        showNotification('Post deletado com sucesso!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao deletar post', 'error')
      }
    } catch (error) {
      showNotification('Erro ao deletar post', 'error')
    }
  }

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }
    
    return null
  }

  const isOwner = user && guide && guide.userId === user.id
  const embedUrl = getYouTubeEmbedUrl(guide?.presentationVideo)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Guia não encontrado</h1>
          <button
            onClick={() => router.push('/guias')}
            className="text-purple-600 hover:text-purple-700"
          >
            Voltar para lista de guias
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com imagem de capa */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-600 to-pink-600 group">
        {guide.coverImage && (
          <img
            src={guide.coverImage}
            alt={guide.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Botão voltar */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push('/guias')}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Botão editar capa (apenas para dono) */}
        {isOwner && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Alterar Capa</span>
            </div>
          </label>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Card principal com perfil */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Imagem de perfil */}
            <div className="relative flex-shrink-0 group">
              {guide.profileImage ? (
                <img
                  src={guide.profileImage}
                  alt={guide.name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-purple-600">
                    {guide.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {guide.isVerified && (
                <div className="absolute -bottom-2 -right-2">
                  <img src="/icons/verificado.png" alt="Verificado" className="w-8 h-8" />
                </div>
              )}
              {isOwner && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoUpload}
                  />
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </label>
              )}
            </div>

            {/* Informações principais */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {capitalizeWords(guide.name)}
                </h1>
              </div>

              {/* Estatísticas */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-gray-900">
                    {guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : 'Novo'}
                  </span>
                  {guide.ratingCount > 0 && (
                    <span className="text-sm text-gray-500">({guide.ratingCount} avaliações)</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="text-lg font-semibold">{guide.followersCount}</span>
                  <span className="text-sm">seguidores</span>
                </div>
              </div>

              {/* Botão seguir */}
              {!isOwner && user && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors mb-4 ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  } disabled:opacity-50`}
                >
                  {isFollowingLoading ? 'Carregando...' : isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              )}

              {/* Especialidades */}
              {guide.specialties && (
                <div className="flex items-start gap-2 mb-3">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Especialidades:</span>
                    <p className="text-sm text-gray-600">{guide.specialties}</p>
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {guide.languages && (
                <div className="flex items-start gap-2 mb-4">
                  <Languages className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Idiomas:</span>
                    <p className="text-sm text-gray-600">{guide.languages}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="bg-white rounded-3xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['sobre', 'galeria', 'avaliacoes', 'posts', 'contato'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'sobre' && 'Sobre'}
                  {tab === 'galeria' && 'Galeria'}
                  {tab === 'avaliacoes' && `Avaliações (${reviews.length})`}
                  {tab === 'posts' && `Posts (${posts.length})`}
                  {tab === 'contato' && 'Contato'}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo das abas */}
          <div className="p-8">
            {/* Aba Sobre */}
            {activeTab === 'sobre' && (
              <div className="space-y-6">
                {/* Descrição */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Descrição</h3>
                    {isOwner && !editingDescription && (
                      <button
                        onClick={() => setEditingDescription(true)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div className="space-y-2">
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Descreva sobre você..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateDescription}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingDescription(false)
                            setNewDescription(guide.description || '')
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {guide.description || 'Nenhuma descrição disponível.'}
                    </p>
                  )}
                </div>

                {/* Vídeo de apresentação */}
                {embedUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vídeo de Apresentação</h3>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full rounded-2xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Informações editáveis */}
                {isOwner && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Informações</h3>
                      {!editingInfo && (
                        <button
                          onClick={startEditingInfo}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {editingInfo ? (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp</label>
                          <input
                            type="text"
                            value={editWhatsapp}
                            onChange={(e) => setEditWhatsapp(e.target.value)}
                            placeholder="Ex: 5545999999999"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                          <input
                            type="url"
                            value={editWebsite}
                            onChange={(e) => setEditWebsite(e.target.value)}
                            placeholder="Ex: https://www.example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Especialidades</label>
                          <input
                            type="text"
                            value={editSpecialties}
                            onChange={(e) => setEditSpecialties(e.target.value)}
                            placeholder="Ex: Cataratas, Aventura, História"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Idiomas</label>
                          <input
                            type="text"
                            value={editLanguages}
                            onChange={(e) => setEditLanguages(e.target.value)}
                            placeholder="Ex: Português, Inglês, Espanhol"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateInfo}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingInfo(false)
                              startEditingInfo()
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-gray-700">
                        {guide.specialties && (
                          <div>
                            <span className="font-semibold">Especialidades: </span>
                            {guide.specialties}
                          </div>
                        )}
                        {guide.languages && (
                          <div>
                            <span className="font-semibold">Idiomas: </span>
                            {guide.languages}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Aba Galeria */}
            {activeTab === 'galeria' && (
              <div>
                {isOwner && (
                  <div className="mb-6">
                    <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                  </div>
                )}
                {gallery.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma foto na galeria ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item, index) => (
                      <div key={item.id} className="relative group">
                        <img
                          src={item.imageUrl}
                          alt={`Galeria ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedGalleryIndex(index)
                            setShowGalleryPreview(true)
                          }}
                        />
                        {isOwner && (
                          <button
                            onClick={() => handleGalleryDelete(item.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba Avaliações */}
            {activeTab === 'avaliacoes' && (
              <div>
                {!isOwner && user && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Avaliar Guia
                    </button>
                  </div>
                )}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma avaliação ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {review.user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{review.user.name}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                            )}
                            {review.imageUrl && (
                              <img
                                src={review.imageUrl}
                                alt="Avaliação"
                                className="w-full max-w-md rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba Posts */}
            {activeTab === 'posts' && (
              <div>
                {isOwner && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Criar Post
                    </button>
                  </div>
                )}
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum post ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handlePostDelete(post.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {post.body && <p className="text-gray-700 mb-4">{post.body}</p>}
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full rounded-lg mb-4"
                          />
                        )}
                        {post.videoUrl && (
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-center gap-4 text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba Contato */}
            {activeTab === 'contato' && (
              <div className="space-y-4">
                {guide.whatsapp && (
                  <a
                    href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <WhatsAppIcon size={24} />
                    <span className="font-medium">WhatsApp</span>
                  </a>
                )}
                {guide.phone && (
                  <a
                    href={`tel:${guide.phone}`}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">{guide.phone}</span>
                  </a>
                )}
                {guide.email && (
                  <a
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">{guide.email}</span>
                  </a>
                )}
                {guide.instagram && (
                  <a
                    href={`https://instagram.com/${guide.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="font-medium">Instagram</span>
                  </a>
                )}
                {guide.facebook && (
                  <a
                    href={guide.facebook.startsWith('http') ? guide.facebook : `https://facebook.com/${guide.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="font-medium">Facebook</span>
                  </a>
                )}
                {guide.website && (
                  <a
                    href={guide.website.startsWith('http') ? guide.website : `https://${guide.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Website</span>
                  </a>
                )}
                {!guide.whatsapp && !guide.phone && !guide.email && !guide.instagram && !guide.facebook && !guide.website && (
                  <p className="text-gray-500 text-center py-8">Nenhuma informação de contato disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem se não estiver aprovado */}
        {!guide.isApproved && isOwner && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <p className="text-amber-800">
              <strong>Atenção:</strong> Seu perfil está aguardando aprovação. Você poderá visualizar todas as informações assim que for aprovado.
            </p>
          </div>
        )}
      </div>

      {/* Modal de preview da galeria */}
      {showGalleryPreview && gallery.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGalleryPreview(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={gallery[selectedGalleryIndex].imageUrl}
            alt={`Galeria ${selectedGalleryIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedGalleryIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedGalleryIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de formulário de avaliação */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Avaliar Guia</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                formData.append('guideId', guide.id)
                
                try {
                  const response = await fetch('/api/guide/reviews', {
                    method: 'POST',
                    body: formData
                  })
                  
                  if (response.ok) {
                    showNotification('Avaliação criada com sucesso!', 'success')
                    setShowReviewForm(false)
                    await fetchReviews()
                    await fetchGuideData()
                  } else {
                    const error = await response.json()
                    showNotification(error.message || 'Erro ao criar avaliação', 'error')
                  }
                } catch (error) {
                  showNotification('Erro ao criar avaliação', 'error')
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação</label>
                  <select
                    name="rating"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="5">5 Estrelas</option>
                    <option value="4">4 Estrelas</option>
                    <option value="3">3 Estrelas</option>
                    <option value="2">2 Estrelas</option>
                    <option value="1">1 Estrela</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comentário</label>
                  <textarea
                    name="comment"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Deixe seu comentário..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto (opcional)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Enviar Avaliação
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de formulário de post */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Criar Post</h3>
              <button
                onClick={() => setShowPostForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Título do post..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                  <textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Escreva seu post..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagem (opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPostImageFile(file)
                        const reader = new FileReader()
                        reader.onload = (e) => setPostImagePreview(e.target?.result as string)
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {postImagePreview && (
                    <img src={postImagePreview} alt="Preview" className="mt-2 w-full max-w-md rounded-lg" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo (opcional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPostVideoFile(file)
                        const reader = new FileReader()
                        reader.onload = (e) => setPostVideoPreview(e.target?.result as string)
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {postVideoPreview && (
                    <video src={postVideoPreview} controls className="mt-2 w-full max-w-md rounded-lg" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploadingPost}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {uploadingPost ? 'Publicando...' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
