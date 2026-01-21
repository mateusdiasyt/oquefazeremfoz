'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  link: string | null
  imageUrl: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function AdminBanners() {
  const { showNotification } = useNotification()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    imageUrl: '',
    link: '',
    isActive: true,
    order: 0
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners)
      }
    } catch (error) {
      console.error('Erro ao buscar banners:', error)
      showNotification('Erro ao buscar banners', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
      const method = editingBanner ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showNotification(
          editingBanner ? 'Banner atualizado com sucesso!' : 'Banner criado com sucesso!',
          'success'
        )
        setShowForm(false)
        setEditingBanner(null)
        setFormData({ imageUrl: '', link: '', isActive: true, order: 0 })
        fetchBanners()
      } else {
        const data = await response.json()
        showNotification(data.message || 'Erro ao salvar banner', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar banner:', error)
      showNotification('Erro ao salvar banner', 'error')
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      imageUrl: banner.imageUrl || '',
      link: banner.link || '',
      isActive: banner.isActive,
      order: banner.order
    })
    setShowForm(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Tem certeza que deseja deletar este banner?')) return

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showNotification('Banner deletado com sucesso!', 'success')
        fetchBanners()
      } else {
        const data = await response.json()
        showNotification(data.message || 'Erro ao deletar banner', 'error')
      }
    } catch (error) {
      console.error('Erro ao deletar banner:', error)
      showNotification('Erro ao deletar banner', 'error')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/banners/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        showNotification('Imagem enviada com sucesso!', 'success')
      } else {
        const data = await response.json()
        showNotification(data.message || 'Erro ao enviar imagem', 'error')
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error)
      showNotification('Erro ao enviar imagem', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBanner(null)
    setFormData({ imageUrl: '', link: '', isActive: true, order: 0 })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Carregando banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-100 mb-2">Gerenciar Banners</h1>
          <p className="text-dark-300">Configure os banners exibidos na página inicial</p>
        </div>

        {/* Botão de adicionar */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Banner
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-dark-100 mb-6">
              {editingBanner ? 'Editar Banner' : 'Novo Banner'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Link de Redirecionamento
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="input"
                    placeholder="https://example.com"
                  />
                  <p className="mt-1 text-xs text-dark-400">URL para onde o banner redirecionará ao ser clicado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="input"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-dark-200">Ativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Imagem de Fundo (Opcional)
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                  />
                  {uploading && (
                    <p className="text-sm text-primary-400">Enviando imagem...</p>
                  )}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {editingBanner ? 'Atualizar' : 'Criar'} Banner
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de banners */}
        <div className="space-y-4">
          {banners.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-300">Nenhum banner encontrado</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-sm text-dark-400">Ordem: {banner.order}</span>
                      {banner.link && (
                        <span className="text-xs text-primary-400">Link: {banner.link}</span>
                      )}
                    </div>
                    {banner.imageUrl && (
                      <img
                        src={banner.imageUrl}
                        alt="Banner"
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-primary-400 hover:text-primary-300 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Deletar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}






