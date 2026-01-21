'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Search } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  roles: string[]
  createdAt: string
  businessCount?: number
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    // Confirmar exclusão
    const confirmed = confirm(
      `⚠️ ATENÇÃO: Esta ação não pode ser desfeita!\n\n` +
      `Tem certeza que deseja deletar o usuário "${userName}"?\n\n` +
      `Isso irá deletar:\n` +
      `- O usuário e todas as suas sessões\n` +
      `- Todas as empresas do usuário\n` +
      `- Todos os posts, produtos e cupons\n` +
      `- Todas as mensagens e comentários\n` +
      `- Todos os likes e seguidores relacionados\n\n` +
      `Esta ação é PERMANENTE!`
    )

    if (!confirmed) return

    // Confirmar novamente
    const confirmedAgain = confirm(
      `ÚLTIMA CONFIRMAÇÃO:\n\n` +
      `Você tem CERTEZA ABSOLUTA que deseja deletar "${userName}"?\n\n` +
      `Esta ação é IRREVERSÍVEL!`
    )

    if (!confirmedAgain) return

    try {
      setDeletingUserId(userId)
      setError('')

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover usuário da lista local
        setUsers(users.filter(u => u.id !== userId))
        alert('Usuário deletado com sucesso!')
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao deletar usuário')
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      setError('Erro ao deletar usuário. Tente novamente.')
    } finally {
      setDeletingUserId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600">Visualize e gerencie todos os usuários do sistema</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {(user.name || user.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'Sem nome'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role === 'ADMIN'
                                ? 'bg-red-100 text-red-800'
                                : role === 'COMPANY'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.businessCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                        disabled={deletingUserId === user.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {deletingUserId === user.id ? 'Deletando...' : 'Deletar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total de usuários: {filteredUsers.length}
      </div>
    </main>
  )
}
