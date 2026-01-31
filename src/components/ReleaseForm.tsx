'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import SEOPanel from './SEOPanel'

interface Release {
  id: string
  title: string
  slug: string
  lead: string | null
  body: string
  featuredImageUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

interface ReleaseFormProps {
  businessId: string
  editRelease?: Release | null
  onClose: () => void
  onReleaseCreated: () => void
}

export default function ReleaseForm({ businessId, editRelease, onClose, onReleaseCreated }: ReleaseFormProps) {
  const [title, setTitle] = useState('')
  const [lead, setLead] = useState('')
  const [body, setBody] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editRelease) {
      setTitle(editRelease.title)
      setLead(editRelease.lead || '')
      const b = editRelease.body
      setBody(b && b.trim().startsWith('<') ? b : (b ? `<p>${b.replace(/\n/g, '</p><p>')}</p>` : ''))
      setIsPublished(editRelease.isPublished)
      setFeaturedImagePreview(editRelease.featuredImageUrl || '')
    } else {
      setTitle('')
      setLead('')
      setBody('')
      setIsPublished(true)
      setFeaturedImageFile(null)
      setFeaturedImagePreview('')
    }
  }, [editRelease])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFeaturedImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setFeaturedImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Título é obrigatório')
      return
    }
    const bodyText = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!bodyText) {
      setError('Corpo do texto é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (editRelease) {
        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('lead', lead.trim())
        formData.append('body', body.trim())
        formData.append('isPublished', String(isPublished))
        if (featuredImageFile) formData.append('featuredImage', featuredImageFile)

        const response = await fetch(`/api/business/releases/${editRelease.id}`, {
          method: 'PATCH',
          body: formData
        })
        if (response.ok) {
          onReleaseCreated()
        } else {
          const data = await response.json()
          setError(data.message || 'Erro ao atualizar')
        }
      } else {
        const formData = new FormData()
        formData.append('businessId', businessId)
        formData.append('title', title.trim())
        formData.append('lead', lead.trim())
        formData.append('body', body.trim())
        formData.append('isPublished', String(isPublished))
        if (featuredImageFile) formData.append('featuredImage', featuredImageFile)

        const response = await fetch('/api/business/releases', {
          method: 'POST',
          body: formData
        })
        if (response.ok) {
          onReleaseCreated()
        } else {
          const data = await response.json()
          setError(data.message || 'Erro ao criar')
        }
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            {editRelease ? 'Editar Release' : 'Nova Release'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reabertura do restaurante com novo cardápio"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chamada / Resumo</label>
            <input
              type="text"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="1-2 frases que aparecem no card (opcional)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Corpo do texto *</label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Escreva o conteúdo completo da notícia ou artigo..."
              minHeight="220px"
              disabled={loading}
            />
            <div className="mt-3">
              <SEOPanel title={title} lead={lead} bodyHtml={body} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem de destaque</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP. Máximo 5MB.</p>
            {featuredImagePreview && (
              <img src={featuredImagePreview} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-xl border border-gray-200" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
              Publicar imediatamente
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editRelease ? 'Atualizar' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
