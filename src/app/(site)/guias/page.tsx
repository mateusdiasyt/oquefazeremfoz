'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  Search, 
  Globe, 
  Instagram, 
  Users,
  Star,
  UserCircle,
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
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-2">OQFOZ</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Guias turísticos
          </h1>
          <p className="text-slate-600 max-w-xl">
            Encontre os melhores guias para explorar Foz do Iguaçu
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar guia por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="sm:w-56">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-800 bg-white"
              >
                <option value="">Todas as especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-800 bg-white"
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
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum guia encontrado</h3>
            <p className="text-slate-600">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => handleGuideClick(guide)}
                className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-44 sm:h-48 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center overflow-hidden">
                  {guide.profileImage ? (
                    <img
                      src={guide.profileImage}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-violet-500" />
                    </div>
                  )}
                  {guide.isVerified && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                      <img src="/icons/verificado.png" alt="Verificado" className="w-4 h-4 object-contain" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
                    {capitalizeWords(guide.name)}
                  </h3>
                  {guide.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {guide.description}
                    </p>
                  )}
                  {guide.specialties && (
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 truncate">{guide.specialties}</span>
                    </div>
                  )}
                  {guide.languages && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {guide.languages.split(/[,;]/).slice(0, 3).map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700"
                        >
                          {lang.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : 'Novo'}
                      </span>
                      {guide.ratingCount > 0 && (
                        <span className="text-xs text-slate-500">({guide.ratingCount})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{guide.followersCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    {guide.whatsapp && (
                      <a
                        href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
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
                        className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
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
                        className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors"
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
