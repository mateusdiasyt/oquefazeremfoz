'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import { Plus, Edit2, Trash2, Image as ImageIcon, Link2, ArrowUpDown, CheckCircle2, XCircle, Upload, X } from 'lucide-react'

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
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/admin/banners/upload', {
        method: 'POST',
        body: formDataUpload,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Banners</h1>
          <p className="text-gray-600">Configure os banners exibidos no rodapé do site</p>
        </div>

        {/* Botão de adicionar */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Banner
            </button>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link2 className="w-4 h-4 inline mr-2" />
                  Link de Redirecionamento
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                  placeholder="https://exemplo.com"
                />
                <p className="mt-1 text-xs text-gray-500">URL para onde o banner redirecionará ao ser clicado</p>
              </div>

              {/* Grid com Ordem e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArrowUpDown className="w-4 h-4 inline mr-2" />
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Banner ativo</span>
                  </label>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Imagem do Banner
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors">
                        {uploading ? (
                          <div className="flex items-center text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
                            Enviando...
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-600">
                            <Upload className="w-5 h-5 mr-2" />
                            Clique para fazer upload
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {formData.imageUrl && (
                    <div className="relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {editingBanner ? 'Atualizar Banner' : 'Criar Banner'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Nenhum banner encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Comece adicionando seu primeiro banner</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Preview da Imagem */}
                    <div className="flex-shrink-0">
                      {banner.imageUrl ? (
                        <div className="w-full lg:w-64 h-40 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full lg:w-64 h-40 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            {banner.isActive ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inativo
                              </span>
                            )}
                            <span className="inline-flex items-center text-sm text-gray-600">
                              <ArrowUpDown className="w-4 h-4 mr-1" />
                              Ordem: {banner.order}
                            </span>
                          </div>
                          
                          {banner.link && (
                            <div className="mb-3">
                              <a
                                href={banner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 hover:underline break-all"
                              >
                                <Link2 className="w-4 h-4 mr-1 flex-shrink-0" />
                                {banner.link}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Botões de ação */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
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
