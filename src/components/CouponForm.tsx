'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'

interface Coupon {
  id: string
  title: string
  code: string
  description?: string
  link?: string
  discount?: string
  validUntil?: string
  isActive?: boolean
}

interface CouponFormProps {
  businessId: string
  editCoupon?: Coupon
  onClose: () => void
  onCouponCreated: () => void
}

export default function CouponForm({ businessId, editCoupon, onClose, onCouponCreated }: CouponFormProps) {
  const { showSuccess, showError } = useNotification()
  const [formData, setFormData] = useState({
    title: editCoupon?.title || '',
    code: editCoupon?.code || '',
    description: editCoupon?.description || '',
    link: editCoupon?.link || '',
    discount: editCoupon?.discount || '',
    validUntil: editCoupon?.validUntil ? editCoupon.validUntil.split('T')[0] : ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = '/api/business/coupons'
      const method = editCoupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(editCoupon && { id: editCoupon.id }),
          ...formData,
          validUntil: formData.validUntil || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(data.message)
        onCouponCreated()
        onClose()
      } else {
        showError(data.message)
      }
    } catch (error) {
      showError('Erro ao salvar cupom')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl shadow-strong w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho simples */}
        <div className="p-6 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark-100">
              {editCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </h2>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-dark-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Título do Cupom *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Ex: Desconto de 20%"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Código do Cupom *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors font-mono"
                placeholder="Ex: DESCONTO20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows={2}
                placeholder="Descreva o cupom..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Link do Cupom
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="https://exemplo.com/cupom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Desconto
              </label>
              <input
                type="text"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Ex: 10% OFF, R$ 20 de desconto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Válido até
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:border-purple-500 focus:outline-none transition-colors"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-dark-600 text-dark-300 rounded-lg hover:bg-dark-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : (editCoupon ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
