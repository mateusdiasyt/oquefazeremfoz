'use client'

import { useState, useEffect } from 'react'

interface UploadStats {
  totalFiles: number
  totalSize: number
  totalSizeMB: string
  breakdown: {
    images: {
      count: number
      size: number
      sizeMB: string
    }
    videos: {
      count: number
      size: number
      sizeMB: string
    }
  }
}

export default function UploadManagement() {
  const [stats, setStats] = useState<UploadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/upload/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    setCleaning(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/upload/cleanup', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage(data.message)
        fetchStats() // Atualizar estatísticas
      } else {
        setMessage('Erro ao executar limpeza')
      }
    } catch (error) {
      setMessage('Erro ao executar limpeza')
    } finally {
      setCleaning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Carregando estatísticas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Uploads</h1>
          <p className="mt-2 text-gray-600">Monitore e gerencie o uso de espaço em disco</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('concluída') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total de Arquivos</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalFiles}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Espaço Total</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalSizeMB} MB</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Imagens</h3>
              <p className="text-2xl font-bold text-green-600">{stats.breakdown.images.count}</p>
              <p className="text-sm text-gray-600">{stats.breakdown.images.sizeMB} MB</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Vídeos</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.breakdown.videos.count}</p>
              <p className="text-sm text-gray-600">{stats.breakdown.videos.sizeMB} MB</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Limpeza Automática</h2>
          <p className="text-gray-600 mb-4">
            Remove automaticamente arquivos com mais de 30 dias para liberar espaço em disco.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cleaning ? 'Executando...' : 'Executar Limpeza'}
            </button>
            
            <button
              onClick={fetchStats}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Atualizar Estatísticas
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Limites de Upload</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Imagens</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Formatos: JPG, PNG, GIF, WebP</li>
                <li>• Tamanho máximo: 5MB</li>
                <li>• Armazenamento: public/uploads/images/</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vídeos</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Formatos: MP4, AVI, MOV, WMV, WebM</li>
                <li>• Tamanho máximo: 32MB</li>
                <li>• Armazenamento: public/uploads/videos/</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






