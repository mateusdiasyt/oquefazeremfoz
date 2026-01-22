'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

// Forçar renderização dinâmica para evitar pré-renderização
export const dynamic = 'force-dynamic'

const categories = [
  'Restaurante',
  'Hotel',
  'Pousada',
  'Atração Turística',
  'Loja',
  'Serviço',
  'Evento',
  'Outro'
]

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, loading: authLoading } = useAuth()
  
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  
  // Estados do formulário de login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  
  // Estados do formulário de registro
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerName, setName] = useState('')
  const [accountType, setAccountType] = useState<'TOURIST' | 'COMPANY' | 'GUIDE'>('TOURIST')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  
  // Campos da empresa
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

  // Campos do guia
  const [guideData, setGuideData] = useState({
    guideName: '',
    description: '',
    specialties: '',
    languages: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
    website: ''
  })

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }

      if (user.roles?.includes('ADMIN')) {
        router.push('/admin')
      } else if (user.roles?.includes('COMPANY')) {
        router.push('/empresa/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [user, authLoading, router, searchParams])

  // Verificar se há parâmetro na URL para definir a aba
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register') {
      setActiveTab('register')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const result = await login(loginEmail, loginPassword)
      
      if (result.success) {
        console.log('Login realizado com sucesso')
      } else {
        setLoginError(result.error || 'Erro no login')
        setLoginLoading(false)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setLoginError('Erro de conexão')
      setLoginLoading(false)
    }
  }

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGuideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGuideData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError('')

    try {
      // Validar campos obrigatórios da empresa se for COMPANY
      if (accountType === 'COMPANY') {
        if (!businessData.businessName || !businessData.category || !businessData.address) {
          setRegisterError('Preencha todos os campos obrigatórios da empresa')
          setRegisterLoading(false)
          return
        }
      }

      // Validar campos obrigatórios do guia se for GUIDE
      if (accountType === 'GUIDE') {
        if (!guideData.guideName) {
          setRegisterError('Preencha o nome do guia')
          setRegisterLoading(false)
          return
        }
      }

      // Fazer registro do usuário
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
          role: accountType
        }),
      })

      if (!registerResponse.ok) {
        try {
          const errorData = await registerResponse.json()
          setRegisterError(errorData.error || errorData.message || 'Erro no registro')
        } catch (parseError) {
          setRegisterError('Erro no registro. Tente novamente.')
        }
        setRegisterLoading(false)
        return
      }

      // Se for empresa, cadastrar dados da empresa
      if (accountType === 'COMPANY') {
        const businessResponse = await fetch('/api/business/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessData),
        })

        if (!businessResponse.ok) {
          const errorData = await businessResponse.json()
          setRegisterError(errorData.error || 'Erro ao cadastrar empresa')
          setRegisterLoading(false)
          return
        }
      }

      // Se for guia, cadastrar dados do guia
      if (accountType === 'GUIDE') {
        const guideResponse = await fetch('/api/guide/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(guideData),
        })

        if (!guideResponse.ok) {
          const errorData = await guideResponse.json()
          setRegisterError(errorData.error || 'Erro ao cadastrar guia')
          setRegisterLoading(false)
          return
        }
      }

      // Login automático após registro
      const loginResult = await login(registerEmail, registerPassword)
      if (!loginResult.success) {
        setRegisterError('Conta criada, mas erro ao fazer login. Tente fazer login manualmente.')
        setRegisterLoading(false)
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      setRegisterError('Erro de conexão')
      setRegisterLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Coluna Esquerda - Logo e Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <span className="text-white font-bold text-4xl" style={{ letterSpacing: '-0.02em' }}>O</span>
            </div>
            <span className="ml-4 text-5xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
              OQFOZ
            </span>
          </div>
          
          {/* Texto de boas-vindas */}
          <h1 className="text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            {activeTab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta!'}
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Descubra o melhor de Foz do Iguaçu em um só lugar
          </p>
        </div>
      </div>

      {/* Coluna Direita - Formulários */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>O</span>
              </div>
              <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
                OQFOZ
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Formulário de Login */}
          {activeTab === 'login' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                Entre na sua conta
              </h2>
              <p className="text-gray-600 mb-6">
                Acesse sua conta para continuar
              </p>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                    id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                    id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                >
                  {loginLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.627 8 5.864V12z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Formulário de Registro */}
          {activeTab === 'register' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                Crie sua conta
              </h2>
              <p className="text-gray-600 mb-6">
                Junte-se a nós e descubra o melhor de Foz
              </p>

              <form className="space-y-4" onSubmit={handleRegister}>
                {/* Tipo de conta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de conta
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType('TOURIST')}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                        accountType === 'TOURIST'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Turista
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('COMPANY')}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                        accountType === 'COMPANY'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Empresa
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('GUIDE')}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                        accountType === 'GUIDE'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Guia
                    </button>
                  </div>
                </div>

                {/* Campos básicos */}
                <div>
                  <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome {accountType === 'COMPANY' ? 'do responsável' : accountType === 'GUIDE' ? 'do guia' : ''}
                  </label>
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Seu nome completo"
                    value={registerName}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>

                {/* Campos da empresa (apenas se for COMPANY) */}
                {accountType === 'COMPANY' && (
                  <>
                    <div>
                      <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da empresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="business-name"
                        name="businessName"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Nome da sua empresa"
                        value={businessData.businessName}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="business-category" className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="business-category"
                        name="category"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        value={businessData.category}
                        onChange={handleBusinessChange}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="business-address" className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="business-address"
                        name="address"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Endereço completo"
                        value={businessData.address}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="business-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        id="business-description"
                        name="description"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Descreva sua empresa..."
                        value={businessData.description}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="business-phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          id="business-phone"
                          name="phone"
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="(45) 99999-9999"
                          value={businessData.phone}
                          onChange={handleBusinessChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="business-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          id="business-whatsapp"
                          name="whatsapp"
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="(45) 99999-9999"
                          value={businessData.whatsapp}
                          onChange={handleBusinessChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="business-website" className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          id="business-website"
                          name="website"
                          type="url"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="https://..."
                          value={businessData.website}
                          onChange={handleBusinessChange}
                        />
                      </div>
          <div>
                        <label htmlFor="business-instagram" className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        <input
                          id="business-instagram"
                          name="instagram"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="@seuinstagram"
                          value={businessData.instagram}
                          onChange={handleBusinessChange}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Campos do guia (apenas se for GUIDE) */}
                {accountType === 'GUIDE' && (
                  <>
                    <div>
                      <label htmlFor="guide-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do guia <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="guide-name"
                        name="guideName"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Seu nome como guia"
                        value={guideData.guideName}
                        onChange={handleGuideChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="guide-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        id="guide-description"
                        name="description"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Conte um pouco sobre você e sua experiência como guia..."
                        value={guideData.description}
                        onChange={handleGuideChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="guide-specialties" className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidades
                      </label>
                      <input
                        id="guide-specialties"
                        name="specialties"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Ex: Cataratas, Aventura, História, Natureza"
                        value={guideData.specialties}
                        onChange={handleGuideChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="guide-languages" className="block text-sm font-medium text-gray-700 mb-2">
                        Idiomas
                      </label>
                      <input
                        id="guide-languages"
                        name="languages"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Ex: Português, Inglês, Espanhol"
                        value={guideData.languages}
                        onChange={handleGuideChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guide-phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          id="guide-phone"
                          name="phone"
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="(45) 99999-9999"
                          value={guideData.phone}
                          onChange={handleGuideChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="guide-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          id="guide-whatsapp"
                          name="whatsapp"
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="(45) 99999-9999"
                          value={guideData.whatsapp}
                          onChange={handleGuideChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="guide-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email profissional
                      </label>
                      <input
                        id="guide-email"
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="contato@seuguia.com"
                        value={guideData.email}
                        onChange={handleGuideChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guide-instagram" className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        <input
                          id="guide-instagram"
                          name="instagram"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="@seuinstagram"
                          value={guideData.instagram}
                          onChange={handleGuideChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="guide-facebook" className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        <input
                          id="guide-facebook"
                          name="facebook"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="facebook.com/seuperfil"
                          value={guideData.facebook}
                          onChange={handleGuideChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="guide-website" className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        id="guide-website"
                        name="website"
                        type="url"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="https://seuwebsite.com"
                        value={guideData.website}
                        onChange={handleGuideChange}
                      />
                    </div>
                  </>
                )}

                {registerError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                    {registerError}
                  </div>
                )}

            <button
              type="submit"
                  disabled={registerLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                >
                  {registerLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.627 8 5.864V12z"></path>
                      </svg>
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
            </button>
              </form>
            </div>
          )}
          </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
