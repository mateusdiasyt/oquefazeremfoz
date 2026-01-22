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
  UserCircle,
  Languages,
  Award
} from 'lucide-react'
import { capitalizeWords } from '../../../utils/formatters'

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

interface Guide {
  id: string
  name: string
  slug: string | null
  profileImage: string | null
  description: string | null
  specialties: string | null
  languages: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  ratingAvg: number
  ratingCount: number
  followersCount: number
  isVerified: boolean
  createdAt: string
}

export default function GuiasPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const specialties = [
    'Cataratas',
    'Aventura',
    'História',
    'Natureza',
    'Cultura',
    'Gastronomia',
    'Compras',
    'Fotografia',
    'Outros'
  ]

  useEffect(() => {
    fetchGuides()
  }, [searchTerm, selectedSpecialty, sortBy])

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedSpecialty) params.append('category', selectedSpecialty)

      const response = await fetch(`/api/guides?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        let guidesList = data.guides || []

        // Ordenar localmente
        if (sortBy === 'rating') {
          guidesList.sort((a: Guide, b: Guide) => b.ratingAvg - a.ratingAvg)
        } else if (sortBy === 'followers') {
          guidesList.sort((a: Guide, b: Guide) => b.followersCount - a.followersCount)
        } else if (sortBy === 'newest') {
          guidesList.sort((a: Guide, b: Guide) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }

        setGuides(guidesList)
      }
    } catch (error) {
      console.error('Erro ao buscar guias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuideClick = (guide: Guide) => {
    if (guide.slug) {
      router.push(`/guia/${guide.slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            Guias Turísticos
          </h1>
          <p className="text-lg text-gray-600">
            Encontre os melhores guias para explorar Foz do Iguaçu
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar guia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por especialidade */}
            <div className="md:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todas as especialidades</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="rating">Melhor avaliação</option>
                <option value="followers">Mais seguidores</option>
                <option value="newest">Mais recentes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Guias */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20">
            <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum guia encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => handleGuideClick(guide)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                {/* Imagem de perfil */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {guide.profileImage ? (
                    <img
                      src={guide.profileImage}
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <UserCircle className="w-16 h-16 text-purple-600" />
                    </div>
                  )}
                  {guide.isVerified && (
                    <div className="absolute top-4 right-4">
                      <img src="/icons/verificado.png" alt="Verificado" className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {capitalizeWords(guide.name)}
                    </h3>
                  </div>

                  {guide.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {guide.description}
                    </p>
                  )}

                  {/* Especialidades */}
                  {guide.specialties && (
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{guide.specialties}</span>
                    </div>
                  )}

                  {/* Idiomas */}
                  {guide.languages && (
                    <div className="flex items-center gap-2 mb-4">
                      <Languages className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{guide.languages}</span>
                    </div>
                  )}

                  {/* Avaliação e Seguidores */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">
                        {guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : 'Novo'}
                      </span>
                      {guide.ratingCount > 0 && (
                        <span className="text-xs text-gray-500">({guide.ratingCount})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{guide.followersCount}</span>
                    </div>
                  </div>

                  {/* Contatos */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    {guide.whatsapp && (
                      <a
                        href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="WhatsApp"
                      >
                        <WhatsAppIcon size={18} />
                      </a>
                    )}
                    {guide.instagram && (
                      <a
                        href={`https://instagram.com/${guide.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {guide.website && (
                      <a
                        href={guide.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
