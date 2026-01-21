'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/NotificationContext'
import { Plus, Building2, CheckCircle, MapPin, Star, Users, ExternalLink, Settings } from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string | null
  category: string
  profileImage: string | null
  coverImage: string | null
  isApproved: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export default function MinhasEmpresasPage() {
  const router = useRouter()
  const { user, isCompany } = useAuth()
  const { showNotification } = useNotification()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Preservar a URL atual ao redirecionar para login
      router.push(`/login?redirect=${encodeURIComponent('/minhas-empresas')}`)
      return
    }

    if (!isCompany()) {
      router.push('/')
      return
    }

    fetchBusinesses()
  }, [user, isCompany, router])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business/my-businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
        setActiveBusinessId(data.activeBusinessId || null)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      showNotification('Erro ao carregar empresas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSetActive = async (businessId: string) => {
    try {
      const response = await fetch('/api/business/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      })

      if (response.ok) {
        setActiveBusinessId(businessId)
        showNotification('Empresa ativa alterada com sucesso!', 'success')
        // Recarregar dados do usuário
        window.location.reload()
      } else {
        const error = await response.json()
        showNotification(error.message || 'Erro ao alterar empresa ativa', 'error')
      }
    } catch (error) {
      console.error('Erro ao definir empresa ativa:', error)
      showNotification('Erro ao alterar empresa ativa', 'error')
    }
  }

  const canAddMore = businesses.length < 3

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                Minhas Empresas
              </h1>
              <p className="text-gray-600">
                Gerencie suas empresas cadastradas ({businesses.length}/3)
              </p>
            </div>
            
            {canAddMore && (
              <button
                onClick={() => router.push('/cadastrar-empresa')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md shadow-purple-500/20 font-medium"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Nova Empresa
              </button>
            )}
          </div>
        </div>

        {/* Empresas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {businesses.map((business) => (
            <div
              key={business.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ${
                activeBusinessId === business.id 
                  ? 'ring-2 ring-purple-500 shadow-xl' 
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Cover Image */}
              <div 
                className="h-32 bg-gradient-to-r from-purple-400 to-pink-400"
                style={business.coverImage ? {
                  backgroundImage: `url(${business.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              />

              {/* Content */}
              <div className="p-6">
                {/* Profile Image e Nome */}
                <div className="flex items-center gap-3 mb-4">
                  {business.profileImage ? (
                    <img
                      src={business.profileImage}
                      alt={business.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md -mt-8"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl -mt-8 border-2 border-white shadow-md">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 -mt-8">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{business.name}</h3>
                      {business.isVerified && (
                        <img 
                          src="/icons/verificado.png" 
                          alt="Verificado" 
                          className="w-4 h-4 object-contain"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{business.category}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                  {business.isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Aprovada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      <Settings className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                  
                  {activeBusinessId === business.id && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      Ativa
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  {activeBusinessId !== business.id && (
                    <button
                      onClick={() => handleSetActive(business.id)}
                      className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                    >
                      Definir como Ativa
                    </button>
                  )}
                  
                  <button
                    onClick={() => business.slug ? router.push(`/empresa/${business.slug}`) : router.push(`/empresa/${business.id}`)}
                    className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Página
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cadastrar Nova Empresa (se não tiver nenhuma ou se tiver menos de 3) */}
        {canAddMore && (
          <div className="text-center">
            <button
              onClick={() => router.push('/cadastrar-empresa')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Nova Empresa ({3 - businesses.length} restantes)
            </button>
          </div>
        )}

        {/* Mensagem de limite atingido */}
        {!canAddMore && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-800 font-medium">
              Você atingiu o limite máximo de 3 empresas cadastradas.
            </p>
          </div>
        )}

        {/* Mensagem quando não tem empresas */}
        {businesses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma empresa cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece cadastrando sua primeira empresa
            </p>
            <button
              onClick={() => router.push('/cadastrar-empresa')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md shadow-purple-500/20 font-medium"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Primeira Empresa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
