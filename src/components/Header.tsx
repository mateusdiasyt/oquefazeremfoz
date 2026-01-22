'use client'

import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Gift, MapPin } from 'lucide-react'
import { capitalizeWords } from '../utils/formatters'
import NotificationBell from './NotificationBell'

interface Business {
  id: string
  name: string
  slug: string
  profileImage?: string | null
}

export default function Header() {
  const { user, logout, isCompany, isAdmin } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (isCompany() && user) {
        try {
          const response = await fetch('/api/business/my-businesses')
          if (response.ok) {
            const data = await response.json()
            setUserBusinesses(data.businesses || [])
          }
        } catch (error) {
          console.error('Erro ao buscar empresas do usuário:', error)
        }
      }
    }

    fetchUserBusinesses()
  }, [user, isCompany])

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-sm shadow-purple-500/20 group-hover:shadow-md transition-all duration-200">
                <span className="text-white font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>O</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
                OQFOZ
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a 
              href="/" 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                pathname === '/'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Início"
            >
              <Home className="w-5 h-5" />
            </a>
            <a 
              href="/empresas" 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                pathname === '/empresas'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Descubra"
            >
              <Search className="w-5 h-5" />
            </a>
            <a 
              href="/cupons" 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                pathname === '/cupons'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Cupons"
            >
              <Gift className="w-5 h-5" />
            </a>
            <a 
              href="/mapa-turistico" 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                pathname === '/mapa-turistico'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Mapa Turístico"
            >
              <MapPin className="w-5 h-5" />
            </a>
            <a 
              href="/selo-verificado" 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                pathname === '/selo-verificado'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Selo Verificado"
            >
              <img 
                src="/icons/verificado.png" 
                alt="Selo Verificado" 
                className="w-5 h-5 object-contain"
              />
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notificações - apenas para empresas */}
                <NotificationBell />
                
                {/* Dropdown do usuário */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2.5 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200 border border-gray-200 hover:border-gray-300"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium text-xs" style={{ letterSpacing: '-0.01em' }}>
                      {(user.name || user.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {user.name || user.email}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg py-2 z-50 animate-slide-up border border-gray-100">
                    {isCompany() && (
                      <>
                        {/* Links para cada empresa */}
                        {userBusinesses.length > 0 && (
                          <>
                            {userBusinesses.map((business) => (
                              <a
                                key={business.id}
                                href={`/empresa/${business.slug}`}
                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                                onClick={() => setShowDropdown(false)}
                                style={{ letterSpacing: '-0.01em' }}
                              >
                                {business.profileImage ? (
                                  <img
                                    src={business.profileImage}
                                    alt={business.name}
                                    className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-medium">
                                      {business.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <span className="truncate">{capitalizeWords(business.name)}</span>
                              </a>
                            ))}
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        )}
                        <a
                          href="/minhas-empresas"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                          onClick={() => setShowDropdown(false)}
                          style={{ letterSpacing: '-0.01em' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Minhas Empresas</span>
                        </a>
                        <a
                          href="/empresa/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                          onClick={() => setShowDropdown(false)}
                          style={{ letterSpacing: '-0.01em' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Dashboard</span>
                        </a>
                        <a
                          href="/messages"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                          onClick={() => setShowDropdown(false)}
                          style={{ letterSpacing: '-0.01em' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Mensagens</span>
                        </a>
                      </>
                    )}
                    
                    {/* Opção para usuários normais (turistas) */}
                    {!isCompany() && !isAdmin() && (
                      <a
                        href="/perfil"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                        onClick={() => setShowDropdown(false)}
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Meu Perfil</span>
                      </a>
                    )}
                    
                    {isAdmin() && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                        onClick={() => setShowDropdown(false)}
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Painel Admin</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all duration-200"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all duration-200"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Entrar
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Cadastrar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
