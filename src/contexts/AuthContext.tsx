'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  profileImage: string | null
  roles: string[]
  businessId?: string
  activeBusinessId?: string
  businesses?: Array<{ id: string }>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAdmin: () => boolean
  isCompany: () => boolean
  isTourist: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  // Verificar se o usuário está logado apenas uma vez ao inicializar
  useEffect(() => {
    if (!hasChecked) {
      checkAuth()
      setHasChecked(true)
    }
  }, [hasChecked])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store' // Evitar cache do navegador
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) setUser(data.user)
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setHasChecked(true)
        await refreshUser() // Atualiza com profileImage (empresa/guia) do /api/auth/me
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Erro no login' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setUser(null)
      setHasChecked(false) // Resetar para verificar novamente se necessário
    }
  }

  const isAdmin = (): boolean => {
    return user?.roles.includes('ADMIN') || false
  }

  const isCompany = (): boolean => {
    return user?.roles.includes('COMPANY') || false
  }

  const isTourist = (): boolean => {
    return user?.roles.includes('TOURIST') || false
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser, 
      isAdmin, 
      isCompany, 
      isTourist 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
