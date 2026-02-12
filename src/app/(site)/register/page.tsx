'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Building2, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

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

const turistaExplanation = {
  title: 'Como funciona para turistas',
  items: [
    'Acesse guias, dicas e o melhor de Foz do Iguaçu em um só lugar.',
    'Siga empresas e atração que você curte e veja novidades no feed.',
    'Confira releases e ofertas no Portal do Turismo e na timeline.',
    'Salve cupons e aproveite promoções das empresas cadastradas.'
  ]
}

const empresaExplanation = {
  title: 'Como funciona para empresas',
  items: [
    'Cadastre sua empresa (nome, categoria, endereço). Após análise, você é aprovado.',
    'Publique releases (notícias, promoções) que aparecem no Portal do Turismo e no feed.',
    'Ganhe visibilidade para turistas: sua página, seus posts e ofertas em destaque.',
    'Interaja com quem te segue: posts, releases e cupons no painel da empresa.'
  ]
}

const guiaExplanation = {
  title: 'Como funciona para guias',
  items: [
    'Crie sua conta e complete seu perfil de guia (foto, especialidades, idiomas, contato).',
    'Seu perfil aparece na página Guias e na timeline para turistas que buscam experiências.',
    'Cadastre pacotes com valores e publique posts. Receba contato direto dos visitantes.',
    'Após análise, você pode receber o selo de guia verificado no OQFOZ.'
  ]
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<'TOURIST' | 'COMPANY' | 'GUIDE'>('TOURIST')
  const [showExplanation, setShowExplanation] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const tipo = searchParams.get('tipo')
    const ref = searchParams.get('ref')
    if (tipo === 'guia' || ref === 'lp-guias') setAccountType('GUIDE')
  }, [searchParams])

  const [businessData, setBusinessData] = useState({
    businessName: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: ''
  })

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBusinessData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (accountType === 'COMPANY') {
        if (!businessData.businessName || !businessData.category || !businessData.address) {
          setError('Preencha todos os campos obrigatórios da empresa')
          setLoading(false)
          return
        }
      }

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: accountType })
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}))
        setError(errorData.error || errorData.message || 'Erro no registro')
        setLoading(false)
        return
      }

      if (accountType === 'COMPANY') {
        const businessResponse = await fetch('/api/business/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(businessData)
        })

        if (!businessResponse.ok) {
          const errorData = await businessResponse.json().catch(() => ({}))
          setError(errorData.error || errorData.message || 'Erro ao cadastrar empresa')
          setLoading(false)
          return
        }
        const data = await businessResponse.json().catch(() => ({}))
        const businessName = data?.business?.name || businessData.businessName
        router.push(`/empresa/cadastro-sucesso?nome=${encodeURIComponent(businessName)}`)
      } else if (accountType === 'GUIDE') {
        router.push('/perfil?guia=completar')
      } else {
        router.push('/')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const explanation = accountType === 'TOURIST' ? turistaExplanation : accountType === 'GUIDE' ? guiaExplanation : empresaExplanation

  return (
    <div className="min-h-screen flex">
      {/* Coluna esquerda – Branding OQFOZ (igual ao login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex-col items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-8 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <span className="text-white font-bold text-4xl" style={{ letterSpacing: '-0.02em' }}>O</span>
            </div>
            <span className="ml-4 text-5xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>OQFOZ</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Crie sua conta
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Descubra o melhor de Foz do Iguaçu — como turista ou divulgando sua empresa
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/80">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Portal do Turismo, guias, cupons e muito mais</span>
          </div>
        </div>
      </div>

      {/* Coluna direita – Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>O</span>
              </div>
              <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>OQFOZ</span>
            </Link>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Cadastro
            </h2>
            <p className="mt-1 text-gray-600">
              Já tem conta?{' '}
              <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                Entrar
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Tipo de conta – cards interativos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de conta</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('TOURIST')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 ${
                    accountType === 'TOURIST'
                      ? 'border-purple-500 bg-purple-50/80 shadow-md shadow-purple-500/10'
                      : 'border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accountType === 'TOURIST' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block">Sou Turista</span>
                      <span className="text-sm text-gray-500">Busco experiências e serviços</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('GUIDE')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 ${
                    accountType === 'GUIDE'
                      ? 'border-purple-500 bg-purple-50/80 shadow-md shadow-purple-500/10'
                      : 'border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accountType === 'GUIDE' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block">Sou Guia</span>
                      <span className="text-sm text-gray-500">Guia de turismo em Foz</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('COMPANY')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 ${
                    accountType === 'COMPANY'
                      ? 'border-purple-500 bg-purple-50/80 shadow-md shadow-purple-500/10'
                      : 'border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accountType === 'COMPANY' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block">Sou Empresa</span>
                      <span className="text-sm text-gray-500">Ofereço serviços e experiências</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Explicação expansível: como funciona */}
              <div className="mt-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 to-pink-50/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-purple-50/50 transition-colors"
                >
                  <span className="font-semibold text-purple-800">{explanation.title}</span>
                  {showExplanation ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-purple-600" />}
                </button>
                {showExplanation && (
                  <ul className="px-4 pb-4 space-y-2 text-sm text-gray-700">
                    {explanation.items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dados pessoais</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Dados da empresa (apenas COMPANY; GUIDE não precisa aqui, completa no perfil) */}
            {accountType === 'COMPANY' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Dados da empresa</h3>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">Nome da empresa *</label>
                  <input id="businessName" name="businessName" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Ex: Hotel das Cataratas" value={businessData.businessName} onChange={handleBusinessChange} />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select id="category" name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" value={businessData.category} onChange={handleBusinessChange}>
                    <option value="">Selecione uma categoria</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Endereço *</label>
                  <input id="address" name="address" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Ex: Rua das Flores, 123 - Centro" value={businessData.address} onChange={handleBusinessChange} />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea id="description" name="description" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" placeholder="Conte um pouco sobre sua empresa..." value={businessData.description} onChange={handleBusinessChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input id="phone" name="phone" type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="(45) 99999-9999" value={businessData.phone} onChange={handleBusinessChange} />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input id="website" name="website" type="url" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." value={businessData.website} onChange={handleBusinessChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input id="instagram" name="instagram" type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="@exemplo" value={businessData.instagram} onChange={handleBusinessChange} />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input id="facebook" name="facebook" type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="facebook.com/exemplo" value={businessData.facebook} onChange={handleBusinessChange} />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input id="whatsapp" name="whatsapp" type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="(45) 99999-9999" value={businessData.whatsapp} onChange={handleBusinessChange} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.627 8 5.864V12z" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
