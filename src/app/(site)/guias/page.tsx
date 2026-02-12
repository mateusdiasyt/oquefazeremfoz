'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Globe,
  Instagram,
  Users,
  Star,
  UserCircle,
  Award,
  MapPin,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import { capitalizeWords } from '../../../utils/formatters'
import { useLocale } from '@/contexts/LocaleContext'
import { getTranslations } from '@/lib/translations'

const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
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
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [heroVisible, setHeroVisible] = useState(false)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const specialties = [
    'Cataratas',
    'Aventura',
    'História',
    'Natureza',
    'Cultura',
    'Gastronomia',
    'Compras',
    'Fotografia',
    'Outros',
  ]

  useEffect(() => {
    setHeroVisible(true)
    const t1 = setTimeout(() => setFiltersVisible(true), 300)
    return () => clearTimeout(t1)
  }, [])

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
        if (sortBy === 'rating') guidesList.sort((a: Guide, b: Guide) => b.ratingAvg - a.ratingAvg)
        else if (sortBy === 'followers') guidesList.sort((a: Guide, b: Guide) => b.followersCount - a.followersCount)
        else if (sortBy === 'newest') guidesList.sort((a: Guide, b: Guide) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setGuides(guidesList)
      }
    } catch (error) {
      console.error('Erro ao buscar guias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuideClick = (guide: Guide) => {
    if (guide.slug) router.push(`/guia/${guide.slug}`)
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative min-h-[50vh] sm:min-h-[55vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pb-32 transition-all duration-700 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Background gradient + orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white/95 text-xs font-semibold uppercase tracking-wider mb-6 animate-scale-in">
            <Sparkles className="w-3.5 h-3.5" />
            OQFOZ
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 animate-slide-up-in" style={{ animationDelay: '0.1s' }}>
            {t.guides.pageTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-slide-up-in" style={{ animationDelay: '0.2s' }}>
            {t.guides.pageSubtitle}
          </p>
          <Link
            href="/guias/cadastre-se"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-violet-600 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: '0.35s' }}
          >
            {t.guides.areYouGuide}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Filters card - glass style */}
      <section className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div
          className={`rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl shadow-violet-900/10 p-4 sm:p-6 transition-all duration-500 ${
            filtersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                placeholder={t.guides.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>
            <div className="sm:w-56 relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-slate-800 bg-white appearance-none cursor-pointer outline-none transition-all"
              >
                <option value="">{t.guides.allSpecialties}</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            <div className="sm:w-44 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-slate-800 bg-white appearance-none cursor-pointer outline-none transition-all"
              >
                <option value="rating">{t.guides.bestRating}</option>
                <option value="followers">{t.guides.moreFollowers}</option>
                <option value="newest">{t.guides.newest}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Lista de guias */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="w-14 h-14 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">Carregando guias...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <UserCircle className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{t.guides.noGuideFound}</h3>
            <p className="text-slate-600">{t.guides.adjustFilters}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {guides.map((guide, index) => (
              <div
                key={guide.id}
                onClick={() => handleGuideClick(guide)}
                className="group relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-violet-200/30 hover:-translate-y-2 hover:border-violet-200/60 transition-all duration-300 opacity-0 animate-stagger-fade"
                style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
              >
                <div className="relative h-48 sm:h-52 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center overflow-hidden">
                  {guide.profileImage ? (
                    <img
                      src={guide.profileImage}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center">
                      <UserCircle className="w-14 h-14 text-violet-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {guide.isVerified && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <img src="/icons/verificado.png" alt={t.common.verified} className="w-5 h-5 object-contain" />
                    </div>
                  )}
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
                    {capitalizeWords(guide.name)}
                  </h3>
                  {guide.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{guide.description}</p>
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
                        <span key={lang} className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700">
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
                      <a href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="WhatsApp">
                        <WhatsAppIcon size={18} />
                      </a>
                    )}
                    {guide.instagram && (
                      <a href={`https://instagram.com/${guide.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors" title="Instagram">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {guide.website && (
                      <a href={guide.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors" title="Website">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-8 sm:p-12 shadow-xl">
          <MapPin className="w-12 h-12 text-white/90 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t.guides.areYouGuide}
          </h2>
          <p className="text-white/90 mb-6 text-sm sm:text-base">
            Cadastre-se e apareça para milhares de turistas em Foz do Iguaçu.
          </p>
          <Link
            href="/guias/cadastre-se"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-violet-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300"
          >
            Cadastre-se como guia
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
