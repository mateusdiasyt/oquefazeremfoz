'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import UrlPreview from './UrlPreview'
import RichTextEditor from './RichTextEditor'
import SEOPanel from './SEOPanel'
import { extractUrlsFromText } from '../utils/urlDetector'

interface CreatePostProps {
  onPostCreated?: () => void
  onReleaseCreated?: () => void
}

interface Business {
  id: string
  name: string
  profileImage: string | null
  isApproved?: boolean
}

type PublishType = 'post' | 'release'

export default function CreatePost({ onPostCreated, onReleaseCreated }: CreatePostProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [publishType, setPublishType] = useState<PublishType>('post')
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
  // Release
  const [releaseTitle, setReleaseTitle] = useState('')
  const [releaseLead, setReleaseLead] = useState('')
  const [releaseBody, setReleaseBody] = useState('')
  const [releaseImageFile, setReleaseImageFile] = useState<File | null>(null)
  const [releaseImagePreview, setReleaseImagePreview] = useState('')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const createPostRef = useRef<HTMLDivElement>(null)

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

  // Fechar seletor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false)
      }
    }
    if (selectorOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectorOpen])

  // Fechar área expandida ao clicar fora, só se o formulário estiver vazio
  useEffect(() => {
    const isBodyEmpty = (html: string) => !html || !html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const handleClickOutside = (e: MouseEvent) => {
      if (!expanded) return
      const target = e.target as Node
      if (createPostRef.current?.contains(target)) return
      const releaseBodyEmpty = isBodyEmpty(releaseBody)
      const isEmpty =
        !content.trim() &&
        !imageUrl &&
        !videoUrl &&
        !releaseTitle.trim() &&
        !releaseLead.trim() &&
        releaseBodyEmpty &&
        !releaseImagePreview
      if (isEmpty) setExpanded(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [expanded, content, imageUrl, videoUrl, releaseTitle, releaseLead, releaseBody, releaseImagePreview])

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
    const maxSize = isImage ? 5 * 1024 * 1024 : 32 * 1024 * 1024 // 5MB para imagens, 32MB para vídeos

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${isImage ? '5MB' : '32MB'}`)
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
    setError('')

    if (publishType === 'release') {
      if (!releaseTitle.trim()) {
        setError('Título da release é obrigatório')
        return
      }
      const bodyText = releaseBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      if (!bodyText) {
        setError('Corpo do texto é obrigatório')
        return
      }
      if (!selectedBusinessId) {
        setError('Selecione uma empresa para publicar')
        return
      }
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('businessId', selectedBusinessId)
        formData.append('title', releaseTitle.trim())
        formData.append('lead', releaseLead.trim())
        formData.append('body', releaseBody.trim())
        formData.append('isPublished', 'true')
        if (releaseImageFile) formData.append('featuredImage', releaseImageFile)

        const response = await fetch('/api/business/releases', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          setReleaseTitle('')
          setReleaseLead('')
          setReleaseBody('')
          setReleaseImageFile(null)
          setReleaseImagePreview('')
          setExpanded(false)
          onReleaseCreated?.()
        } else {
          const data = await response.json()
          setError(data.message || 'Erro ao publicar release')
        }
      } catch {
        setError('Erro ao publicar release')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!content.trim() && !imageUrl.trim() && !videoUrl.trim()) {
      setError('Escreva algo ou adicione uma mídia para publicar')
      return
    }

    setLoading(true)

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
        setExpanded(false)
        onPostCreated?.()
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

  const handleReleaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são permitidas')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo 5MB')
        return
      }
      setReleaseImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setReleaseImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const approvedBusinesses = businesses.filter((b: any) => b.isApproved)

  // Vista compacta: só avatar + "No que você está pensando?" — ao clicar expande
  if (!expanded) {
    return (
      <div ref={createPostRef} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 md:p-5 mb-6">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 text-left rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/40 transition-all duration-200 px-4 py-3"
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {business?.profileImage ? (
              <img src={business.profileImage} alt={business?.name || ''} className="w-full h-full object-cover" />
            ) : business?.name ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
                {business.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
                E
              </div>
            )}
          </div>
          <span className="flex-1 text-gray-500 text-sm" style={{ letterSpacing: '-0.01em' }}>
            No que você está pensando?
          </span>
        </button>
        {approvedBusinesses.length === 0 && (
          <p className="text-xs text-amber-600 font-medium mt-2 px-1">
            Nenhuma empresa aprovada. Aguarde a aprovação para publicar.
          </p>
        )}
      </div>
    )
  }

  return (
    <div ref={createPostRef} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 mb-6">
      <div className="flex items-start space-x-4">
        {/* Avatar da empresa */}
        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
          {business?.profileImage ? (
            <img src={business.profileImage} alt={business?.name || ''} className="w-full h-full object-cover" />
          ) : business?.name ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
              {business.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
              E
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Botão minimizar */}
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Minimizar
            </button>
          </div>
          {/* Seletor de página / empresa - moderno e visível */}
          {approvedBusinesses.length > 0 && (
            <div className="mb-4" ref={selectorRef}>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2" style={{ letterSpacing: '0.05em' }}>
                Publicar como
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => approvedBusinesses.length > 1 && setSelectorOpen(!selectorOpen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectorOpen
                      ? 'border-purple-400 bg-purple-50/80 ring-2 ring-purple-200'
                      : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/50'
                  } ${approvedBusinesses.length === 1 ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                    {business?.profileImage ? (
                      <img src={business.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-sm">
                        {business?.name?.charAt(0).toUpperCase() || 'E'}
                      </div>
                    )}
                  </div>
                  <span className="flex-1 font-semibold text-gray-900 truncate" style={{ letterSpacing: '-0.01em' }}>
                    {business?.name || 'Selecione uma empresa'}
                  </span>
                  {approvedBusinesses.length > 1 && (
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${selectorOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {selectorOpen && approvedBusinesses.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {approvedBusinesses.map((b: Business) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBusinessId(b.id)
                          setSelectorOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selectedBusinessId === b.id ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                          {b.profileImage ? (
                            <img src={b.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xs">
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium truncate text-sm">{b.name}</span>
                        {selectedBusinessId === b.id && (
                          <svg className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {approvedBusinesses.length === 0 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">
                Nenhuma empresa aprovada. Aguarde a aprovação para publicar.
              </p>
            </div>
          )}

          {/* Abas Post | Release */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 w-fit">
            <button
              type="button"
              onClick={() => setPublishType('post')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                publishType === 'post'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setPublishType('release')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                publishType === 'release'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Release
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {publishType === 'release' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="Ex: Reabertura do restaurante com novo cardápio"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chamada / Resumo</label>
                  <input
                    type="text"
                    value={releaseLead}
                    onChange={(e) => setReleaseLead(e.target.value)}
                    placeholder="1-2 frases que aparecem no card (opcional)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Corpo do texto *</label>
                  <RichTextEditor
                    value={releaseBody}
                    onChange={setReleaseBody}
                    placeholder="Escreva o conteúdo completo da notícia ou artigo..."
                    minHeight="220px"
                    disabled={loading}
                  />
                  <div className="mt-3">
                    <SEOPanel title={releaseTitle} lead={releaseLead} bodyHtml={releaseBody} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem de destaque</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleReleaseImageChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-purple-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading || uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP. Máximo 5MB.</p>
                  {releaseImagePreview && (
                    <div className="mt-3 relative rounded-2xl overflow-hidden border border-gray-200" style={{ maxHeight: 200 }}>
                      <img src={releaseImagePreview} alt="Preview" className="w-full h-full object-cover" style={{ maxHeight: 200 }} />
                      <button
                        type="button"
                        onClick={() => { setReleaseImagePreview(''); setReleaseImageFile(null) }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg text-xs font-medium hover:bg-black/70"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm"
              rows={4}
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
                    Formatos: MP4, AVI, MOV, WMV, WebM • Máximo: 32MB • Proporção: 4:3
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

              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                {publishType === 'post' && (
                <>
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
                </>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading || uploading ||
                  (publishType === 'post' && !content.trim() && !imageUrl.trim() && !videoUrl.trim()) ||
                  (publishType === 'release' && (!releaseTitle.trim() || !releaseBody.trim()))
                }
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-500/30 text-sm"
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
