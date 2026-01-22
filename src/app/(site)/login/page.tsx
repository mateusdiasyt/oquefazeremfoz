'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

// Forçar renderização dinâmica para evitar pré-renderização
export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user, loading: authLoading } = useAuth()

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      // Verificar se há uma URL de retorno (redirect)
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }

      // Redirecionar baseado no tipo de usuário (comportamento padrão)
      if (user.roles?.includes('ADMIN')) {
        router.push('/admin')
      } else if (user.roles?.includes('COMPANY')) {
        router.push('/empresa/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [user, authLoading, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // O redirecionamento será feito pelo useEffect quando o user for atualizado
        console.log('Login realizado com sucesso')
      } else {
        setError(result.error || 'Erro no login')
        setLoading(false)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro de conexão')
      setLoading(false)
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
            Bem-vindo de volta!
          </h1>
          <p className="text-xl text-white/90 max-w-md">
            Descubra o melhor de Foz do Iguaçu em um só lugar
          </p>
        </div>
      </div>

      {/* Coluna Direita - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>O</span>
              </div>
              <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
                OQFOZ
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              Entre na sua conta
            </h2>
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <a
                href="/register"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Cadastre-se
              </a>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
              >
                {loading ? (
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
            </div>
          </form>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}






