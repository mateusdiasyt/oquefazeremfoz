'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface CreatePostProps {
  onPostCreated?: () => void
}

interface Business {
  id: string
  name: string
  profileImage: string | null
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

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (user?.businessId) {
        try {
          const response = await fetch('/api/business/profile')
          if (response.ok) {
            const data = await response.json()
            setBusiness(data.business)
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error)
        }
      }
    }

    fetchBusinessData()
  }, [user])

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
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
    <div className="card p-6 mb-6 animate-fade-in">
      <div className="flex items-start space-x-4">
        {/* Avatar da empresa */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-glow">
          {business?.profileImage ? (
            <img
              src={business.profileImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : business?.name ? (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-lg">
              {business.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-lg">
              E
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="input w-full resize-none"
              rows={3}
              disabled={loading}
            />
            
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
              <div className="mt-3 p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-6">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className={`flex items-center space-x-2 transition-all duration-300 hover:scale-105 ${
                    showImageInput || mediaType === 'image'
                      ? 'text-primary-400' 
                      : 'text-dark-400 hover:text-primary-400'
                  }`}
                  disabled={uploading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Foto</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleVideoClick}
                  className={`flex items-center space-x-2 transition-all duration-300 hover:scale-105 ${
                    showVideoInput || mediaType === 'video'
                      ? 'text-primary-400' 
                      : 'text-dark-400 hover:text-primary-400'
                  }`}
                  disabled={uploading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Vídeo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || uploading || (!content.trim() && !imageUrl.trim() && !videoUrl.trim())}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
