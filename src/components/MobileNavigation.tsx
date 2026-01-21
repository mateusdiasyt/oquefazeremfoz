'use client'

import { useState } from 'react'
import { MessageCircle, Package, Gift, MapPin, Star } from 'lucide-react'

export default function MobileNavigation() {
  const [activeTab, setActiveTab] = useState('posts')

  const navigationItems = [
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'Chat',
      href: '/messages'
    },
    {
      id: 'posts',
      icon: Package,
      label: 'Posts',
      href: '/'
    },
    {
      id: 'coupons',
      icon: Gift,
      label: 'Cupons',
      href: '/cupons'
    },
    {
      id: 'mapa',
      icon: MapPin,
      label: 'Mapa',
      href: '/mapa-turistico'
    },
    {
      id: 'favorites',
      icon: Star,
      label: 'Favoritos',
      href: '/favoritos'
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
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-white/20'
                  : 'hover:bg-blue-100'
              }`}>
                <Icon size={20} />
              </div>
              <span className={`text-xs font-medium mt-1 ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}




