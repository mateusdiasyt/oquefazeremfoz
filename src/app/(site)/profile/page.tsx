'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Aguardar o carregamento do usuário antes de redirecionar
    if (!loading) {
      if (user?.businessId) {
        // Buscar o slug da empresa usando a API de perfil
        fetch('/api/business/profile')
          .then(response => response.json())
          .then(data => {
            if (data.business?.slug) {
              router.push(`/empresa/${data.business.slug}`)
            } else {
              router.push('/')
            }
          })
          .catch(() => {
            router.push('/')
          })
      } else {
        router.push('/')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-dark-300 text-lg">Redirecionando...</p>
      </div>
    </div>
  )
}
