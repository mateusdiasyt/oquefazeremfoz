'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
}

export default function EmpresaDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businessLoading, setBusinessLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info')

  // Buscar usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    if (!loading && user && user.roles.includes('COMPANY')) {
      fetchBusiness()
    }
  }, [user, loading])

  // Buscar posts apenas depois que business estiver carregado
  useEffect(() => {
    if (business && !businessLoading) {
      fetchPosts()
    }
  }, [business, businessLoading])

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/business/profile')
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

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Empresa Não Encontrada</h1>
          <p className="text-gray-600 mb-4">Você ainda não cadastrou sua empresa.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard da Empresa</h1>
          <p className="text-gray-600">Gerencie sua empresa na plataforma OQFOZ</p>
        </div>

        {/* Tabs */}
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
              )}
            </nav>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'info' && (
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
