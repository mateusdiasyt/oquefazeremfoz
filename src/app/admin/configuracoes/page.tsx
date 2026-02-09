'use client'

import { useState, useEffect } from 'react'

export default function AdminConfiguracoesPage() {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [geminiApiKeySet, setGeminiApiKeySet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setGeminiApiKeySet(!!data.geminiApiKeySet)
        setGeminiApiKey('')
      })
      .catch(() => setMessage({ type: 'err', text: 'Erro ao carregar configurações.' }))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiApiKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar')
      setGeminiApiKeySet(!!geminiApiKey.trim())
      setGeminiApiKey('')
      setMessage({ type: 'ok', text: 'API key salva com sucesso.' })
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao salvar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <p className="text-sm text-gray-600 mb-8">Configurações gerais do sistema.</p>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <section className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">API (Bot de IA)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Chave da API do Google Gemini para o criador de conteúdo. Obtenha em{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Google AI Studio
            </a>
            .
          </p>
          <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder={geminiApiKeySet ? '•••••••• (deixe em branco para manter)' : 'Cole sua API key do Gemini'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
          {geminiApiKeySet && (
            <p className="text-xs text-green-600 mt-2">API key configurada. Use o campo acima para alterá-la.</p>
          )}
        </section>
      )}

      {message && (
        <p
          className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.text}
        </p>
      )}
    </main>
  )
}
