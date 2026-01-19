'use client'

import { useState } from 'react'
import { useNotification } from '../contexts/NotificationContext'

interface Review {
  id: string
  rating: number
  comment?: string
  imageUrl?: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface ReviewFormProps {
  businessId: string
  editReview?: Review
  onClose: () => void
  onReviewCreated: () => void
}

export default function ReviewForm({ businessId, editReview, onClose, onReviewCreated }: ReviewFormProps) {
  const { showSuccess, showError } = useNotification()
  const [rating, setRating] = useState(editReview?.rating || 0)
  const [comment, setComment] = useState(editReview?.comment || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editReview?.imageUrl || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Apenas imagens são permitidas')
        return
      }
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        showError('Arquivo muito grande. Máximo 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      showError('Por favor, selecione uma avaliação')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('businessId', businessId)
      formData.append('rating', rating.toString())
      formData.append('comment', comment)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const url = '/api/business/reviews'
      const method = editReview ? 'PUT' : 'POST'
      
      if (editReview) {
        formData.append('id', editReview.id)
      }

      const response = await fetch(url, {
        method,
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(data.message)
        onReviewCreated()
        onClose()
      } else {
        showError(data.message)
      }
    } catch (error) {
      showError('Erro ao salvar avaliação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editReview) return
    
    if (!confirm('Tem certeza que deseja deletar esta avaliação?')) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/business/reviews?id=${editReview.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(data.message)
        onReviewCreated()
        onClose()
      } else {
        showError(data.message)
      }
    } catch (error) {
      showError('Erro ao deletar avaliação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {editReview ? 'Editar Avaliação' : 'Avaliar Empresa'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avaliação com estrelas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sua Avaliação *
              </label>
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      star <= rating 
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-400 hover:bg-pink-50 hover:text-pink-400'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                {rating === 0 && 'Selecione de 1 a 5 estrelas'}
                {rating === 1 && 'Péssimo'}
                {rating === 2 && 'Ruim'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente'}
              </p>
            </div>

            {/* Comentário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comentário
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all duration-200 resize-none"
                rows={4}
                placeholder="Conte sua experiência com esta empresa..."
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto (opcional)
              </label>
              {imagePreview && (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-xl border border-gray-200" 
                  />
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Máximo 5MB • Formatos: JPG, PNG, GIF</p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-6">
              {editReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
                >
                  Deletar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || rating === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Salvando...' : (editReview ? 'Atualizar' : 'Avaliar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

