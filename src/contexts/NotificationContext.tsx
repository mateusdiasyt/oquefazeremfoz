'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Notification from '../components/Notification'
import { useNotificationSound } from '../hooks/useNotificationSound'

interface NotificationData {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number, playSound?: boolean) => void
  showSuccess: (message: string, duration?: number, playSound?: boolean) => void
  showError: (message: string, duration?: number, playSound?: boolean) => void
  showWarning: (message: string, duration?: number, playSound?: boolean) => void
  showInfo: (message: string, duration?: number, playSound?: boolean) => void
  playMessageSound: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const { playNotificationSound, playMessageSound } = useNotificationSound()

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 3000, playSound = true) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: NotificationData = { id, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
    
    // Tocar som de notificação
    if (playSound) {
      playNotificationSound()
    }
  }

  const showSuccess = (message: string, duration = 3000, playSound = true) => {
    showNotification(message, 'success', duration, playSound)
  }

  const showError = (message: string, duration = 5000, playSound = true) => {
    showNotification(message, 'error', duration, playSound)
  }

  const showWarning = (message: string, duration = 4000, playSound = true) => {
    showNotification(message, 'warning', duration, playSound)
  }

  const showInfo = (message: string, duration = 3000, playSound = true) => {
    showNotification(message, 'info', duration, playSound)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      playMessageSound
    }}>
      {children}
      
      {/* Renderizar notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

