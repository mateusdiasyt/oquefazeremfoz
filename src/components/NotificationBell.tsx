'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Função para tocar som de notificação
const playNotificationSound = () => {
  try {
    // Criar um contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.error('Erro ao tocar som de notificação:', error)
  }
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
  business: {
    id: string
    name: string
    profileImage: string | null
  } | null
}

export default function NotificationBell() {
  const { user, isCompany } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const previousUnreadCountRef = useRef(0)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Buscar notificações
  const fetchNotifications = async (silent = false) => {
    if (!user || !isCompany()) return

    try {
      if (!silent) setLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        const newUnreadCount = data.unreadCount || 0
        
        // Verificar se há novas notificações não lidas
        if (newUnreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
          // Tocar som apenas se o número aumentou (não na primeira carga)
          playNotificationSound()
        }
        
        setNotifications(data.notifications || [])
        setUnreadCount(newUnreadCount)
        previousUnreadCountRef.current = newUnreadCount
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Buscar notificações ao montar e quando o usuário mudar
  useEffect(() => {
    if (user && isCompany()) {
      fetchNotifications()
      // Polling a cada 5 segundos para atualização em tempo real
      const interval = setInterval(() => fetchNotifications(true), 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Formatar data relativa
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'agora'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  // Obter ícone baseado no tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like_post':
      case 'like_comment':
        return '❤️'
      case 'follow':
        return '👤'
      case 'comment':
        return '💬'
      default:
        return '🔔'
    }
  }

  // Não mostrar para usuários que não são empresas
  if (!user || !isCompany()) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={async () => {
          const wasClosed = !isOpen
          setIsOpen(!isOpen)
          
          if (wasClosed) {
            // Ao abrir, buscar notificações e marcar todas como lidas
            await fetchNotifications()
            if (unreadCount > 0) {
              await markAllAsRead()
            }
          }
        }}
        className="relative p-2.5 rounded-xl transition-all duration-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50/50"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (notification.link) {
                        router.push(notification.link)
                      }
                      if (!notification.isRead) {
                        markAsRead(notification.id)
                      }
                      setIsOpen(false)
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-purple-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
