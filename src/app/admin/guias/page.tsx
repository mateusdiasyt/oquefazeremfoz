'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Guide {
  id: string
  name: string
  description: string | null
  specialties: string | null
  languages: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  isApproved: boolean
  isVerified: boolean
  approvedAt: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
    createdAt: string
  }
}

export default function AdminGuiasPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/admin/guides')
      if (response.ok) {
        const data = await response.json()
        setGuides(data.guides)
      }
    } catch (error) {
      console.error('Erro ao buscar guias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/guides/${id}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchGuides() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao aprovar guia:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/guides/${id}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchGuides() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao rejeitar guia:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/guides/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      })
      
      if (response.ok) {
        await fetchGuides() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar verificação:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando guias...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Guias</h1>
        <p className="text-gray-600">Aprove ou rejeite guias turísticos cadastrados no sistema</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {guide.name}
                      </div>
                      {guide.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {guide.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guide.user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {guide.user.email}
                    </div>
                    {guide.phone && (
                      <div className="text-sm text-gray-500">
                        {guide.phone}
                      </div>
                    )}
                    {guide.email && (
                      <div className="text-sm text-gray-500">
                        {guide.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {guide.specialties || '-'}
                    </div>
                    {guide.languages && (
                      <div className="text-sm text-gray-500">
                        Idiomas: {guide.languages}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      guide.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {guide.isApproved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guide.isVerified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guide.isVerified ? 'Verificado' : 'Não Verificado'}
                      </span>
                      <button
                        onClick={() => handleToggleVerification(guide.id, guide.isVerified)}
                        disabled={actionLoading === guide.id}
                        className={`text-xs px-2 py-1 rounded ${
                          guide.isVerified
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === guide.id 
                          ? '...' 
                          : guide.isVerified 
                            ? 'Desverificar' 
                            : 'Verificar'
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(guide.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!guide.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(guide.id)}
                            disabled={actionLoading === guide.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === guide.id ? 'Aprovando...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReject(guide.id)}
                            disabled={actionLoading === guide.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === guide.id ? 'Rejeitando...' : 'Rejeitar'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(guide.id)}
                          disabled={actionLoading === guide.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === guide.id ? 'Rejeitando...' : 'Rejeitar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {guides.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum guia cadastrado</p>
          </div>
        )}
      </div>
    </main>
  )
}
