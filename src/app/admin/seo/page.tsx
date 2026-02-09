'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import { Search, FileText, Save, ChevronRight } from 'lucide-react'

interface PageSeoItem {
  path: string
  label: string
  title: string
  description: string
  keywords: string
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  canonical: string | null
}

export default function AdminSEOPage() {
  const { showNotification } = useNotification()
  const [pages, setPages] = useState<PageSeoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PageSeoItem | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    robotsIndex: true,
    robotsFollow: true,
    canonical: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    if (selected) {
      setForm({
        title: selected.title || '',
        description: selected.description || '',
        keywords: selected.keywords || '',
        ogTitle: selected.ogTitle || '',
        ogDescription: selected.ogDescription || '',
        ogImage: selected.ogImage || '',
        robotsIndex: selected.robotsIndex ?? true,
        robotsFollow: selected.robotsFollow ?? true,
        canonical: selected.canonical || '',
      })
    }
  }, [selected])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/seo/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data.pages || [])
        if (!selected && data.pages?.length) setSelected(data.pages[0])
      } else {
        showNotification('Erro ao carregar páginas', 'error')
      }
    } catch (e) {
      console.error(e)
      showNotification('Erro ao carregar páginas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selected.path,
          title: form.title || null,
          description: form.description || null,
          keywords: form.keywords || null,
          ogTitle: form.ogTitle || null,
          ogDescription: form.ogDescription || null,
          ogImage: form.ogImage || null,
          robotsIndex: form.robotsIndex,
          robotsFollow: form.robotsFollow,
          canonical: form.canonical || null,
        }),
      })
      if (res.ok) {
        showNotification('SEO salvo com sucesso', 'success')
        const data = await res.json()
        setPages((prev) =>
          prev.map((p) => (p.path === selected.path ? { ...p, ...data.page } : p))
        )
        if (data.page) setSelected({ ...selected, ...data.page })
      } else {
        const data = await res.json()
        showNotification(data.message || 'Erro ao salvar', 'error')
      }
    } catch (e) {
      showNotification('Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO das Páginas</h1>
        <p className="text-gray-600 text-sm mt-1">
          Configure título, descrição e meta tags para cada página do site.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">Páginas</span>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
            {pages.map((p) => (
              <li key={p.path}>
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selected?.path === p.path ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium truncate">{p.label}</span>
                  <span className="text-xs text-gray-400 truncate ml-2">{p.path}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                {selected.label} <span className="text-gray-400 font-normal text-sm">{selected.path}</span>
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título (meta title)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: OQFOZ - O que fazer em Foz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (meta description)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Breve descrição para buscadores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Foz do Iguaçu, turismo, hotéis..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Open Graph / Redes sociais</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">og:title</label>
                    <input
                      type="text"
                      value={form.ogTitle}
                      onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Deixe vazio para usar o título"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">og:description</label>
                    <input
                      type="text"
                      value={form.ogDescription}
                      onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Deixe vazio para usar a descrição"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">og:image (URL)</label>
                    <input
                      type="url"
                      value={form.ogImage}
                      onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Robots e canonical</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.robotsIndex}
                      onChange={(e) => setForm((f) => ({ ...f, robotsIndex: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Indexar (index)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.robotsFollow}
                      onChange={(e) => setForm((f) => ({ ...f, robotsFollow: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Seguir links (follow)</span>
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL canônica</label>
                    <input
                      type="url"
                      value={form.canonical}
                      onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Deixe vazio para usar a URL padrão"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar SEO'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
              Selecione uma página na lista para editar o SEO.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
