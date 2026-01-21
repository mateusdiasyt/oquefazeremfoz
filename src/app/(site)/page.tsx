'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import CreatePost from '@/components/CreatePost'
import FloatingChat from '@/components/FloatingChat'
import { Search, MapPin, Star, Heart, MessageCircle, Users, Gift, Sun, CheckCircle, Copy, Check } from 'lucide-react'

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

function CouponCard({ coupon, getTimeAgo }: { coupon: Coupon; getTimeAgo: (date: string) => string }) {
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao copiar código:', error)
    }
  }

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors">
      {/* Cabeçalho: Nome da empresa e tempo */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-700">
            {coupon.business.name}
          </span>
          {coupon.business.isVerified && (
            <img 
              src="/icons/verificado.png" 
              alt="Verificado" 
              className="w-3.5 h-3.5 object-contain"
              title="Empresa verificada"
            />
          )}
        </div>
        <span className="text-xs text-gray-500">
          {getTimeAgo(coupon.createdAt)}
        </span>
      </div>

      {/* Título do cupom */}
      <h5 className="font-semibold text-gray-900 text-sm mb-2" style={{ letterSpacing: '-0.01em' }}>
        {coupon.title}
      </h5>

      {/* Desconto e código */}
      <div className="flex items-center justify-between mb-3">
        {coupon.discount && (
          <span className="text-sm font-bold text-purple-600" style={{ letterSpacing: '-0.01em' }}>
            {coupon.discount}
          </span>
        )}
        <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
          {coupon.code}
        </span>
      </div>

      {/* Botão copiar */}
      <button
        onClick={handleCopyCode}
        className={`w-full text-xs flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-purple-500/20 font-medium ${
          isCopied
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copiar Código</span>
          </>
        )}
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

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [weather, setWeather] = useState<Weather | null>(null)
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
  
  // Estados para filtro de busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Business[]>([])
  
  // Estados para scroll infinito
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Função para filtrar empresas
  const filterBusinesses = () => {
    let filtered = businesses

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(business =>
        business.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    setFilteredBusinesses(filtered)
  }

  // Função para gerar sugestões em tempo real
  const generateSuggestions = (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    let filtered = businesses

    // Filtrar por termo de busca
    filtered = filtered.filter(business =>
      business.name.toLowerCase().includes(term.toLowerCase()) ||
      business.description?.toLowerCase().includes(term.toLowerCase()) ||
      business.category.toLowerCase().includes(term.toLowerCase())
    )

    // Filtrar por categoria se selecionada
    if (selectedCategory) {
      filtered = filtered.filter(business =>
        business.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Limitar a 5 sugestões
    setSuggestions(filtered.slice(0, 5))
    setShowSuggestions(true)
  }

  // Efeito para filtrar quando os filtros mudarem
  useEffect(() => {
    filterBusinesses()
  }, [businesses, searchTerm, selectedCategory])

  // Efeito para gerar sugestões em tempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions(searchTerm)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, businesses])

  useEffect(() => {
    fetchUser()
    fetchPosts()
    fetchBusinesses()
    fetchCoupons()
    fetchWeather()
  }, [])

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

      const response = await fetch(`/api/posts?page=${page}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        
        if (append) {
          setPosts(prev => [...prev, ...(data.posts || [])])
        } else {
          setPosts(data.posts || [])
        }
        
        // Verificar se há mais posts
        setHasMorePosts(data.posts && data.posts.length === 5)
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

  const handlePostCreated = () => {
    fetchPosts()
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
      {/* Hero Section */}
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

      {/* Search Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-3xl shadow-lg shadow-purple-500/5 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className="w-full pl-12 pr-5 py-4 bg-white/50 border border-purple-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all duration-200 text-lg" 
                placeholder="Buscar hotéis, restaurantes, atrações..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                onBlur={() => {
                  // Delay para permitir cliques nas sugestões
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
              />
              
              {/* Dropdown de Sugestões */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((business) => (
                    <div
                      key={business.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchTerm(business.name)
                        setShowSuggestions(false)
                        router.push(`/empresa/${business.slug}`)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Foto de Perfil */}
                        <div className="flex-shrink-0">
                          {business.profileImage ? (
                            <img
                              src={business.profileImage}
                              alt={business.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {business.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Informações da Empresa */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">{business.name}</h4>
                            {business.isVerified && (
                              <img 
                                src="/icons/verificado.png" 
                                alt="Verificado" 
                                className="w-4 h-4 object-contain"
                                title="Empresa verificada"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500 truncate">{business.category}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Heart className="w-3 h-3" fill="currentColor" />
                              <span>{business.followersCount}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicador de Ação */}
                        <div className="flex-shrink-0">
                          <div className="text-xs text-purple-600 font-medium">
                            Ver perfil
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filtro de Categoria */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Categoria:
              </label>
              <select 
                className="input text-sm min-w-[140px] bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Hotel">Hotéis</option>
                <option value="Restaurante">Restaurantes</option>
                <option value="Turismo">Turismo</option>
                <option value="Atração">Atrações</option>
                <option value="Shopping">Shopping</option>
                <option value="Serviço">Serviços</option>
                <option value="Outro">Outros</option>
              </select>
            </div>
            
            <button 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-2xl whitespace-nowrap hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 text-lg"
              onClick={() => {
                // Redirecionar para página de empresas com filtros
                const params = new URLSearchParams()
                if (searchTerm) params.set('q', searchTerm)
                if (selectedCategory) params.set('category', selectedCategory)
                router.push(`/empresas?${params.toString()}`)
              }}
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Criar Post - para empresas e admins */}
            {user && (user.roles.includes('COMPANY') || user.roles.includes('ADMIN')) && (
              <CreatePost onPostCreated={handlePostCreated} />
            )}

            {/* Lista de Posts */}
            {loading ? (
              <div className="card p-12 text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Carregando publicações...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="card p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma publicação ainda
                </h3>
                <p className="text-gray-500">
                  As empresas ainda não compartilharam conteúdo
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {/* Indicador de carregamento */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="text-gray-600 text-sm">Carregando mais posts...</span>
                    </div>
                  </div>
                )}
                
                {/* Indicador de fim dos posts */}
                {!hasMorePosts && posts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Você viu todos os posts disponíveis!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Empresas em Destaque */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>Empresas em Destaque</h4>
              </div>
              
              {businesses.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {businesses.slice(0, 3).map((business) => (
                    <div key={business.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-100">
                      <button
                        onClick={() => router.push(`/empresa/${business.slug || business.id}`)}
                        className="flex items-center space-x-3 flex-1 min-w-0 text-left"
                      >
                        {business.profileImage ? (
                          <img
                            src={business.profileImage}
                            alt={business.name}
                            className="w-11 h-11 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm border border-gray-200">
                            {business.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-gray-900 truncate text-sm" style={{ letterSpacing: '-0.01em' }}>{business.name}</h5>
                            {business.isVerified && (
                              <img 
                                src="/icons/verificado.png" 
                                alt="Verificado" 
                                className="w-4 h-4 object-contain"
                                title="Empresa verificada"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500 truncate">{business.category}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span>{business.followersCount}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowBusiness(business.id)
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          business.isFollowing 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                        title={business.isFollowing ? 'Parar de seguir' : 'Seguir'}
                      >
                        <svg className="w-4 h-4" fill={business.isFollowing ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cupons do Dia */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>Cupons do Dia</h4>
              </div>
              
              {coupons.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum cupom disponível</p>
                  <p className="text-gray-400 text-xs mt-1">As empresas ainda não criaram cupons</p>
                </div>
              ) : (
              <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} getTimeAgo={getTimeAgo} />
                  ))}
                  </div>
                )}
            </div>

            {/* Clima em Foz do Iguaçu */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800">Clima em Foz do Iguaçu</h4>
              </div>
              
              {weather ? (
                <div className="space-y-4">
                  {/* Temperatura Atual */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <img 
                            src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`} 
                            alt={weather.current.description}
                            className="w-12 h-12"
                          />
                          <div>
                            <p className="text-3xl font-bold text-gray-800">{weather.current.temp}°C</p>
                            <p className="text-sm text-gray-600 capitalize">{weather.current.description}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Sensação: {weather.current.feels_like}°C • Umidade: {weather.current.humidity}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Previsão dos próximos 7 dias */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Próximos 7 dias</h5>
                    <div className="space-y-2">
                      {weather.daily.slice(0, 7).map((day, index) => {
                        const today = new Date()
                        const dayDate = new Date(today)
                        dayDate.setDate(today.getDate() + index)
                        
                        // Mapear dias da semana: getDay() retorna 0=Domingo, 1=Segunda, etc.
                        const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                        
                        let dayName: string
                        if (index === 0) {
                          dayName = 'Hoje'
                        } else if (index === 1) {
                          dayName = 'Amanhã'
                        } else {
                          // Para os demais dias, usar o nome do dia da semana
                          dayName = weekDayNames[dayDate.getDay()]
                        }
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                              alt={day.description}
                                className="w-7 h-7"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-800">{dayName}</p>
                                <p className="text-xs text-gray-500 capitalize">{day.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-800">
                                {day.temp.max}° / {day.temp.min}°
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sun className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Carregando dados do clima...</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Floating Chat */}
      <FloatingChat />

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