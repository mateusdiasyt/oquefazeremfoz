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
  ArrowLeft,
  Camera,
  Edit3,
  X,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Plus,
  Trash2,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const WhatsAppIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
  user: { id: string; name: string; email: string }
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

const TAB_LABELS: Record<Tab, string> = {
  sobre: 'Sobre',
  galeria: 'Galeria',
  avaliacoes: 'Avaliações',
  posts: 'Posts',
  contato: 'Contato',
}

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

  const [editingDescription, setEditingDescription] = useState(false)
  const [newDescription, setNewDescription] = useState('')
  const [editingInfo, setEditingInfo] = useState(false)
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editWebsite, setEditWebsite] = useState('')
  const [editSpecialties, setEditSpecialties] = useState('')
  const [editLanguages, setEditLanguages] = useState('')

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showGalleryPreview, setShowGalleryPreview] = useState(false)
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)

  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [postImageFile, setPostImageFile] = useState<File | null>(null)
  const [postVideoFile, setPostVideoFile] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null)
  const [uploadingPost, setUploadingPost] = useState(false)

  useEffect(() => {
    if (params.slug) fetchGuideData()
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
        body: JSON.stringify({ guideId: guide.id }),
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
        body: JSON.stringify({ description: newDescription }),
      })
      if (response.ok) {
        setGuide((prev) => (prev ? { ...prev, description: newDescription } : null))
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
          languages: editLanguages || null,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setGuide((prev) => (prev ? { ...prev, ...data.guide } : null))
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
      const response = await fetch('/api/guide/profile-photo', { method: 'POST', body: formData })
      if (response.ok) {
        const data = await response.json()
        setGuide((prev) => (prev ? { ...prev, profileImage: data.profileImage } : null))
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
      const response = await fetch('/api/guide/cover', { method: 'POST', body: formData })
      if (response.ok) {
        const data = await response.json()
        setGuide((prev) => (prev ? { ...prev, coverImage: data.coverImage } : null))
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
      const response = await fetch('/api/guide/gallery', { method: 'POST', body: formData })
      if (response.ok) {
        const data = await response.json()
        setGallery((prev) => [...prev, data.galleryItem])
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
      const response = await fetch(`/api/guide/gallery?id=${galleryId}`, { method: 'DELETE' })
      if (response.ok) {
        setGallery((prev) => prev.filter((item) => item.id !== galleryId))
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
      const response = await fetch('/api/guide/posts', { method: 'POST', body: formData })
      if (response.ok) {
        const data = await response.json()
        setPosts((prev) => [data.post, ...prev])
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
      const response = await fetch(`/api/guide/posts?postId=${postId}`, { method: 'DELETE' })
      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
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
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`
    }
    return null
  }

  const isOwner = user && guide && guide.userId === user.id
  const embedUrl = getYouTubeEmbedUrl(guide?.presentationVideo)

  const languageChips = guide?.languages
    ? guide.languages.split(/[,;]/).map((l) => l.trim()).filter(Boolean)
    : []
  const specialtyChips = guide?.specialties
    ? guide.specialties.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Guia não encontrado</h1>
          <button
            onClick={() => router.push('/guias')}
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Voltar para lista de guias
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Hero */}
      <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden group">
        {guide.coverImage ? (
          <img src={guide.coverImage} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.push('/guias')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
        </div>
        {isOwner && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">Alterar capa</span>
            </div>
          </label>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        {/* Card perfil */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 -mt-20 sm:-mt-24">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl group">
                  {guide.profileImage ? (
                    <img src={guide.profileImage} alt={guide.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
                      <span className="text-4xl sm:text-5xl font-bold text-white">
                        {guide.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {guide.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-md">
                      <img src="/icons/verificado.png" alt="Verificado" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    </div>
                  )}
                  {isOwner && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
                      <Camera className="w-6 h-6 text-white" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-1">Guia turístico</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                  {capitalizeWords(guide.name)}
                </h1>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">
                      {guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : 'Novo'}
                    </span>
                    {guide.ratingCount > 0 && (
                      <span className="text-slate-500 text-sm">({guide.ratingCount})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">{guide.followersCount}</span>
                    <span className="text-sm">seguidores</span>
                  </div>
                </div>

                {/* Idiomas chips */}
                {languageChips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {languageChips.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ações: Seguir + CTAs */}
                <div className="flex flex-wrap items-center gap-3">
                  {!isOwner && user && (
                    <button
                      onClick={handleFollow}
                      disabled={isFollowingLoading}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 ${
                        isFollowing
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`}
                      />
                      {isFollowingLoading ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                  {guide.whatsapp && (
                    <a
                      href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                    >
                      <Send className="w-4 h-4" />
                      Enviar mensagem
                    </a>
                  )}
                  <button
                    onClick={() => setActiveTab('contato')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    Ver contato
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs pill */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
              {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {TAB_LABELS[tab]}
                  {(tab === 'avaliacoes' && reviews.length > 0) || (tab === 'posts' && posts.length > 0)
                    ? ` (${tab === 'avaliacoes' ? reviews.length : posts.length})`
                    : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="mt-6 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Sobre */}
            {activeTab === 'sobre' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">Descrição</h2>
                    {isOwner && !editingDescription && (
                      <button
                        onClick={() => setEditingDescription(true)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div className="space-y-3">
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-800"
                        placeholder="Conte um pouco sobre você..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateDescription}
                          className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingDescription(false)
                            setNewDescription(guide.description || '')
                          }}
                          className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 leading-relaxed">
                      {guide.description || 'Nenhuma descrição disponível.'}
                    </p>
                  )}
                </div>

                {specialtyChips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-violet-500" />
                      Especialidades
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {specialtyChips.map((s) => (
                        <span
                          key={s}
                          className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {embedUrl && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">Vídeo de apresentação</h2>
                    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {isOwner && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-slate-900">Informações (editar)</h2>
                      {!editingInfo ? (
                        <button
                          onClick={startEditingInfo}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                    {editingInfo ? (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                        <input
                          type="text"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          placeholder="WhatsApp"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                        <input
                          type="url"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          placeholder="Website"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                        <input
                          type="text"
                          value={editSpecialties}
                          onChange={(e) => setEditSpecialties(e.target.value)}
                          placeholder="Especialidades"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                        <input
                          type="text"
                          value={editLanguages}
                          onChange={(e) => setEditLanguages(e.target.value)}
                          placeholder="Idiomas"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateInfo}
                            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingInfo(false)}
                            className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-600 text-sm space-y-1">
                        {guide.specialties && <p><span className="font-medium text-slate-700">Especialidades:</span> {guide.specialties}</p>}
                        {guide.languages && <p><span className="font-medium text-slate-700">Idiomas:</span> {guide.languages}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Galeria */}
            {activeTab === 'galeria' && (
              <div>
                {isOwner && (
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 mb-6 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 cursor-pointer transition-colors">
                    <Plus className="w-4 h-4" />
                    Adicionar foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                  </label>
                )}
                {gallery.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhuma foto na galeria ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-slate-100"
                        onClick={() => {
                          setSelectedGalleryIndex(index)
                          setShowGalleryPreview(true)
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGalleryDelete(item.id)
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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

            {/* Avaliações */}
            {activeTab === 'avaliacoes' && (
              <div>
                {!isOwner && user && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Avaliar guia
                  </button>
                )}
                {reviews.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhuma avaliação ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-600 font-semibold">
                              {review.user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">{review.user.name}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {review.comment && <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>}
                            {review.imageUrl && (
                              <img src={review.imageUrl} alt="" className="mt-2 rounded-xl max-w-xs w-full object-cover" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
              <div>
                {isOwner && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar post
                  </button>
                )}
                {posts.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhum post ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts.map((post) => (
                      <article key={post.id} className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt="" className="w-full h-48 object-cover" />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900">{post.title}</h3>
                            {isOwner && (
                              <button
                                onClick={() => handlePostDelete(post.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {post.body && <p className="text-slate-600 text-sm mt-1 line-clamp-2">{post.body}</p>}
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(post.createdAt).toLocaleDateString('pt-BR')} · {post.likes} curtida{post.likes !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contato */}
            {activeTab === 'contato' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {guide.whatsapp && (
                  <a
                    href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/80 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <WhatsAppIcon size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">WhatsApp</p>
                      <p className="text-sm text-slate-600">Enviar mensagem</p>
                    </div>
                  </a>
                )}
                {guide.phone && (
                  <a
                    href={`tel:${guide.phone}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Telefone</p>
                      <p className="text-sm text-slate-600">{guide.phone}</p>
                    </div>
                  </a>
                )}
                {guide.email && (
                  <a
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">E-mail</p>
                      <p className="text-sm text-slate-600 truncate">{guide.email}</p>
                    </div>
                  </a>
                )}
                {guide.instagram && (
                  <a
                    href={`https://instagram.com/${guide.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 border border-pink-100 hover:bg-pink-100/80 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Instagram</p>
                      <p className="text-sm text-slate-600">@{guide.instagram.replace('@', '')}</p>
                    </div>
                  </a>
                )}
                {guide.facebook && (
                  <a
                    href={guide.facebook.startsWith('http') ? guide.facebook : `https://facebook.com/${guide.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100/80 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Facebook</p>
                      <p className="text-sm text-slate-600">Ver perfil</p>
                    </div>
                  </a>
                )}
                {guide.website && (
                  <a
                    href={guide.website.startsWith('http') ? guide.website : `https://${guide.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-violet-50 border border-violet-100 hover:bg-violet-100/80 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Website</p>
                      <p className="text-sm text-slate-600 truncate">{guide.website}</p>
                    </div>
                  </a>
                )}
                {!guide.whatsapp && !guide.phone && !guide.email && !guide.instagram && !guide.facebook && !guide.website && (
                  <p className="col-span-full text-center py-8 text-slate-500">Nenhuma informação de contato disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {!guide.isApproved && isOwner && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Atenção:</strong> Seu perfil está aguardando aprovação.
          </div>
        )}
      </div>

      {/* Modal galeria */}
      {showGalleryPreview && gallery.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGalleryPreview(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                onClick={() => setSelectedGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedGalleryIndex((prev) => (prev + 1) % gallery.length)}
                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={gallery[selectedGalleryIndex].imageUrl}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedGalleryIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === selectedGalleryIndex ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal avaliação */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Avaliar guia</h3>
              <button onClick={() => setShowReviewForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                formData.append('guideId', guide!.id)
                try {
                  const response = await fetch('/api/guide/reviews', { method: 'POST', body: formData })
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
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nota</label>
                <select
                  name="rating"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="">Selecione...</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} estrela{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Comentário</label>
                <textarea
                  name="comment"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="Deixe seu comentário..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Foto (opcional)</label>
                <input type="file" name="image" accept="image/*" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700">
                  Enviar avaliação
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal post */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Criar post</h3>
              <button onClick={() => setShowPostForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="Título do post..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Conteúdo</label>
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="Escreva seu post..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem (opcional)</label>
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
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700"
                />
                {postImagePreview && <img src={postImagePreview} alt="Preview" className="mt-2 w-full max-w-md rounded-xl object-cover h-40" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vídeo (opcional)</label>
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
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700"
                />
                {postVideoPreview && <video src={postVideoPreview} controls className="mt-2 w-full max-w-md rounded-xl" />}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={uploadingPost} className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50">
                  {uploadingPost ? 'Publicando...' : 'Publicar'}
                </button>
                <button type="button" onClick={() => setShowPostForm(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
