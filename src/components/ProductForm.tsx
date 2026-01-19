'use client'

import { useState } from 'react'
import { useNotification } from '../contexts/NotificationContext'

interface ProductFormProps {
  businessId: string
  onProductCreated?: () => void
  onClose?: () => void
  editProduct?: {
    id: string
    name: string
    description?: string
    priceCents: number
    productUrl?: string
    imageUrl?: string
  }
}

export default function ProductForm({ businessId, onProductCreated, onClose, editProduct }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    description: editProduct?.description || '',
    price: editProduct ? (editProduct.priceCents / 100).toFixed(2) : '',
    productUrl: editProduct?.productUrl || ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editProduct?.imageUrl || null)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useNotification()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showError('Apenas imagens são permitidas')
        return
      }
      
      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        showError('Arquivo muito grande. Máximo 5MB')
        return
      }
      
      setImageFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const priceCents = Math.round(parseFloat(formData.price) * 100)

      if (editProduct) {
        // Atualizar produto existente
        const formDataToSend = new FormData()
        formDataToSend.append('id', editProduct.id)
        formDataToSend.append('name', formData.name)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('priceCents', priceCents.toString())
        formDataToSend.append('productUrl', formData.productUrl)
        
        if (imageFile) {
          formDataToSend.append('image', imageFile)
        }

        const response = await fetch('/api/business/products', {
          method: 'PUT',
          body: formDataToSend
        })

        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          if (response.ok) {
            showSuccess(data.message)
            onProductCreated?.()
            onClose?.()
          } else {
            showError(data.error || 'Erro ao atualizar produto')
          }
        }
      } else {
        // Criar novo produto
        const formDataToSend = new FormData()
        formDataToSend.append('businessId', businessId)
        formDataToSend.append('name', formData.name)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('priceCents', priceCents.toString())
        formDataToSend.append('productUrl', formData.productUrl)
        
        if (imageFile) {
          formDataToSend.append('image', imageFile)
        }

        const response = await fetch('/api/business/products', {
          method: 'POST',
          body: formDataToSend
        })

        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          if (response.ok) {
            showSuccess(data.message)
            setFormData({ name: '', description: '', price: '', productUrl: '' })
            onProductCreated?.()
            onClose?.()
          } else {
            showError(data.error || 'Erro ao cadastrar produto')
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      showError('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editProduct) return

    if (!confirm('Tem certeza que deseja remover este produto?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/business/products?id=${editProduct.id}`, {
        method: 'DELETE'
      })

      const text = await response.text()
      if (text) {
        const data = JSON.parse(text)
        if (response.ok) {
          showSuccess(data.message)
          onProductCreated?.()
          onClose?.()
        } else {
          showError(data.error || 'Erro ao remover produto')
        }
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      showError('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-dark-100">
              {editProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-dark-400 hover:text-dark-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: Ingresso Show de Rock"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full h-20 resize-none"
                placeholder="Descreva o produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Link do Produto
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="input w-full"
                placeholder="https://exemplo.com/produto"
              />
              <p className="text-xs text-dark-400 mt-1">
                Link personalizado para compra do produto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Imagem do Produto
              </label>
              
              {/* Preview da imagem */}
              {imagePreview && (
                <div className="mb-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    style={{ aspectRatio: '4/3' }}
                  />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input w-full"
              />
              <p className="text-xs text-dark-400 mt-1">
                Proporção recomendada: 4x3 (máximo 5MB)
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{editProduct ? 'Atualizar' : 'Cadastrar'}</span>
              </button>

              {editProduct && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
