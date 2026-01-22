'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FloatingChat from '../../components/FloatingChat'
import MobileNavigation from '../../components/MobileNavigation'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  
  // Rotas públicas (não precisam de autenticação) - IMPORTANTE PARA SEO
  const publicRoutes = [
    '/login', 
    '/register',
    '/empresa',
    '/empresas',
    '/cupons',
    '/mapa-turistico',
    '/selo-verificado'
  ]
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/')
  )
  
  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redirecionar para login
    if (!loading && !user && !isPublicRoute) {
      router.push('/login')
    }
    // Se estiver logado e tentar acessar login/register, redirecionar para home
    if (!loading && user && isPublicRoute) {
      router.push('/')
    }
  }, [user, loading, router, pathname, isPublicRoute])
  
  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  // Se não estiver logado e não for rota pública, mostrar loading (será redirecionado)
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }
  
  // Para rotas públicas de login/register, não mostrar Header, Footer, etc.
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }
  
  // Para rotas públicas de empresas (SEO), mostrar layout mas sem chat
  if (isPublicRoute && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNavigation />
      </div>
    )
  }
  
  // Para usuários logados, mostrar layout completo
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <FloatingChat />
      <MobileNavigation />
    </div>
  )
}
