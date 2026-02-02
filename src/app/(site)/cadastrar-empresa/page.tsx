'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/NotificationContext'
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react'

const categories = [
  'Restaurante',
  'Hotel',
  'Pousada',
  'Atração Turística',
  'Loja',
  'Serviço',
  'Evento',
  'Portais',
  'Influencers',
  'Outro'
]

export default function CadastrarEmpresaPage() {
  const router = useRouter()
  const { user, isCompany } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentBusinessCount, setCurrentBusinessCount] = useState(0)

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    customSlug: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isCompany()) {
      showNotification('Apenas empresas podem cadastrar empresas', 'error')
      router.push('/')
      return
    }

    // Verificar quantas empresas o usuário já possui
    fetchBusinessCount()
    setLoading(false)
  }, [user, isCompany, router])

  const fetchBusinessCount = async () => {
    try {
      const response = await fetch('/api/business/my-businesses')
      if (response.ok) {
        const data = await response.json()
        setCurrentBusinessCount(data.businesses?.length || 0)
        
        if (data.businesses?.length >= 3) {
          showNotification('Você já possui o número máximo de empresas (3)', 'error')
          router.push('/minhas-empresas')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar empresas:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentBusinessCount >= 3) {
      showNotification('Você já possui o número máximo de empresas (3)', 'error')
      router.push('/minhas-empresas')
      return
    }

    // Validar campos obrigatórios
    if (!formData.businessName || !formData.category || !formData.address) {
      showNotification('Preencha todos os campos obrigatórios', 'error')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Perguntar se quer definir como ativa (se não foi definida automaticamente)
        if (currentBusinessCount > 0 && data.setAsActive === false) {
          const setAsActive = confirm('Deseja definir esta empresa como ativa?')
          if (setAsActive) {
            await fetch('/api/business/set-active', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ businessId: data.business.id })
            })
          }
        }
        
        // Redirecionar para página de sucesso
        const businessName = data.business?.name || formData.businessName
        router.push(`/empresa/cadastro-sucesso?nome=${encodeURIComponent(businessName)}`)
      } else {
        showNotification(data.message || 'Erro ao cadastrar empresa', 'error')
      }
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error)
      showNotification('Erro ao cadastrar empresa. Tente novamente.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const canAddMore = currentBusinessCount < 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/minhas-empresas')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Minhas Empresas
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Cadastrar Nova Empresa
            </h1>
          </div>
          <p className="text-gray-600">
            Você possui {currentBusinessCount} empresa(s) cadastrada(s). 
            {canAddMore && ` Pode cadastrar mais ${3 - currentBusinessCount}.`}
            {!canAddMore && ' Limite máximo atingido (3 empresas).'}
          </p>
        </div>

        {!canAddMore ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Limite de Empresas Atingido
            </h3>
            <p className="text-gray-600 mb-6">
              Você já possui o número máximo de empresas cadastradas (3 empresas).
            </p>
            <button
              onClick={() => router.push('/minhas-empresas')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              Ver Minhas Empresas
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Nome da Empresa */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Ex: Hotel das Cataratas"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Empresa
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                placeholder="Conte um pouco sobre sua empresa..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Ex: Rua das Flores, 123 - Centro, Foz do Iguaçu"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Telefone e Website */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="(45) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="https://www.exemplo.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="@usuario"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="facebook.com/usuario"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="(45) 99999-9999"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Slug Personalizado */}
            <div>
              <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-2">
                URL Personalizada (opcional)
              </label>
              <input
                id="customSlug"
                name="customSlug"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="minha-empresa"
                value={formData.customSlug}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Deixe em branco para gerar automaticamente. Use apenas letras, números e hífens.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/minhas-empresas')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
