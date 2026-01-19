'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Empresa {
  id: string
  name: string
  description: string | null
  category: string
  address: string
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  whatsapp: string | null
  isApproved: boolean
  isVerified: boolean
  approvedAt: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
}

export default function AdminEmpresasPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/admin/empresas')
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data.empresas)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/empresas/${id}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchEmpresas() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/empresas/${id}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchEmpresas() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/empresas/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      })
      
      if (response.ok) {
        await fetchEmpresas() // Recarregar lista
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
          <div className="text-lg">Carregando empresas...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h1>
        <p className="text-gray-600">Aprove ou rejeite empresas cadastradas no sistema</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
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
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {empresa.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {empresa.category}
                      </div>
                      <div className="text-sm text-gray-500">
                        {empresa.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {empresa.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {empresa.user.email}
                    </div>
                    {empresa.phone && (
                      <div className="text-sm text-gray-500">
                        {empresa.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empresa.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {empresa.isApproved ? 'Aprovada' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        empresa.isVerified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {empresa.isVerified ? 'Verificado' : 'Não Verificado'}
                      </span>
                      <button
                        onClick={() => handleToggleVerification(empresa.id, empresa.isVerified)}
                        disabled={actionLoading === empresa.id}
                        className={`text-xs px-2 py-1 rounded ${
                          empresa.isVerified
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === empresa.id 
                          ? '...' 
                          : empresa.isVerified 
                            ? 'Desverificar' 
                            : 'Verificar'
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(empresa.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!empresa.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(empresa.id)}
                            disabled={actionLoading === empresa.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === empresa.id ? 'Aprovando...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReject(empresa.id)}
                            disabled={actionLoading === empresa.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === empresa.id ? 'Rejeitando...' : 'Rejeitar'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(empresa.id)}
                          disabled={actionLoading === empresa.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === empresa.id ? 'Rejeitando...' : 'Rejeitar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {empresas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma empresa cadastrada</p>
          </div>
        )}
      </div>
    </main>
  )
}
