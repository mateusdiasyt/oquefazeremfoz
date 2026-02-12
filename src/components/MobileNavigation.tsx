'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Home, Compass, Users, Video, Tv, Newspaper } from 'lucide-react'
import { useLocale } from '../contexts/LocaleContext'
import { getTranslations } from '../lib/translations'

export default function MobileNavigation() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [activeTab, setActiveTab] = useState('inicio')

  useEffect(() => {
    if (pathname === '/') setActiveTab('inicio')
    else if (pathname === '/empresas') setActiveTab('descubra')
    else if (pathname === '/guias') setActiveTab('guias')
    else if (pathname === '/cameras-ao-vivo') setActiveTab('cameras')
    else if (pathname === '/foztv') setActiveTab('foztv')
    else if (pathname === '/portal') setActiveTab('portal')
  }, [pathname])

  const navigationItems = [
    { id: 'inicio', icon: Home, label: t.nav.home, href: '/' },
    { id: 'descubra', icon: Compass, label: t.nav.discover, href: '/empresas' },
    { id: 'guias', icon: Users, label: t.nav.guides, href: '/guias' },
    { id: 'cameras', icon: Video, label: t.nav.cameras, href: '/cameras-ao-vivo' },
    { id: 'foztv', icon: Tv, label: t.nav.foztv, href: '/foztv' },
    { id: 'portal', icon: Newspaper, label: t.nav.portal, href: '/portal' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-between px-1 py-2 overflow-x-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all duration-300 flex-1 min-w-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-white/20'
                  : ''
              }`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-medium mt-0.5 text-center leading-tight ${
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




