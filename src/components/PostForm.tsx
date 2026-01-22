'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Post {
  id: string
  title: string
  body: string
  imageUrl: string | null
  videoUrl: string | null
  createdAt?: string
  business?: {
    id: string
    name: string
    profileImage: string | null
  }
  likesCount?: number
  isLiked?: boolean
}

interface PostFormProps {
  businessId: string
  editPost?: Post
  onClose: () => void
  onPostCreated: () => void
}

export default function PostForm({ businessId, editPost, onClose, onPostCreated }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)

  // Atualizar estados quando editPost mudar
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title || '')
      setContent(editPost.body || '')
      setImageUrl(editPost.imageUrl || '')
      setVideoUrl(editPost.videoUrl || '')
      setMediaType(editPost.imageUrl ? 'image' : editPost.videoUrl ? 'video' : null)
      setShowImageInput(!!editPost.imageUrl)
      setShowVideoInput(!!editPost.videoUrl)
    } else {
      setTitle('')
      setContent('')
      setImageUrl('')
      setVideoUrl('')
      setMediaType(null)
      setShowImageInput(false)
      setShowVideoInput(false)
    }
  }, [editPost])

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title || '')
      setContent(editPost.body || '')
      setImageUrl(editPost.imageUrl || '')
      setVideoUrl(editPost.videoUrl || '')
      if (editPost.imageUrl) {
        setMediaType('image')
        setShowImageInput(true)
      } else if (editPost.videoUrl) {
        setMediaType('video')
        setShowVideoInput(true)
      }
    } else {
      // Resetar campos quando não está editando
      setTitle('')
      setContent('')
      setImageUrl('')
      setVideoUrl('')
      setMediaType(null)
      setShowImageInput(false)
      setShowVideoInput(false)
    }
  }, [editPost])

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
    
    // Validação: título é obrigatório
    if (!title.trim()) {
      setError('Título é obrigatório')
      return
    }
    
    // Validação: conteúdo, imagem ou vídeo é obrigatório (exceto se estiver editando e já tiver algum)
    if (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) {
      setError('Escreva algo ou adicione uma mídia para publicar')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = editPost ? `/api/posts/${editPost.id}` : '/api/posts'
      const method = editPost ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          title,
          body: content,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null
        }),
      })

      if (response.ok) {
        onPostCreated()
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            {editPost ? 'Editar Post' : 'Criar Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="post-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do post..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-400"
              rows={5}
              disabled={loading}
              style={{ letterSpacing: '-0.01em' }}
            />
          </div>
          
          {showImageInput && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escolher Imagem
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                    disabled={loading || uploading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB • Proporção: 4:3
                </p>
                {uploading && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-purple-600 font-medium">Enviando imagem...</p>
                  </div>
                )}
              </div>
              {imageUrl && (
                <div className="space-y-3">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{ aspectRatio: '4/3' }}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
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
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Remover imagem
                  </button>
                </div>
              )}
            </div>
          )}

          {showVideoInput && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escolher Vídeo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                    onChange={handleVideoFileChange}
                    className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                    disabled={loading || uploading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: MP4, AVI, MOV, WMV, WebM • Máximo: 64MB • Proporção: 4:3
                </p>
                {uploading && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-purple-600 font-medium">Enviando vídeo...</p>
                  </div>
                )}
              </div>
              {videoUrl && (
                <div className="space-y-3">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{ aspectRatio: '4/3' }}>
                    <video 
                      src={videoUrl} 
                      controls
                      className="w-full h-full object-cover"
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
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Remover vídeo
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleImageClick}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  showImageInput || mediaType === 'image'
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                disabled={uploading || loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold">Foto</span>
              </button>
              
              <button
                type="button"
                onClick={handleVideoClick}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  showVideoInput || mediaType === 'video'
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                disabled={uploading || loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold">Vídeo</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading || uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={loading || uploading || (!title.trim() || (!content.trim() && !imageUrl.trim() && !videoUrl.trim()))}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-500/30"
              >
                {loading ? 'Salvando...' : uploading ? 'Enviando...' : editPost ? 'Salvar alterações' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
