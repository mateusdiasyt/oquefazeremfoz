'use client'

import { useState, useEffect } from 'react'
import { upload } from '@vercel/blob/client'
import { useNotification } from '../../../contexts/NotificationContext'
import { Plus, Edit2, Trash2, Play, CheckCircle2, XCircle, X, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react'

interface FozTVVideo {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  isPublished: boolean
  order: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminFozTVPage() {
  const { showNotification } = useNotification()
  const [videos, setVideos] = useState<FozTVVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FozTVVideo | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    isPublished: true,
    order: 0
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/foztv')
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos FozTV:', error)
      showNotification('Erro ao carregar vídeos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      showNotification('Selecione um arquivo de vídeo (MP4, WebM, etc.)', 'error')
      return
    }
    setUploadingVideo(true)
    try {
      // Upload direto do navegador para o Vercel Blob (sem limite de 4 MB)
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/foztv/upload',
        multipart: true, // permite vídeos grandes (até 5 TB)
      })
      setFormData((p) => ({ ...p, videoUrl: blob.url }))
      showNotification('Vídeo enviado com sucesso', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar vídeo'
      showNotification(msg, 'error')
    } finally {
      setUploadingVideo(false)
      e.target.value = ''
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showNotification('Selecione uma imagem para a thumbnail', 'error')
      return
    }
    setUploadingThumb(true)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/foztv/upload',
      })
      setFormData((p) => ({ ...p, thumbnailUrl: blob.url }))
      showNotification('Thumbnail enviada', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar thumbnail'
      showNotification(msg, 'error')
    } finally {
      setUploadingThumb(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      showNotification('Título e vídeo são obrigatórios (envie um arquivo ou cole um link)', 'error')
      return
    }
    try {
      const url = editing ? `/api/admin/foztv/${editing.id}` : '/api/admin/foztv'
      const method = editing ? 'PUT' : 'POST'
      const body = editing
        ? { ...formData, order: Number(formData.order) }
        : { ...formData, order: Number(formData.order) }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        showNotification(editing ? 'Vídeo atualizado!' : 'Vídeo publicado!', 'success')
        setShowForm(false)
        setEditing(null)
        setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', isPublished: true, order: 0 })
        fetchVideos()
      } else {
        const data = await res.json()
        showNotification(data.message || 'Erro ao salvar', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar vídeo FozTV:', error)
      showNotification('Erro ao salvar vídeo', 'error')
    }
  }

  const handleEdit = (video: FozTVVideo) => {
    setEditing(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      isPublished: video.isPublished,
      order: video.order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este vídeo do FozTV?')) return
    try {
      const res = await fetch(`/api/admin/foztv/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showNotification('Vídeo removido', 'success')
        fetchVideos()
      } else {
        showNotification('Erro ao remover', 'error')
      }
    } catch (error) {
      showNotification('Erro ao remover vídeo', 'error')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', isPublished: true, order: 0 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FozTV</h1>
          <p className="text-gray-600 text-sm mt-1">Vídeos sobre Foz do Iguaçu publicados no canal</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/foztv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
            Ver FozTV
          </a>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Novo vídeo
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? 'Editar vídeo' : 'Publicar vídeo'}
            </h2>
            <button type="button" onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Conheça as Cataratas do Iguaçu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vídeo *</label>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-indigo-400 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                  {uploadingVideo ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <Upload className="w-4 h-4 text-indigo-600" />
                  )}
                  <span className="text-sm text-gray-600">{uploadingVideo ? 'Enviando…' : 'Enviar vídeo (sem limite de 4 MB)'}</span>
                </label>
              </div>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData((p) => ({ ...p, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ou cole link do YouTube ou URL do vídeo"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Envie um arquivo de vídeo (qualquer tamanho) ou cole o link do YouTube.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Breve descrição do vídeo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (opcional)</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-indigo-400 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumb}
                    className="hidden"
                  />
                  {uploadingThumb ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                  )}
                  <span className="text-sm text-gray-600">Enviar imagem</span>
                </label>
                {formData.thumbnailUrl && (
                  <>
                    <img src={formData.thumbnailUrl} alt="" className="w-20 h-12 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, thumbnailUrl: '' }))}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Ou cole URL da imagem"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
                <input
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData((p) => ({ ...p, isPublished: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Publicado (visível no FozTV)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                {editing ? 'Atualizar' : 'Publicar vídeo'}
              </button>
              <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Vídeos ({videos.length})</h3>
        </div>
        {videos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum vídeo ainda. Clique em &quot;Novo vídeo&quot; para publicar.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {videos.map((video) => (
              <li key={video.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-gray-50/50">
                <div className="flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gray-200">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Play className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{video.title}</p>
                  <p className="text-sm text-gray-500 truncate">{video.videoUrl}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {video.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <XCircle className="w-3.5 h-3.5" /> Rascunho
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Ordem: {video.order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(video)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
