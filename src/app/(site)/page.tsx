'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import CreatePost from '@/components/CreatePost'
import CreatePostGuide from '@/components/CreatePostGuide'
import ReleaseCarousel from '@/components/ReleaseCarousel'
import ReleaseNewsCard, { type ReleaseNewsCardRelease } from '@/components/ReleaseNewsCard'
import { Search, MapPin, Star, Heart, MessageCircle, Users, Gift, Sun, CheckCircle, Copy, Check, BookOpen, BadgeCheck, Video, Newspaper, Tv, ChevronDown, ChevronUp, X, Share2, Compass, Eye, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { capitalizeWords } from '@/utils/formatters'
import { useLocale } from '@/contexts/LocaleContext'
import { getTranslations } from '@/lib/translations'
import FozTVNativePlayer from './foztv/FozTVNativePlayer'
import FozTVCardPreview from './foztv/FozTVCardPreview'

interface Post {
  id: string
  title: string
  body: string | null
  imageUrl: string | null
  videoUrl: string | null
  likes: number
  createdAt: string
  business?: {
    id: string
    name: string
    isApproved?: boolean
    profileImage: string | null
    isVerified: boolean
    slug: string | null
  } | null
  guide?: {
    id: string
    name: string
    profileImage: string | null
    isVerified: boolean
    slug: string | null
  } | null
  isGuidePost?: boolean
  comments?: Array<{
    id: string
    body: string
    createdAt: string
    user: { id: string; name: string | null }
  }>
  postLikes?: Array<{ userId: string }>
  commentsCount?: number
}

interface User {
  id: string
  email: string
  name: string | null
  roles: string[]
}

interface Business {
  id: string
  name: string
  slug: string | null
  profileImage: string | null
  description: string | null
  category: string
  address: string
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  whatsapp: string | null
  likesCount: number
  followersCount: number
  isFollowing: boolean
  createdAt: string
  averageRating: number
  isVerified: boolean
  isApproved: boolean
}

interface Coupon {
  id: string
  code: string
  title: string
  description: string | null
  discount: string | null
  link: string | null
  validUntil: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  business: {
    id: string
    name: string
    slug: string
    isVerified: boolean
    profileImage: string | null
  }
}

function CouponCard({ coupon, getTimeAgo, copyLabel = 'Copiar', copiedLabel = 'Copiado' }: { coupon: Coupon; getTimeAgo: (date: string) => string; copyLabel?: string; copiedLabel?: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (e) {
      console.error('Erro ao copiar código:', e)
    }
  }
  return (
    <div className="p-2.5 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl border border-purple-100/80 hover:border-purple-200 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-gray-600 truncate max-w-[100px]">{coupon.business.name}</span>
          {coupon.business.isVerified && <img src="/icons/verificado.png" alt="" className="w-3 h-3 object-contain flex-shrink-0" />}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{getTimeAgo(coupon.createdAt)}</span>
      </div>
      <h5 className="font-semibold text-gray-900 text-xs mb-1.5 line-clamp-2">{coupon.title}</h5>
      <div className="flex items-center justify-between mb-2 gap-2">
        {coupon.discount && <span className="text-xs font-bold text-purple-600 truncate">{coupon.discount}</span>}
        <span className="font-mono font-semibold text-gray-900 text-xs tracking-wider truncate">{coupon.code}</span>
      </div>
      <button
        onClick={handleCopyCode}
        className={`w-full text-[11px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all font-medium ${
          isCopied ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isCopied ? <><Check className="w-3 h-3" /><span>{copiedLabel}</span></> : <><Copy className="w-3 h-3" /><span>{copyLabel}</span></>}
      </button>
    </div>
  )
}

interface Weather {
  current: {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
  }
  daily: Array<{
    temp: {
      max: number
      min: number
    }
    description: string
    icon: string
  }>
}

interface FozTVVideo {
  id: string
  title: string
  slug: string
  videoUrl: string
  thumbnailUrl: string | null
  publishedAt: string | null
  likeCount?: number
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test((url || '').trim())
}
function getFozTVEmbedUrl(url: string): string {
  const t = (url || '').trim()
  const id = t.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?#]+)/)?.[1] || t.match(/youtube\.com\/embed\/([^&\s?#]+)/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : t
}

interface FozTVVideoDetails extends FozTVVideo {
  userLiked?: boolean
  description?: string | null
}
interface FozTVCommentItem {
  id: string
  body: string
  createdAt: string
  user: { id: string; name: string; profileImage: string | null } | null
}

function formatFozTVDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`
  return d.toLocaleDateString('pt-BR')
}

interface FeaturedGuide {
  id: string
  name: string
  slug: string | null
  profileImage: string | null
  ratingAvg: number
  ratingCount: number
  isVerified: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [posts, setPosts] = useState<Post[]>([])
  const [guidePosts, setGuidePosts] = useState<Post[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [weather, setWeather] = useState<Weather | null>(null)
  const [foztvVideos, setFoztvVideos] = useState<FozTVVideo[]>([])
  const [foztvCarouselIndex, setFoztvCarouselIndex] = useState(0)
  const [foztvHoveredId, setFoztvHoveredId] = useState<string | null>(null)
  const [playingFozTVVideo, setPlayingFozTVVideo] = useState<FozTVVideo | null>(null)
  const [foztvDetails, setFoztvDetails] = useState<FozTVVideoDetails | null>(null)
  const [foztvComments, setFoztvComments] = useState<FozTVCommentItem[]>([])
  const [foztvCommentText, setFoztvCommentText] = useState('')
  const [foztvSendingComment, setFoztvSendingComment] = useState(false)
  const [foztvTogglingLike, setFoztvTogglingLike] = useState(false)
  const [featuredGuides, setFeaturedGuides] = useState<FeaturedGuide[]>([])
  const [weatherExpanded, setWeatherExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  // Função para calcular tempo relativo
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'agora mesmo'
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
  }
  const [showUnfollowModal, setShowUnfollowModal] = useState(false)
  const [businessToUnfollow, setBusinessToUnfollow] = useState<Business | null>(null)
  const [releasesRefreshKey, setReleasesRefreshKey] = useState(0)
  const [releases, setReleases] = useState<ReleaseNewsCardRelease[]>([])
  const [timelineSortBy, setTimelineSortBy] = useState<'recent' | 'views' | 'likes' | 'comments'>('recent')
  
  // Estados removidos - busca agora está no header
  
  // Estados para scroll infinito
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Funções de busca removidas - agora está no header

  useEffect(() => {
    // Usuário já está disponível via useAuth context
    fetchPosts()
    fetchBusinesses()
    fetchCoupons()
    fetchWeather()
    fetchFozTVVideos()
    fetchFeaturedGuides()
  }, [])

  const fetchFozTVVideos = async () => {
    try {
      const response = await fetch('/api/public/foztv', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const list = Array.isArray(data) ? data : []
        setFoztvVideos(list.slice(0, 3))
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos FozTV:', error)
    }
  }

  // Carrossel FozTV: rotação automática (1 vídeo por vez)
  useEffect(() => {
    if (foztvVideos.length <= 1 || playingFozTVVideo) return
    const t = setInterval(() => {
      setFoztvCarouselIndex((i) => (i + 1) % foztvVideos.length)
    }, 4500)
    return () => clearInterval(t)
  }, [foztvVideos.length, playingFozTVVideo])

  // Ao abrir o modal, buscar detalhes e comentários do vídeo
  useEffect(() => {
    if (!playingFozTVVideo) {
      setFoztvDetails(null)
      setFoztvComments([])
      setFoztvCommentText('')
      return
    }
    setFoztvDetails({ ...playingFozTVVideo, likeCount: playingFozTVVideo.likeCount ?? 0, userLiked: false })
    Promise.all([
      fetch(`/api/public/foztv/${playingFozTVVideo.id}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/public/foztv/${playingFozTVVideo.id}/comments`, { cache: 'no-store' }).then((r) => r.json())
    ])
      .then(([detailRes, commentsRes]) => {
        if (detailRes?.id) setFoztvDetails(detailRes)
        if (commentsRes?.comments) setFoztvComments(commentsRes.comments)
      })
      .catch(() => {})
  }, [playingFozTVVideo?.id, playingFozTVVideo])

  const handleFozTVClose = useCallback(() => setPlayingFozTVVideo(null), [])
  useEffect(() => {
    if (!playingFozTVVideo) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleFozTVClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playingFozTVVideo, handleFozTVClose])

  const handleFozTVLike = async () => {
    if (!playingFozTVVideo || !user) return
    setFoztvTogglingLike(true)
    try {
      const res = await fetch(`/api/public/foztv/${playingFozTVVideo.id}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && foztvDetails) {
        setFoztvDetails((d) => (d ? { ...d, userLiked: data.liked, likeCount: data.likeCount } : null))
      }
    } finally {
      setFoztvTogglingLike(false)
    }
  }

  const handleFozTVShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/foztv` : ''
    if (navigator.share && playingFozTVVideo) {
      try {
        await navigator.share({
          title: playingFozTVVideo.title,
          text: playingFozTVVideo.title,
          url
        })
      } catch {
        await navigator.clipboard.writeText(url)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const handleFozTVSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playingFozTVVideo || !user || !foztvCommentText.trim()) return
    setFoztvSendingComment(true)
    try {
      const res = await fetch(`/api/public/foztv/${playingFozTVVideo.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: foztvCommentText.trim() })
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setFoztvComments((c) => [...c, data.comment])
        setFoztvCommentText('')
      }
    } finally {
      setFoztvSendingComment(false)
    }
  }

  const fetchFeaturedGuides = async () => {
    try {
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        const list = (data.guides || []).slice(0, 5)
        setFeaturedGuides(list.map((g: { id: string; name: string; slug: string | null; profileImage: string | null; ratingAvg: number; ratingCount: number; isVerified: boolean }) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          profileImage: g.profileImage,
          ratingAvg: g.ratingAvg,
          ratingCount: g.ratingCount,
          isVerified: g.isVerified,
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar guias em destaque:', error)
    }
  }

  useEffect(() => {
    fetchReleases()
  }, [releasesRefreshKey])

  // Hook para scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMorePosts()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage, hasMorePosts, loadingMore])


  // Usuário já está disponível via useAuth context, não precisa buscar novamente

  const fetchPosts = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Timeline: sem limite por empresa; carregar mais itens por página
      const response = await fetch(`/api/posts?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (append) {
          setPosts(prev => [...prev, ...(data.posts || [])])
        } else {
          setPosts(data.posts || [])
          setGuidePosts(data.guidePosts || [])
        }
        setHasMorePosts(data.posts && data.posts.length === 20)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = async () => {
    if (!loadingMore && hasMorePosts) {
      await fetchPosts(currentPage + 1, true)
    }
  }

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business/list')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/recent')
      if (response.ok) {
        const data = await response.json()
        // A API retorna o array diretamente, não um objeto com 'coupons'
        setCoupons(Array.isArray(data) ? data : (data.coupons || []))
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error)
    }
  }

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather')
      if (response.ok) {
        const data = await response.json()
          setWeather(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do clima:', error)
    }
  }

  const fetchReleases = async () => {
    try {
      const response = await fetch('/api/public/releases/recent')
      if (response.ok) {
        const data = await response.json()
        setReleases(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao buscar releases:', error)
      setReleases([])
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handleReleaseCreated = () => {
    setReleasesRefreshKey((k) => k + 1)
  }

  const handleFollowBusiness = async (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    
    if (business?.isFollowing) {
      // Se já está seguindo, mostrar modal de confirmação
      setBusinessToUnfollow(business)
      setShowUnfollowModal(true)
    } else {
      // Se não está seguindo, seguir diretamente
      await performFollowAction(businessId)
    }
  }

  const performFollowAction = async (businessId: string) => {
    try {
      const response = await fetch('/api/business/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar o estado da empresa específica
        setBusinesses(prev => prev.map(business => 
          business.id === businessId 
            ? { 
                ...business, 
                isFollowing: data.isFollowing, 
                followersCount: data.followersCount 
              }
            : business
        ))
      }
    } catch (error) {
      console.error('Erro ao seguir empresa:', error)
    }
  }

  const handleConfirmUnfollow = async () => {
    if (businessToUnfollow) {
      await performFollowAction(businessToUnfollow.id)
      setShowUnfollowModal(false)
      setBusinessToUnfollow(null)
    }
  }

  const handleCancelUnfollow = () => {
    setShowUnfollowModal(false)
    setBusinessToUnfollow(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Apenas para usuários não logados */}
      {!user && (
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6" style={{ letterSpacing: '-0.03em' }}>
                O Que Fazer em Foz
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto" style={{ letterSpacing: '-0.01em' }}>
                Conheça as melhores empresas de Foz do Iguaçu
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/empresas')}
                  className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-2xl shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  <MapPin className="w-5 h-5" />
                  Explorar Empresas
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  <Users className="w-5 h-5" />
                  Criar Conta
                </button>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Main Content */}
      <section className="w-full pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-0 md:px-4 lg:px-8">
          {/* Sidebar Esquerda - Empresas em Destaque (coluna compacta e moderna) - rola com a página */}
          <aside className="hidden lg:flex flex-col gap-4 relative">
            {(() => {
              const categories = ['Hotel', 'Restaurante', 'Pousada', 'Atração Turística', 'Loja', 'Serviço', 'Evento', 'Portais', 'Influencers', 'Outro']
              const businessesByCategory: Record<string, Business[]> = {}
              const maxPerCategory = 2

              businesses
                .filter(b => b.isApproved)
                .sort((a, b) => {
                  if (a.isVerified !== b.isVerified) return b.isVerified ? -1 : 1
                  const followersDiff = (b.followersCount || 0) - (a.followersCount || 0)
                  if (followersDiff !== 0) return followersDiff
                  const likesDiff = (b.likesCount || 0) - (a.likesCount || 0)
                  if (likesDiff !== 0) return likesDiff
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
                .forEach(business => {
                  const category = business.category || 'Outro'
                  if (!businessesByCategory[category]) businessesByCategory[category] = []
                  if (businessesByCategory[category].length < maxPerCategory) {
                    businessesByCategory[category].push(business)
                  }
                })

              const categoriesWithBusinesses = categories.filter(cat =>
                businessesByCategory[cat] && businessesByCategory[cat].length > 0
              )
              if (categoriesWithBusinesses.length === 0) return null

              return (
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{t.home.featuredBusinesses}</h4>
                  </div>
                  <div className="p-2 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {categoriesWithBusinesses.map((category, categoryIndex) => (
                      <div key={category}>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-1.5">
                          {category}
                        </p>
                        <div className="space-y-0.5">
                          {businessesByCategory[category].map((business) => (
                            <div
                              key={business.id}
                              className="group flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <button
                                onClick={() => router.push(`/empresa/${business.slug || business.id}`)}
                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                              >
                                {business.profileImage ? (
                                  <img
                                    src={business.profileImage}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 ring-1 ring-gray-100"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-purple-600 font-semibold text-xs flex-shrink-0">
                                    {business.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-900 truncate text-xs">
                                      {capitalizeWords(business.name)}
                                    </span>
                                    {business.isVerified && (
                                      <img src="/icons/verificado.png" alt="" className="w-3 h-3 object-contain flex-shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400">{business.followersCount} {t.home.followers}</span>
                                </div>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleFollowBusiness(business.id) }}
                                className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                                  business.isFollowing
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                                title={business.isFollowing ? t.home.unfollow : t.home.follow}
                              >
                                <svg className="w-3.5 h-3.5" fill={business.isFollowing ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        {categoryIndex < categoriesWithBusinesses.length - 1 && (
                          <div className="border-t border-gray-100/80 mt-2 pt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Menu rápido - estilo minimalista, ícones simples (terceira imagem) */}
            <nav className="rounded-xl border border-gray-100 bg-white/50 py-2 px-3">
              <Link
                href="/o-que-fazer-em-foz-do-iguacu"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.home.whatToDoInFoz}</span>
              </Link>
              <Link
                href="/guias"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <Compass className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.nav.guides}</span>
              </Link>
              <Link
                href="/cupons"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <Gift className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.home.coupons}</span>
              </Link>
              <Link
                href="/selo-verificado"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <BadgeCheck className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.home.verifiedSeal}</span>
              </Link>
              <Link
                href="/cameras-ao-vivo"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <Video className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.home.liveCameras}</span>
              </Link>
              <Link
                href="/foztv"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <Tv className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">FozTV</span>
              </Link>
              <Link
                href="/portal"
                className="flex items-center gap-3 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-lg transition-colors text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                <Newspaper className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium">{t.home.tourismPortal}</span>
              </Link>
            </nav>
          </aside>

          {/* Feed */}
          <div className="lg:col-span-2 flex flex-col gap-0 md:gap-6 px-0 md:px-0">
            {/* Criar Post - empresas e guias (coluna igual na home) */}
            {user && user.roles.includes('COMPANY') && (
              <CreatePost onPostCreated={handlePostCreated} onReleaseCreated={handleReleaseCreated} />
            )}
            {user && user.roles.includes('GUIDE') && (
              <CreatePostGuide onPostCreated={handlePostCreated} />
            )}

            {/* Releases recentes – cards estilo stories (carrossel) */}
            <ReleaseCarousel key={releasesRefreshKey} />

            {/* Filtro da linha do tempo */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                <ArrowUpDown className="w-4 h-4" />
                Ordenar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'recent' as const, label: 'Mais recentes' },
                  { value: 'views' as const, label: 'Mais visualizações' },
                  { value: 'likes' as const, label: 'Mais curtidas' },
                  { value: 'comments' as const, label: 'Mais comentários' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTimelineSortBy(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      timelineSortBy === value
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline: posts + releases (releases com card de link) */}
            {loading ? (
              <div className="card p-12 text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">{t.home.loadingPosts}</p>
              </div>
            ) : (() => {
              type FeedItem = { type: 'post'; date: string; item: Post } | { type: 'release'; date: string; item: ReleaseNewsCardRelease }
              const rawItems: FeedItem[] = [
                ...posts.map((p) => ({ type: 'post' as const, date: p.createdAt, item: p })),
                ...guidePosts.map((p) => ({ type: 'post' as const, date: p.createdAt, item: p })),
                ...releases.map((r) => ({ type: 'release' as const, date: r.publishedAt || r.createdAt, item: r }))
              ]
              const feedItems: FeedItem[] = [...rawItems].sort((a, b) => {
                if (timelineSortBy === 'recent') {
                  return new Date(b.date).getTime() - new Date(a.date).getTime()
                }
                if (timelineSortBy === 'views') {
                  const va = a.type === 'release' ? (a.item as ReleaseNewsCardRelease).views ?? 0 : 0
                  const vb = b.type === 'release' ? (b.item as ReleaseNewsCardRelease).views ?? 0 : 0
                  if (vb !== va) return vb - va
                  return new Date(b.date).getTime() - new Date(a.date).getTime()
                }
                if (timelineSortBy === 'likes') {
                  const la = (a.item as Post & ReleaseNewsCardRelease).likes ?? 0
                  const lb = (b.item as Post & ReleaseNewsCardRelease).likes ?? 0
                  if (lb !== la) return lb - la
                  return new Date(b.date).getTime() - new Date(a.date).getTime()
                }
                // comments
                const ca = a.type === 'release'
                  ? (a.item as ReleaseNewsCardRelease)._count?.releasecomment ?? 0
                  : (a.item as Post).commentsCount ?? 0
                const cb = b.type === 'release'
                  ? (b.item as ReleaseNewsCardRelease)._count?.releasecomment ?? 0
                  : (b.item as Post).commentsCount ?? 0
                if (cb !== ca) return cb - ca
                return new Date(b.date).getTime() - new Date(a.date).getTime()
              })

              if (feedItems.length === 0) {
                return (
                  <div className="card p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {t.home.noPostsYet}
                    </h3>
                    <p className="text-gray-500">
                      {t.home.noContentShared}
                    </p>
                  </div>
                )
              }

              return (
                <>
                  {feedItems.map((entry) =>
                    entry.type === 'post' ? (
                      <PostCard key={`post-${entry.item.id}`} post={entry.item} />
                    ) : (
                      <ReleaseNewsCard key={`release-${entry.item.id}`} release={entry.item} />
                    )
                  )}
                  {loadingMore && (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span className="text-gray-600 text-sm">{t.home.loadingMore}</span>
                      </div>
                    </div>
                  )}
                  {!hasMorePosts && (posts.length > 0 || guidePosts.length > 0) && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">{t.home.seenAllPosts}</p>
                    </div>
                  )}
                </>
              )
            })()}
          </div>

          {/* Sidebar Direita – mesmo estilo compacto e moderno - rola com a página */}
          <aside className="flex flex-col gap-4 relative">
            {/* Guias em Destaque */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate">{t.home.featuredGuides}</h4>
              </div>
              <div className="p-2 space-y-1 max-h-[240px] overflow-y-auto">
                {featuredGuides.length === 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">{t.home.noGuide}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{t.home.comingSoon}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {featuredGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={guide.slug ? `/guia/${guide.slug}` : '/guias'}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50/80 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {guide.profileImage ? (
                            <img src={guide.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">{guide.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-900 truncate flex items-center gap-1">
                            {capitalizeWords(guide.name)}
                            {guide.isVerified && <img src="/icons/verificado.png" alt="" className="w-3 h-3 object-contain flex-shrink-0" />}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                            <span>{guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : '-'}</span>
                            {guide.ratingCount > 0 && <span>({guide.ratingCount})</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {featuredGuides.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <Link href="/guias" className="text-xs font-medium text-purple-600 hover:text-purple-700">
                    {t.home.seeAllGuides}
                  </Link>
                </div>
              )}
            </div>

            {/* Cupons do Dia */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate">{t.home.couponsOfTheDay}</h4>
              </div>
              <div className="p-2 max-h-[280px] overflow-y-auto">
                {coupons.length === 0 ? (
                  <div className="text-center py-6">
                    <Gift className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">{t.home.noCoupon}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{t.home.comingSoon}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {coupons.map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} getTimeAgo={getTimeAgo} copyLabel={t.home.copy} copiedLabel={t.home.copied} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Carrossel FozTV – 1 vídeo por vez, rotação automática; hover = preview; clique = player com like/comentários/compartilhar */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Tv className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate">FozTV</h4>
              </div>
              <div className="p-2">
                {foztvVideos.length > 0 ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden border border-gray-100">
                      {foztvVideos.map((video, idx) => (
                        <div
                          key={video.id}
                          className={`relative aspect-video bg-gray-100 ${idx !== foztvCarouselIndex ? 'hidden' : ''}`}
                          onMouseEnter={() => setFoztvHoveredId(video.id)}
                          onMouseLeave={() => setFoztvHoveredId(null)}
                        >
                          {foztvHoveredId === video.id ? (
                            <FozTVCardPreview
                              video={{ id: video.id, title: video.title, videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl, likeCount: video.likeCount }}
                              isHovering
                              onPlay={() => setPlayingFozTVVideo(video)}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPlayingFozTVVideo(video)}
                              className="block w-full h-full text-left group"
                            >
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                                  <Video className="w-8 h-8 text-white/80" />
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                <span className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Video className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                                </span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-xs font-semibold text-white line-clamp-2">{video.title}</p>
                              </div>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {foztvVideos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFoztvCarouselIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${idx === foztvCarouselIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                          aria-label={`Vídeo ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="py-1.5 px-2">
                      <span className="text-xs font-medium text-purple-600">{t.home.watch} →</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Tv className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">{t.home.noVideo}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{t.home.comingSoon}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal FozTV – player + painel com curtir, comentários, compartilhar (igual à aba FozTV) */}
            {playingFozTVVideo && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-label={t.home.watch}
                onClick={(e) => e.target === e.currentTarget && handleFozTVClose()}
              >
                <div
                  className="relative flex flex-col md:flex-row w-[94vw] max-w-[1600px] max-h-[90vh] my-auto bg-white rounded-xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative flex-[1_1_70%] min-w-0 min-h-[200px] aspect-video md:min-h-0 bg-black">
                    {isYouTubeUrl(playingFozTVVideo.videoUrl) ? (
                      <iframe
                        src={getFozTVEmbedUrl(playingFozTVVideo.videoUrl)}
                        title={playingFozTVVideo.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <FozTVNativePlayer
                        src={playingFozTVVideo.videoUrl}
                        title={playingFozTVVideo.title}
                        onClose={handleFozTVClose}
                      />
                    )}
                  </div>
                  <div className="relative flex flex-col w-full md:w-[280px] md:min-w-[280px] md:max-w-[320px] md:border-l border-t md:border-t-0 border-gray-200 max-h-[50vh] md:max-h-none min-h-0">
                    <button
                      type="button"
                      onClick={handleFozTVClose}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                      aria-label="Fechar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-4 pb-2 flex-shrink-0">
                      <h2 className="text-base font-bold text-gray-900 pr-8 line-clamp-2">{playingFozTVVideo.title}</h2>
                      {foztvDetails?.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{foztvDetails.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 flex-shrink-0">
                      {user ? (
                        <button
                          type="button"
                          onClick={handleFozTVLike}
                          disabled={foztvTogglingLike}
                          className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 rounded-lg transition-colors ${foztvDetails?.userLiked ? 'text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
                          title="Curtir"
                        >
                          <Heart className={`w-6 h-6 ${foztvDetails?.userLiked ? 'fill-current' : ''}`} />
                          <span className="text-xs font-medium">{foztvDetails?.likeCount ?? 0}</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-500">
                          <Heart className="w-6 h-6" />
                          <span className="text-xs">{foztvDetails?.likeCount ?? 0}</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-600">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-xs font-medium">{foztvComments.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleFozTVShare}
                        className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Compartilhar"
                      >
                        <Share2 className="w-6 h-6" />
                        <span className="text-xs font-medium">Compartilhar</span>
                      </button>
                    </div>
                    <div className="flex flex-col flex-1 min-h-0 border-t border-gray-100">
                      <h3 className="px-4 py-2 text-sm font-semibold text-gray-900 flex-shrink-0">
                        Comentários {foztvComments.length > 0 && `(${foztvComments.length})`}
                      </h3>
                      <ul className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0">
                        {foztvComments.length === 0 ? (
                          <li className="text-sm text-gray-500 py-4">Nenhum comentário ainda.</li>
                        ) : (
                          foztvComments.map((c) => (
                            <li key={c.id} className="text-sm">
                              <span className="font-medium text-gray-900">{c.user?.name || 'Usuário'}</span>
                              <span className="text-gray-600"> {c.body}</span>
                              <span className="text-gray-400 text-xs ml-1 block">{formatFozTVDate(c.createdAt)}</span>
                            </li>
                          ))
                        )}
                      </ul>
                      {user ? (
                        <form onSubmit={handleFozTVSubmitComment} className="p-4 pt-2 flex-shrink-0 border-t border-gray-100">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={foztvCommentText}
                              onChange={(e) => setFoztvCommentText(e.target.value)}
                              placeholder="Escreva um comentário..."
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              maxLength={500}
                            />
                            <button
                              type="submit"
                              disabled={!foztvCommentText.trim() || foztvSendingComment}
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

            {/* Clima em Foz do Iguaçu */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate">{t.home.weather}</h4>
              </div>
              <div className="p-2">
                {weather ? (
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2.5 border border-yellow-100">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                          alt=""
                          className="w-8 h-8"
                        />
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-gray-800 leading-tight">{weather.current.temp}°C</p>
                          <p className="text-[11px] text-gray-600 capitalize truncate">{weather.current.description}</p>
                        </div>
                      </div>
                      {weatherExpanded && (
                        <p className="text-[10px] text-gray-500 mt-1.5">Sensação {weather.current.feels_like}° • Umidade {weather.current.humidity}%</p>
                      )}
                    </div>
                    {weatherExpanded && (
                      <div className="space-y-0.5 max-h-48 overflow-y-auto">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-0.5 mb-1">Próximos 7 dias</p>
                        {weather.daily.slice(0, 7).map((day, index) => {
                          const today = new Date()
                          const dayDate = new Date(today)
                          dayDate.setDate(today.getDate() + index)
                          const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                          const dayName = index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : weekDayNames[dayDate.getDay()]
                          return (
                            <div key={index} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="" className="w-6 h-6 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-800">{dayName}</p>
                                  <p className="text-[10px] text-gray-500 capitalize truncate">{day.description}</p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-gray-800 flex-shrink-0">{day.temp.max}° / {day.temp.min}°</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setWeatherExpanded((v) => !v)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-gray-100"
                    >
                      {weatherExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> {t.home.seeLess}</> : <><ChevronDown className="w-3.5 h-3.5" /> {t.home.expand}</>}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sun className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs">Carregando...</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Modal de Confirmação para Desseguir */}
      {showUnfollowModal && businessToUnfollow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Desseguir empresa?
              </h3>
              
              <p className="text-gray-600 mb-6">
                Você realmente quer parar de seguir <span className="font-semibold text-gray-800">{businessToUnfollow.name}</span>? 
                Você não receberá mais atualizações desta empresa.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelUnfollow}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmUnfollow}
                  className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium"
                >
                  Sim, desseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}