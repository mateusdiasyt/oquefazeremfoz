'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { useNotification } from '../../../../contexts/NotificationContext'
import { capitalizeWords } from '../../../../utils/formatters'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook,
  Mail,
  Star,
  Users,
  Award,
  Languages,
  CheckCircle,
  ArrowLeft
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

export default function GuideProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchGuideData()
    }
  }, [params.slug, user])

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
    } catch (error) {
      console.error('Erro ao carregar dados do guia:', error)
      showNotification('Erro ao carregar dados do guia', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = user && guide && guide.userId === user.id

  // Função para converter URL do YouTube para formato embed
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

  const embedUrl = getYouTubeEmbedUrl(guide.presentationVideo)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com imagem de capa */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-600 to-pink-600">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Imagem de perfil */}
            <div className="relative flex-shrink-0">
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

              {/* Descrição */}
              {guide.description && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{guide.description}</p>
                </div>
              )}

              {/* Contatos e Redes Sociais */}
              <div className="flex flex-wrap items-center gap-3">
                {guide.whatsapp && (
                  <a
                    href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <WhatsAppIcon size={20} />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                )}
                {guide.phone && (
                  <a
                    href={`tel:${guide.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{guide.phone}</span>
                  </a>
                )}
                {guide.email && (
                  <a
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                )}
                {guide.instagram && (
                  <a
                    href={`https://instagram.com/${guide.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                )}
                {guide.facebook && (
                  <a
                    href={guide.facebook.startsWith('http') ? guide.facebook : `https://facebook.com/${guide.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                )}
                {guide.website && (
                  <a
                    href={guide.website.startsWith('http') ? guide.website : `https://${guide.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vídeo de apresentação */}
        {embedUrl && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vídeo de Apresentação</h2>
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

        {/* Mensagem se não estiver aprovado */}
        {!guide.isApproved && isOwner && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <p className="text-amber-800">
              <strong>Atenção:</strong> Seu perfil está aguardando aprovação. Você poderá visualizar todas as informações assim que for aprovado.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
