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
  
  // Rotas que exigem login para visualizar (igual ao middleware)
  const protectedRoutes = [
    '/admin',
    '/perfil',
    '/minhas-empresas',
    '/empresa/dashboard',
    '/cadastrar-empresa',
    '/messages'
  ]
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  useEffect(() => {
    if (loading) return
    if (!user && isProtectedRoute) {
      router.push('/login')
      return
    }
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/')
    }
  }, [user, loading, router, pathname, isProtectedRoute])

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

  if (!user && isProtectedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      {user && <FloatingChat />}
      <MobileNavigation />
    </div>
  )
}
