'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocale } from '../contexts/LocaleContext'
import { getTranslations } from '../lib/translations'

interface Guide {
  id: string
  name: string
  slug: string | null
  profileImage: string | null
  isVerified: boolean
  isApproved: boolean
}

interface CreatePostGuideProps {
  onPostCreated?: () => void
}

export default function CreatePostGuide({ onPostCreated }: CreatePostGuideProps) {
  const { user } = useAuth()
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoPreview, setVideoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const createPostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchGuide = async () => {
      if (user?.roles?.includes('GUIDE')) {
        try {
          const res = await fetch('/api/guide/me')
          if (res.ok) {
            const data = await res.json()
            setGuide(data.guide || null)
          }
        } catch {
          setGuide(null)
        }
      }
    }
    fetchGuide()
  }, [user])

  if (!user?.roles?.includes('GUIDE') || !guide) return null
  if (!guide.isApproved) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 md:p-5 mb-6">
        <p className="text-sm text-amber-600 font-medium">
          Seu perfil de guia está aguardando aprovação para publicar.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const title = postTitle.trim() || content.trim().slice(0, 100) || (imageFile || imagePreview ? 'Imagem compartilhada' : videoFile || videoPreview ? 'Vídeo compartilhado' : '')
    if (!title.trim() && !content.trim() && !imageFile && !imagePreview && !videoFile && !videoPreview) {
      setError('Escreva algo ou adicione uma mídia para publicar')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('guideId', guide.id)
      formData.append('title', title.trim() || 'Publicação')
      formData.append('body', content.trim() || '')
      if (imageFile) formData.append('image', imageFile)
      if (videoFile) formData.append('video', videoFile)
      const res = await fetch('/api/guide/posts', { method: 'POST', body: formData })
      if (res.ok) {
        setContent('')
        setPostTitle('')
        setImageFile(null)
        setVideoFile(null)
        setImagePreview('')
        setVideoPreview('')
        setShowImageInput(false)
        setShowVideoInput(false)
        setExpanded(false)
        onPostCreated?.()
      } else {
        const data = await res.json()
        setError(data.message || 'Erro ao publicar')
      }
    } catch {
      setError('Erro ao publicar')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      setVideoFile(null)
      setVideoPreview('')
    }
  }
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 50 * 1024 * 1024) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setImageFile(null)
      setImagePreview('')
    }
  }

  if (!expanded) {
    return (
      <div ref={createPostRef} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 md:p-5 mb-6">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 text-left rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/40 transition-all duration-200 px-4 py-3"
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {guide.profileImage ? (
              <img src={guide.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
                {guide.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="flex-1 text-gray-500 text-sm" style={{ letterSpacing: '-0.01em' }}>
            {t.home.whatAreYouThinking}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div ref={createPostRef} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
          {guide.profileImage ? (
            <img src={guide.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200">
              {guide.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-end mb-1">
            <button type="button" onClick={() => setExpanded(false)} className="text-xs font-medium text-gray-500 hover:text-gray-700">
              Minimizar
            </button>
          </div>
          <div className="mb-4">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2" style={{ letterSpacing: '0.05em' }}>
              Publicar como
            </span>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                {guide.profileImage ? (
                  <img src={guide.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-sm">
                    {guide.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="font-semibold text-gray-900 truncate" style={{ letterSpacing: '-0.01em' }}>
                {guide.name}
              </span>
              {guide.isVerified && (
                <img src="/icons/verificado.png" alt="Verificado" className="w-5 h-5 object-contain flex-shrink-0" />
              )}
            </div>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 w-fit">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-purple-600 shadow-sm">Post</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
              disabled={loading}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.home.whatAreYouThinking}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 text-sm"
              rows={4}
              disabled={loading}
            />
            {showImageInput && (
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700" disabled={loading} />
                {imagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={imagePreview} alt="" className="max-h-40 rounded-xl object-cover border border-gray-200" />
                    <button type="button" onClick={() => { setImagePreview(''); setImageFile(null) }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg text-xs">Remover</button>
                  </div>
                )}
              </div>
            )}
            {showVideoInput && (
              <div>
                <input type="file" accept="video/*" onChange={handleVideoChange} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700" disabled={loading} />
                {videoPreview && (
                  <div className="mt-2 relative">
                    <video src={videoPreview} controls className="max-w-md rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => { setVideoPreview(''); setVideoFile(null) }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg text-xs">Remover</button>
                  </div>
                )}
              </div>
            )}
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-600 text-sm font-medium">{error}</p></div>}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <button type="button" onClick={() => { setShowImageInput(!showImageInput); setShowVideoInput(false) }} className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${showImageInput ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`} disabled={loading}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-semibold">Foto</span>
                </button>
                <button type="button" onClick={() => { setShowVideoInput(!showVideoInput); setShowImageInput(false) }} className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${showVideoInput ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`} disabled={loading}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-semibold">Vídeo</span>
                </button>
              </div>
              <button type="submit" disabled={loading || (!postTitle.trim() && !content.trim() && !imageFile && !imagePreview && !videoFile && !videoPreview)} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-500/30 text-sm">
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
