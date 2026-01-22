'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Home, Search, Gift, MapPin, ShieldCheck } from 'lucide-react'

export default function MobileNavigation() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('inicio')

  // Atualizar tab ativa baseado na rota atual
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('inicio')
    } else if (pathname === '/empresas') {
      setActiveTab('descubra')
    } else if (pathname === '/cupons') {
      setActiveTab('cupons')
    } else if (pathname === '/mapa-turistico') {
      setActiveTab('mapa')
    } else if (pathname === '/selo-verificado') {
      setActiveTab('selo')
    }
  }, [pathname])

  const navigationItems = [
    {
      id: 'inicio',
      icon: Home,
      label: 'Início',
      href: '/'
    },
    {
      id: 'descubra',
      icon: Search,
      label: 'Descubra',
      href: '/empresas'
    },
    {
      id: 'cupons',
      icon: Gift,
      label: 'Cupons',
      href: '/cupons'
    },
    {
      id: 'mapa',
      icon: MapPin,
      label: 'Mapa Turístico',
      href: '/mapa-turistico'
    },
    {
      id: 'selo',
      icon: ShieldCheck,
      label: 'Selo Verificado',
      href: '/selo-verificado'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-white/20'
                  : ''
              }`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs font-medium mt-1 text-center ${
                isActive ? 'text-white' : 'text-gray-600'
              }`} style={{ letterSpacing: '-0.01em' }}>
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}




