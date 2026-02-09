'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Search, Building2, Save, Loader2, FileText } from 'lucide-react'

interface Empresa {
  id: string
  name: string
  description: string | null
  category: string
  isApproved: boolean
}

export default function AdminBotIAPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Empresa | null>(null)
  const [topic, setTopic] = useState('')
  const [botPrompt, setBotPrompt] = useState('')
  const [promptSaving, setPromptSaving] = useState(false)
  const [generated, setGenerated] = useState<{ title: string; lead: string; body: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const filtered = empresas.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => {
    fetch('/api/admin/empresas')
      .then((res) => res.json())
      .then((data) => setEmpresas(data.empresas || []))
      .catch(() => setMessage({ type: 'err', text: 'Erro ao carregar empresas.' }))
  }, [])

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setBotPrompt(data.botSystemPrompt || '')
      })
      .catch(() => {})
  }, [])

  const handleSavePrompt = async () => {
    setPromptSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botSystemPrompt: botPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar')
      setMessage({ type: 'ok', text: 'Instruções do bot salvas.' })
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao salvar.' })
    } finally {
      setPromptSaving(false)
    }
  }

  const handleGenerate = async () => {
    if (!selected || !topic.trim()) {
      setMessage({ type: 'err', text: 'Selecione uma empresa e informe o tema.' })
      return
    }
    setGenerating(true)
    setMessage(null)
    setGenerated(null)
    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selected.id,
          topic: topic.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao gerar')
      setGenerated({
        title: data.title || '',
        lead: data.lead || '',
        body: data.body || '',
      })
      setMessage({ type: 'ok', text: 'Conteúdo gerado. Revise e clique em "Salvar e enviar para revisão" para ir para Gerenciar Conteúdo.' })
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao gerar conteúdo.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSavePending = async () => {
    if (!selected || !generated) return
    setPublishing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/conteudo/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selected.id,
          title: generated.title,
          lead: generated.lead || undefined,
          body: generated.body,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar')
      setGenerated(null)
      router.push('/admin/conteudo')
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao salvar.' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <main>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-bold">Bot Criador de Conteúdo</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Gere releases para uma empresa com IA (Gemini). O conteúdo fica pendente em Gerenciar Conteúdo até você concluir a postagem.
      </p>
      <Link
        href="/admin/conteudo"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4"
      >
        <FileText className="w-4 h-4" />
        Ir para Gerenciar Conteúdo
      </Link>

      {message && (
        <p
          className={`mb-4 text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-8 max-w-4xl">
        {/* Ensinar o bot */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ensinar o bot</h2>
          <p className="text-sm text-gray-500 mb-3">
            Defina como o bot deve se comportar e gerar textos (tom, estilo, formato da resposta).
          </p>
          <textarea
            value={botPrompt}
            onChange={(e) => setBotPrompt(e.target.value)}
            placeholder="Ex.: Você é um redator de releases para turismo em Foz do Iguaçu. Escreva em português, tom informativo. Responda apenas com JSON: title, lead, body (HTML)."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleSavePrompt}
            disabled={promptSaving}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {promptSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar instruções
          </button>
        </section>

        {/* Empresa + tema + criar */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar conteúdo para uma empresa</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pesquisar empresa</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou categoria..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa selecionada</label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">Nenhuma empresa encontrada.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtered.map((emp) => (
                    <li key={emp.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(emp)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                          selected?.id === emp.id ? 'bg-indigo-50 text-indigo-700' : ''
                        }`}
                      >
                        <Building2 className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium">{emp.name}</span>
                        {!emp.isApproved && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Pendente
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selected && (
              <p className="mt-2 text-xs text-gray-500">
                Selecionada: <strong>{selected.name}</strong>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema do conteúdo</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: O que fazer em Foz em 3 dias"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selected || !topic.trim() || generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Criar conteúdo
          </button>
        </section>

        {/* Conteúdo gerado + editar + publicar */}
        {generated && (
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo gerado</h2>
            <p className="text-sm text-gray-500 mb-4">Revise os campos abaixo e clique em &quot;Salvar e enviar para revisão&quot;. O conteúdo ficará pendente em Gerenciar Conteúdo, onde você pode concluir a postagem.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={generated.title}
                  onChange={(e) => setGenerated((g) => g && { ...g, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (lead)</label>
                <textarea
                  value={generated.lead}
                  onChange={(e) => setGenerated((g) => g && { ...g, lead: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corpo (HTML)</label>
                <textarea
                  value={generated.body}
                  onChange={(e) => setGenerated((g) => g && { ...g, body: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePending}
              disabled={publishing || !generated.title.trim() || !generated.body.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar e enviar para revisão
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
