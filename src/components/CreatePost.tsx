'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import UrlPreview from './UrlPreview'
import { extractUrlsFromText } from '../utils/urlDetector'

interface CreatePostProps {
  onPostCreated?: () => void
}

interface Business {
  id: string
  name: string
  profileImage: string | null
  isApproved?: boolean
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  // Não renderizar para admins (admins não precisam criar posts)
  if (user?.roles?.includes('ADMIN') && !user?.roles?.includes('COMPANY')) {
    return null
  }

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (user?.roles?.includes('COMPANY')) {
        try {
          const response = await fetch('/api/business/my-businesses')
          if (response.ok) {
            const data = await response.json()
            const userBusinesses = data.businesses || []
            setBusinesses(userBusinesses)
            
            // Selecionar primeira empresa aprovada ou primeira disponível
            const approvedBusiness = userBusinesses.find((b: any) => b.isApproved)
            const defaultBusiness = approvedBusiness || userBusinesses[0]
            if (defaultBusiness) {
              setSelectedBusinessId(defaultBusiness.id)
              setBusiness(defaultBusiness)
            }
          }
        } catch (error) {
          console.error('Erro ao buscar empresas:', error)
        }
      }
    }

    fetchBusinesses()
  }, [user])

  // Atualizar business quando selecionar outra empresa
  useEffect(() => {
    if (selectedBusinessId && businesses.length > 0) {
      const selected = businesses.find(b => b.id === selectedBusinessId)
      if (selected) {
        setBusiness(selected)
      }
    }
  }, [selectedBusinessId, businesses])

  const handleImageClick = () => {
    setShowImageInput(!showImageInput)
    setShowVideoInput(false)
    if (!showImageInput) {
      setImageUrl('')
      setMediaType(null)
    } else {
      setMediaType('image')
    }
  }

  const handleVideoClick = () => {
    setShowVideoInput(!showVideoInput)
    setShowImageInput(false)
    if (!showVideoInput) {
      setVideoUrl('')
      setMediaType(null)
    } else {
      setMediaType('video')
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError('')

    // Validação de tamanho no frontend
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    const maxSize = isImage ? 5 * 1024 * 1024 : 64 * 1024 * 1024 // 5MB para imagens, 64MB para vídeos

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${isImage ? '5MB' : '64MB'}`)
      setUploading(false)
      return
    }

    // Validação de tipo no frontend
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
    
    if (isImage && !allowedImageTypes.includes(file.type)) {
      setError('Tipo de imagem não suportado. Use: JPG, PNG, GIF ou WebP')
      setUploading(false)
      return
    }
    
    if (isVideo && !allowedVideoTypes.includes(file.type)) {
      setError('Tipo de vídeo não suportado. Use: MP4, AVI, MOV, WMV ou WebM')
      setUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          
          if (data.type === 'image') {
            setImageUrl(data.url)
            setMediaType('image')
          } else if (data.type === 'video') {
            setVideoUrl(data.url)
            setMediaType('video')
          }
        }
      } else {
        const text = await response.text()
        if (text) {
          const errorData = JSON.parse(text)
          setError(errorData.message || 'Erro no upload')
        } else {
          setError('Erro no upload')
        }
      }
    } catch (error) {
      setError('Erro no upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) {
      setError('Escreva algo ou adicione uma mídia para publicar')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (!selectedBusinessId) {
        setError('Selecione uma empresa para publicar')
        setLoading(false)
        return
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: selectedBusinessId,
          title: content.substring(0, 100) || (mediaType === 'image' ? 'Imagem compartilhada' : 'Vídeo compartilhado'),
          body: content || null,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null
        }),
      })

      if (response.ok) {
        setContent('')
        setImageUrl('')
        setVideoUrl('')
        setShowImageInput(false)
        setShowVideoInput(false)
        setMediaType(null)
        if (onPostCreated) {
          onPostCreated()
        }
      } else {
        const text = await response.text()
        if (text) {
          const errorData = JSON.parse(text)
          setError(errorData.message || 'Erro ao publicar')
        } else {
          setError('Erro ao publicar')
        }
      }
    } catch (error) {
      setError('Erro ao publicar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 mb-6">
      <div className="flex items-start space-x-3">
        {/* Avatar da empresa */}
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
          {business?.profileImage ? (
            <img
              src={business.profileImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : business?.name ? (
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-base">
              {business.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-base">
              E
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Seletor de Empresa (se tiver múltiplas) - Design moderno e minimalista */}
          {businesses.length > 1 && (
            <div className="mb-3">
              <div className="relative inline-block">
                <select
                  value={selectedBusinessId || ''}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="appearance-none bg-transparent border-0 text-sm font-semibold text-gray-900 pr-6 focus:outline-none cursor-pointer hover:text-purple-600 transition-colors"
                >
                  {businesses
                    .filter((b: any) => b.isApproved) // Apenas empresas aprovadas
                    .map((b: Business) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {businesses.filter((b: any) => b.isApproved).length === 0 && (
                <p className="text-xs text-amber-500 mt-1.5 font-normal">
                  Nenhuma empresa aprovada. Aguarde a aprovação para publicar.
                </p>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full px-5 py-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all duration-200 text-sm"
              rows={3}
              disabled={loading}
              style={{ letterSpacing: '-0.01em' }}
            />
            
            {/* Preview de links detectados */}
            {content && extractUrlsFromText(content).urls.length > 0 && !imageUrl && !videoUrl && (
              <div className="mt-4">
                {extractUrlsFromText(content).urls.map((url, index) => (
                  <UrlPreview key={index} url={url} />
                ))}
              </div>
            )}
            
            {showImageInput && (
              <div className="mt-4 animate-slide-up">
                <div className="mb-4">
                  <label className="block text-sm font-display font-semibold text-dark-200 mb-3">
                    Escolher Imagem
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageFileChange}
                    className="input w-full"
                    disabled={loading || uploading}
                  />
                  <p className="text-xs text-dark-500 mt-2">
                    Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB • Proporção: 4:3
                  </p>
                  {uploading && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-primary-400">Enviando imagem...</p>
                    </div>
                  )}
                </div>
                {imageUrl && (
                  <div className="mt-3">
                    <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-medium" style={{ aspectRatio: '4/3' }}>
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('')
                        setMediaType(null)
                      }}
                      className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>
            )}

            {showVideoInput && (
              <div className="mt-4 animate-slide-up">
                <div className="mb-4">
                  <label className="block text-sm font-display font-semibold text-dark-200 mb-3">
                    Escolher Vídeo
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={handleVideoFileChange}
                    className="input w-full"
                    disabled={loading || uploading}
                  />
                  <p className="text-xs text-dark-500 mt-2">
                    Formatos: MP4, AVI, MOV, WMV, WebM • Máximo: 64MB • Proporção: 4:3
                  </p>
                  {uploading && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-primary-400">Enviando vídeo...</p>
                    </div>
                  )}
                </div>
                {videoUrl && (
                  <div className="mt-3">
                    <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-medium" style={{ aspectRatio: '4/3' }}>
                      <video 
                        src={videoUrl} 
                        controls
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUrl('')
                        setMediaType(null)
                      }}
                      className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Remover vídeo
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    showImageInput || mediaType === 'image'
                      ? 'text-purple-600' 
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                  disabled={uploading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Foto</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleVideoClick}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    showVideoInput || mediaType === 'video'
                      ? 'text-purple-600' 
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                  disabled={uploading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Vídeo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || uploading || (!content.trim() && !imageUrl.trim() && !videoUrl.trim())}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-purple-500/20 hover:shadow-md text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                {loading ? 'Publicando...' : uploading ? 'Enviando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
