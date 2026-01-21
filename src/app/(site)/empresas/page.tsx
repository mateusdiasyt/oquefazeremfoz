'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Heart,
  Users,
  Star,
  CheckCircle,
  ExternalLink,
  Grid,
  List
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
  presentationVideo?: string | null
  likesCount: number
  followersCount: number
  isFollowing: boolean
  isVerified: boolean
  createdAt: string
  averageRating: number
}

export default function EmpresasPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('likes')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUnfollowModal, setShowUnfollowModal] = useState(false)
  const [businessToUnfollow, setBusinessToUnfollow] = useState<Business | null>(null)
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null)

  const categories = [
    'Restaurante',
    'Hotel',
    'Pousada',
    'Atração Turística',
    'Loja',
    'Serviço',
    'Evento',
    'Outro'
  ]

  // Função para converter URL do YouTube para formato embed
  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    
    // Extrair ID do vídeo de diferentes formatos de URL do YouTube
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

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business/list')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
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

  const filteredAndSortedBusinesses = businesses
    .filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || business.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'followers':
          return b.followersCount - a.followersCount
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'likes':
        default:
          return b.likesCount - a.likesCount
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <p className="text-gray-600 text-lg">Carregando estabelecimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Descubra Foz
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre os melhores restaurantes, hotéis, atrações e serviços da cidade
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Controles */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar estabelecimentos..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all duration-200"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 appearance-none bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ordenação */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 appearance-none bg-white"
              >
                <option value="likes">Mais curtidas</option>
                <option value="followers">Mais seguidores</option>
                <option value="name">Nome A-Z</option>
                <option value="recent">Mais recentes</option>
              </select>
            </div>

            {/* Modo de visualização */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredAndSortedBusinesses.length} estabelecimento{filteredAndSortedBusinesses.length !== 1 ? 's' : ''} encontrado{filteredAndSortedBusinesses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de Estabelecimentos */}
        {filteredAndSortedBusinesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum estabelecimento encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? 'Tente ajustar os filtros de busca'
                : 'Ainda não há estabelecimentos cadastrados'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredAndSortedBusinesses.map((business) => {
              const videoEmbedUrl = getYouTubeEmbedUrl(business.presentationVideo)
              
              return (
              <div 
                key={business.id} 
                className={`bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group relative ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onMouseEnter={() => videoEmbedUrl && setHoveredBusinessId(business.id)}
                onMouseLeave={() => setHoveredBusinessId(null)}
              >
                {/* Popup de vídeo no hover */}
                {hoveredBusinessId === business.id && videoEmbedUrl && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden shadow-2xl">
                      <iframe
                        src={`${videoEmbedUrl}?autoplay=1&mute=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                {/* Imagem/Logo */}
                <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'} relative`}>
                  {business.profileImage ? (
                    <img
                      src={business.profileImage}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">
                        {business.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Badge de categoria */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {business.category}
                    </span>
                  </div>

                </div>

                {/* Conteúdo */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-pink-600 transition-colors">
                          {business.name}
                        </h3>
                        {business.isVerified && (
                          <img 
                            src="/icons/verificado.png" 
                            alt="Verificado" 
                            className="w-5 h-5 object-contain"
                            title="Empresa verificada"
                          />
                        )}
                      </div>
                      {business.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{business.followersCount} seguidores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      <span>{business.averageRating > 0 ? business.averageRating : '-'}</span>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{business.address}</span>
                  </div>

                  {/* Contatos */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.whatsapp && (
                      <button
                        onClick={() => window.open(`https://wa.me/${business.whatsapp?.replace(/\D/g, '')}`, '_blank')}
                        className="p-2 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                        title={`WhatsApp: ${business.whatsapp}`}
                      >
                        <WhatsAppIcon size={16} className="text-green-600" />
                      </button>
                    )}
                    {business.website && (
                      <button
                        onClick={() => window.open(business.website || '', '_blank')}
                        className="p-2 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        title={`Site: ${business.website}`}
                      >
                        <Globe size={16} className="text-blue-600" />
                      </button>
                    )}
                    {business.instagram && (
                      <button
                        onClick={() => window.open(`https://instagram.com/${business.instagram}`, '_blank')}
                        className="p-2 border border-gray-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors"
                        title={`Instagram: ${business.instagram}`}
                      >
                        <Instagram size={16} className="text-pink-600" />
                      </button>
                    )}
                    {business.phone && (
                      <button
                        onClick={() => window.open(`tel:${business.phone}`, '_blank')}
                        className="p-2 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        title={`Telefone: ${business.phone}`}
                      >
                        <Phone size={16} className="text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/empresa/${business.slug || business.id}`)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Ver perfil
                    </button>
                    
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowBusiness(business.id)
                        }}
                        className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 ${
                          business.isFollowing 
                            ? 'bg-pink-500 text-white hover:bg-pink-600' 
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                        }`}
                      >
                        <Heart 
                          size={16} 
                          fill={business.isFollowing ? 'currentColor' : 'none'} 
                        />
                        {business.isFollowing ? 'Seguindo' : 'Seguir'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </div>

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