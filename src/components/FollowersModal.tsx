'use client'

import { useState, useEffect } from 'react'
import { X, Users, User } from 'lucide-react'

interface Follower {
  id: string
  name: string
  email: string
  profileImage?: string
  followedAt: string
}

interface FollowersModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
}

export default function FollowersModal({ isOpen, onClose, businessId, businessName }: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && businessId) {
      fetchFollowers()
    }
  }, [isOpen, businessId])

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/business/${businessId}/followers`)
      
      if (response.ok) {
        const data = await response.json()
        setFollowers(data.followers || [])
      } else {
        console.error('Erro ao buscar seguidores:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar seguidores:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Seguidores</h3>
              <p className="text-sm text-gray-500">{businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : followers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Nenhum seguidor ainda
              </h4>
              <p className="text-gray-500 text-sm">
                Seja o primeiro a seguir esta empresa!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {followers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {follower.profileImage ? (
                      <img
                        src={follower.profileImage}
                        alt={follower.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {follower.name || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Seguindo desde {formatDate(follower.followedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {followers.length} {followers.length === 1 ? 'seguidor' : 'seguidores'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
