'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/NotificationContext'
import { 
  User, 
  Mail, 
  Camera, 
  Star, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Heart
} from 'lucide-react'

interface UserReview {
  id: string
  rating: number
  comment: string
  imageUrl: string | null
  createdAt: string
  business: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
  }
}

interface UserFollow {
  id: string
  business: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
    category: string
  }
  createdAt: string
}


export default function PerfilPage() {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [follows, setFollows] = useState<UserFollow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name || '')
  const [emailValue, setEmailValue] = useState(user?.email || '')
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Buscar avaliações do usuário
      const reviewsResponse = await fetch('/api/user/reviews')
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews || [])
      } else {
        const errorData = await reviewsResponse.json()
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Erro ao buscar avaliações:', errorData)
        }
      }

      // Buscar empresas seguidas
      const followsResponse = await fetch('/api/user/follows')
      
      if (followsResponse.ok) {
        const followsData = await followsResponse.json()
        setFollows(followsData.follows || [])
      } else {
        const errorData = await followsResponse.json()
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Erro ao buscar empresas seguidas:', errorData)
        }
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar dados do usuário:', error)
      }
      showNotification('Erro ao carregar dados do perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Apenas imagens são permitidas', 'error')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showNotification('Arquivo muito grande. Máximo 5MB', 'error')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.profileImage)
        showNotification('Foto de perfil atualizada com sucesso!', 'success')
      } else {
        const err = await response.json().catch(() => ({}))
        showNotification(err?.message || 'Erro ao atualizar foto de perfil', 'error')
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      showNotification('Erro ao fazer upload da foto', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateName = async () => {
    if (!nameValue.trim()) {
      showNotification('Nome não pode estar vazio', 'error')
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() })
      })

      if (response.ok) {
        showNotification('Nome atualizado com sucesso!', 'success')
        setEditingName(false)
      } else {
        showNotification('Erro ao atualizar nome', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar nome', 'error')
    }
  }

  const handleUpdateEmail = async () => {
    if (!emailValue.trim()) {
      showNotification('Email não pode estar vazio', 'error')
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue.trim() })
      })

      if (response.ok) {
        showNotification('Email atualizado com sucesso!', 'success')
        setEditingEmail(false)
      } else {
        showNotification('Erro ao atualizar email', 'error')
      }
    } catch (error) {
      showNotification('Erro ao atualizar email', 'error')
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <p className="text-gray-600 text-lg">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Perfil */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Foto de Perfil */}
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <label className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors shadow-lg">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleProfileImageUpload(e.target.files[0])}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* Informações do Usuário */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.name || 'Usuário'}
                </h1>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                >
                  <Edit3 size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Nome */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  {editingProfile && editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Seu nome"
                      />
                      <button
                        onClick={handleUpdateName}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false)
                          setNameValue(user?.name || '')
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user?.name || 'Nome não informado'}</span>
                      {editingProfile && (
                        <button
                          onClick={() => setEditingName(true)}
                          className="p-1 text-gray-400 hover:text-pink-600 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  {editingProfile && editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Seu email"
                      />
                      <button
                        onClick={handleUpdateEmail}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEmail(false)
                          setEmailValue(user?.email || '')
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user?.email}</span>
                      {editingProfile && (
                        <button
                          onClick={() => setEditingEmail(true)}
                          className="p-1 text-gray-400 hover:text-pink-600 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Data de Cadastro - Removido pois createdAt não está disponível no tipo User */}
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{reviews.length}</h3>
            <p className="text-gray-600">Avaliações</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{follows.length}</h3>
            <p className="text-gray-600">Empresas Seguidas</p>
          </div>
        </div>


        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {/* Avaliações */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Suas Avaliações</h2>
            {reviews.length === 0 ? (
              <div className="card p-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma avaliação ainda
                </h3>
                <p className="text-gray-500">
                  Comece a avaliar empresas para ver suas avaliações aqui!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                        {review.business.profileImage ? (
                          <img 
                            src={review.business.profileImage} 
                            alt={review.business.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-semibold border-2 border-purple-200">
                            {review.business.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{review.business.name}</h4>
                          {review.business.isVerified && (
                            <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(review.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                        )}
                        
                        {review.imageUrl && (
                          <img
                            src={review.imageUrl}
                            alt="Avaliação"
                            className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empresas Seguidas */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Empresas que Você Segue</h2>
            {follows.length === 0 ? (
              <div className="card p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma empresa seguida
                </h3>
                <p className="text-gray-500">
                  Comece a seguir empresas para vê-las aqui!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {follows.map((follow) => (
                  <div key={follow.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                        {follow.business.profileImage ? (
                          <img 
                            src={follow.business.profileImage} 
                            alt={follow.business.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-semibold border-2 border-purple-200">
                            {follow.business.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{follow.business.name}</h4>
                          {follow.business.isVerified && (
                            <div className="flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{follow.business.category}</p>
                        <p className="text-xs text-gray-500">
                          Seguindo desde {new Date(follow.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
