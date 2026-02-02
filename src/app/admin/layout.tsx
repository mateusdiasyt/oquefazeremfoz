'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FileText,
  CreditCard,
  BarChart3,
  Upload,
  Image,
  Users,
  Settings,
  Menu,
  X,
  ExternalLink,
  Tv
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/empresas', label: 'Gerenciar Empresas', icon: Building2 },
  { href: '/admin/guias', label: 'Gerenciar Guias', icon: MapPin },
  { href: '/admin/foztv', label: 'FozTV', icon: Tv },
  { href: '/admin/conteudo', label: 'Gerenciar Conteúdo', icon: FileText },
  { href: '/admin/planos', label: 'Gerenciar Planos', icon: CreditCard },
  { href: '/admin/vendas', label: 'Relatórios de Vendas', icon: BarChart3 },
  { href: '/admin/uploads', label: 'Gerenciar Uploads', icon: Upload },
  { href: '/admin/banners', label: 'Gerenciar Banners', icon: Image },
  { href: '/admin/usuarios', label: 'Gerenciar Usuários', icon: Users },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && !user.roles?.includes('ADMIN')) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando acesso...</div>
      </div>
    )
  }

  if (!user || !user.roles || !user.roles.includes('ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Acesso negado. Redirecionando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:flex lg:flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:border-b-0">
          <Link href="/admin" className="text-lg font-semibold text-gray-900 truncate">
            Painel Admin
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Olá, {user.name}</span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500"
            >
              <ExternalLink className="w-4 h-4" />
              Voltar ao site
            </a>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
}