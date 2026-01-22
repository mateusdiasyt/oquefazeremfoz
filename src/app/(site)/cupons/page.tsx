'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Filter, Copy, Check } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  title: string
  description: string | null
  discount: string | null
  link: string | null
  validUntil: string | null
  isActive: boolean
  createdAt: string
  business: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
    category: string
  }
}

export default function CuponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [selectedCategory])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const url = selectedCategory === 'Todas' 
        ? '/api/coupons/public'
        : `/api/coupons/public?category=${encodeURIComponent(selectedCategory)}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons || [])
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'agora'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    }
    const days = Math.floor(diffInSeconds / 86400)
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-sm shadow-purple-500/20">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Cupons Disponíveis
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Descubra os melhores cupons e promoções das empresas de Foz do Iguaçu
          </p>
        </div>

        {/* Filtro de Categoria */}
        <div className="mb-6 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {coupons.length} {coupons.length === 1 ? 'cupom encontrado' : 'cupons encontrados'}
          </span>
        </div>

        {/* Lista de Cupons */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-500 text-sm mt-4">Carregando cupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Nenhum cupom disponível</p>
            <p className="text-gray-400 text-sm">
              {selectedCategory !== 'Todas' 
                ? `Não há cupons na categoria "${selectedCategory}" no momento.`
                : 'As empresas ainda não criaram cupons.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} getTimeAgo={getTimeAgo} router={router} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CouponCard({ coupon, getTimeAgo, router }: { coupon: Coupon; getTimeAgo: (date: string) => string; router: any }) {
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao copiar código:', error)
    }
  }

  return (
    <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-200 hover:shadow-lg">
      {/* Cabeçalho: Foto da empresa, nome e tempo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Foto de perfil da empresa */}
          {coupon.business.profileImage ? (
            <img
              src={coupon.business.profileImage}
              alt={coupon.business.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm cursor-pointer"
              onClick={() => router.push(`/empresa/${coupon.business.slug || coupon.business.id}`)}
            />
          ) : (
            <div
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm cursor-pointer"
              onClick={() => router.push(`/empresa/${coupon.business.slug || coupon.business.id}`)}
            >
              {coupon.business.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span 
                className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-purple-600 transition-colors"
                onClick={() => router.push(`/empresa/${coupon.business.slug || coupon.business.id}`)}
                title={coupon.business.name}
              >
                {coupon.business.name}
              </span>
              {coupon.business.isVerified && (
                <img 
                  src="/icons/verificado.png" 
                  alt="Verificado" 
                  className="w-4 h-4 object-contain flex-shrink-0"
                  title="Empresa verificada"
                />
              )}
            </div>
            <span className="text-xs text-gray-500">
              {getTimeAgo(coupon.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Título do cupom */}
      <h5 className="font-semibold text-gray-900 text-base mb-3" style={{ letterSpacing: '-0.01em' }}>
        {coupon.title}
      </h5>

      {/* Desconto e código */}
      <div className="flex items-center justify-between mb-4">
        {coupon.discount && (
          <span className="text-base font-bold text-purple-600" style={{ letterSpacing: '-0.01em' }}>
            {coupon.discount}
          </span>
        )}
        <span className="font-mono font-bold text-gray-900 text-base tracking-wider">
          {coupon.code}
        </span>
      </div>

      {/* Botão copiar */}
      <button
        onClick={handleCopyCode}
        className={`w-full text-sm flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm shadow-purple-500/20 font-medium ${
          isCopied
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copiar Código</span>
          </>
        )}
      </button>
    </div>
  )
}
