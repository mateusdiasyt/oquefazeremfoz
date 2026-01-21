'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import CreatePost from '../../../../components/CreatePost'
import PostCard from '../../../../components/PostCard'

interface Business {
  id: string
  name: string
  description: string | null
  category: string
  address: string
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  whatsapp: string | null
  isApproved: boolean
  approvedAt: string | null
  createdAt: string
  followersCount?: number
  followingCount?: number
  likesCount?: number
}

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
  likesCount?: number
  commentsCount?: number
}

export default function EmpresaDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth() // Usar contexto ao invés de buscar novamente
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessLoading, setBusinessLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'posts' | 'analytics'>('info')

  useEffect(() => {
    if (!loading && user && user.roles?.includes('COMPANY')) {
      fetchBusinesses()
    }
  }, [user, loading])

  // Quando selecionar uma empresa ou quando empresas forem carregadas, buscar dados
  useEffect(() => {
    if (selectedBusinessId && businesses.length > 0) {
      fetchBusinessData(selectedBusinessId)
    } else if (businesses.length > 0 && !selectedBusinessId) {
      // Selecionar primeira empresa por padrão
      setSelectedBusinessId(businesses[0].id)
    }
  }, [selectedBusinessId, businesses])

  // Buscar posts apenas depois que business estiver carregado
  useEffect(() => {
    if (business && !businessLoading) {
      fetchPosts()
    }
  }, [business, businessLoading])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/business/my-businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
        // Selecionar primeira empresa automaticamente
        if (data.businesses && data.businesses.length > 0) {
          setSelectedBusinessId(data.businesses[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      setBusinessLoading(false)
    }
  }

  const fetchBusinessData = async (businessId: string) => {
    try {
      setBusinessLoading(true)
      const response = await fetch(`/api/business/profile?id=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.business)
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error)
    } finally {
      setBusinessLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      if (!business?.id) {
        setPostsLoading(false)
        return
      }
      
      const response = await fetch(`/api/posts?businessId=${business.id}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!user.roles.includes('COMPANY')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Esta área é exclusiva para empresas.</p>
          <button
            onClick={() => router.push('/register')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Cadastrar Empresa
          </button>
        </div>
      </div>
    )
  }

  // Se não tem empresas, mostrar mensagem
  if (!loading && businesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nenhuma Empresa Cadastrada</h1>
          <p className="text-gray-600 mb-6">
            Cadastre sua primeira empresa para começar a usar o dashboard.
          </p>
          <button
            onClick={() => router.push('/cadastrar-empresa')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
          >
            Cadastrar Empresa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard da Empresa</h1>
              <p className="text-gray-600">Gerencie suas empresas na plataforma OQFOZ</p>
            </div>
            
            {/* Seletor de Empresa */}
            {businesses.length > 1 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Empresa:</label>
                <select
                  value={selectedBusinessId || ''}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {business && (
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações
                </button>
                {business.isApproved && (
                  <>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'analytics'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'posts'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Publicações
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Conteúdo das abas */}
        {activeTab === 'info' && business && (
          <>
            {/* Status da Aprovação */}
            <div className={`mb-8 p-4 rounded-lg ${business.isApproved ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {business.isApproved ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${business.isApproved ? 'text-green-800' : 'text-yellow-800'}`}>
                {business.isApproved ? 'Empresa Aprovada' : 'Aguardando Aprovação'}
              </h3>
              <div className={`mt-1 text-sm ${business.isApproved ? 'text-green-700' : 'text-yellow-700'}`}>
                {business.isApproved ? (
                  <p>Sua empresa foi aprovada e está ativa na plataforma!</p>
                ) : (
                  <div className="space-y-2">
                    <p>Sua empresa está em processo de validação. Você receberá um email quando for aprovada.</p>
                    <p className="text-xs text-yellow-600">
                      <strong>Nota:</strong> A aba "Publicações" ficará disponível após a aprovação da empresa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informações da Empresa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Empresa</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-gray-900">{business.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Categoria</label>
                <p className="text-gray-900">{business.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Endereço</label>
                <p className="text-gray-900">{business.address}</p>
              </div>
              {business.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900">{business.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contato</h2>
            <div className="space-y-4">
              {business.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900">{business.phone}</p>
                </div>
              )}
              {business.whatsapp && (
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                  <p className="text-gray-900">{business.whatsapp}</p>
                </div>
              )}
              {business.website && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    {business.website}
                  </a>
                </div>
              )}
              {business.instagram && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Instagram</label>
                  <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    @{business.instagram}
                  </a>
                </div>
              )}
              {business.facebook && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Facebook</label>
                  <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    facebook.com/{business.facebook}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Ações */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => router.push('/empresa/editar')}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Editar Empresa
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Voltar ao Site
              </button>
            </div>
          </>
        )}

        {activeTab === 'analytics' && business && (
          <div className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Seguidores</p>
                    <p className="text-2xl font-semibold text-gray-900">{business.followersCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Likes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {posts.reduce((sum, post) => sum + (post.likesCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Publicações</p>
                    <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Comentários</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Posts ao Longo do Tempo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publicações ao Longo do Tempo</h3>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.slice(0, 10).map((post, index) => {
                    const date = new Date(post.createdAt)
                    const monthDay = `${date.getDate()}/${date.getMonth() + 1}`
                    return (
                      <div key={post.id} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-500">{monthDay}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {post.likesCount || 0} likes
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma publicação ainda para exibir gráficos.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="max-w-4xl mx-auto">
            {/* Criar Post */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Lista de Posts */}
            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Carregando publicações...</div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={handlePostCreated} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma publicação ainda.</p>
                <p className="text-gray-400 text-sm">Crie sua primeira publicação acima!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
