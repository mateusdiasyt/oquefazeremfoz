'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Building2,
  ExternalLink,
  CheckCircle,
  Trash2,
  Edit2,
  Loader2,
  User,
  Heart,
  MessageCircle,
  ArrowUpDown,
} from 'lucide-react'
import SEOPanel from '@/components/SEOPanel'

type Tab = 'releases' | 'posts' | 'pending'

interface Release {
  id: string
  title: string
  slug: string
  lead: string | null
  createdAt: string
  business: { id: string; name: string; slug: string }
}

interface Post {
  id: string
  title: string
  body: string | null
  createdAt: string
  likes: number
  _count?: { comment: number }
  business: { id: string; name: string; slug: string } | null
  guide: { id: string; name: string; slug: string } | null
}

interface Pending {
  id: string
  title: string
  lead: string | null
  body: string
  featuredImageUrl?: string | null
  scheduledAt?: string | null
  status: string
  createdAt: string
  business: { id: string; name: string; slug: string }
}

export default function AdminConteudoPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [releases, setReleases] = useState<Release[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [pending, setPending] = useState<Pending[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<Pending | null>(null)
  const [editForm, setEditForm] = useState({ title: '', lead: '', body: '', scheduledAt: '' })
  const [editFeaturedFile, setEditFeaturedFile] = useState<File | null>(null)
  const [editFeaturedPreview, setEditFeaturedPreview] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [postsSortBy, setPostsSortBy] = useState<'recent' | 'likes' | 'comments'>('recent')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/conteudo')
      .then((res) => res.json())
      .then((data) => {
        setReleases(data.releases || [])
        setPosts(data.posts || [])
        setPending(data.pending || [])
      })
      .catch(() => setMessage({ type: 'err', text: 'Erro ao carregar conteúdo.' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    fetch('/api/admin/conteudo/publish-scheduled', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.published?.length > 0) {
          load()
          setMessage({ type: 'ok', text: data.message || 'Agendamentos publicados.' })
        }
      })
      .catch(() => {})
  }, [])

  const handleConcluir = async (id: string) => {
    setActionId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/conteudo/pending/${id}/concluir`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro')
      setMessage({ type: 'ok', text: 'Publicado como release com sucesso!' })
      load()
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao concluir.' })
    } finally {
      setActionId(null)
    }
  }

  const handleDeletePending = async (id: string) => {
    if (!confirm('Remover este conteúdo pendente?')) return
    setActionId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/conteudo/pending/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro')
      setMessage({ type: 'ok', text: 'Removido.' })
      setEditModal(null)
      load()
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao remover.' })
    } finally {
      setActionId(null)
    }
  }

  const toDatetimeLocal = (iso: string | null | undefined) => {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day}T${h}:${min}`
  }

  const scheduledAtForApi = (localDatetime: string) => {
    if (!localDatetime) return null
    const d = new Date(localDatetime)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString()
  }

  const openEdit = (p: Pending) => {
    setEditModal(p)
    setEditForm({
      title: p.title,
      lead: p.lead || '',
      body: p.body,
      scheduledAt: toDatetimeLocal(p.scheduledAt),
    })
    setEditFeaturedFile(null)
    setEditFeaturedPreview(p.featuredImageUrl || '')
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return
      setEditFeaturedFile(file)
      const reader = new FileReader()
      reader.onload = () => setEditFeaturedPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveEdit = async () => {
    if (!editModal) return
    setActionId(editModal.id)
    setMessage(null)
    try {
      let res: Response
      if (editFeaturedFile) {
        const formData = new FormData()
        formData.append('title', editForm.title)
        formData.append('lead', editForm.lead)
        formData.append('body', editForm.body)
        formData.append('scheduledAt', scheduledAtForApi(editForm.scheduledAt) ?? '')
        formData.append('featuredImage', editFeaturedFile)
        res = await fetch(`/api/admin/conteudo/pending/${editModal.id}`, {
          method: 'PATCH',
          body: formData,
        })
      } else {
        res = await fetch(`/api/admin/conteudo/pending/${editModal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editForm.title,
            lead: editForm.lead,
            body: editForm.body,
            scheduledAt: scheduledAtForApi(editForm.scheduledAt),
          }),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro')
      setMessage({ type: 'ok', text: 'Atualizado.' })
      setEditModal(null)
      setEditFeaturedPreview('')
      load()
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Erro ao salvar.' })
    } finally {
      setActionId(null)
    }
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const sortedPosts = [...posts].sort((a, b) => {
    if (postsSortBy === 'likes') return (b.likes ?? 0) - (a.likes ?? 0)
    if (postsSortBy === 'comments') return (b._count?.comment ?? 0) - (a._count?.comment ?? 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: 'pending', label: 'Pendentes (IA)', icon: Sparkles },
    { id: 'releases', label: 'Releases', icon: FileText },
    { id: 'posts', label: 'Posts', icon: ImageIcon },
  ]

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Conteúdo</h1>
      <p className="text-sm text-gray-600 mb-6">
        Releases e posts de todas as empresas. Conteúdos criados pela IA ficam como pendentes até você concluir a postagem.
      </p>

      {message && (
        <p className={`mb-4 text-sm ${message.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'pending' && pending.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {tab === 'pending' && (
            <div className="space-y-4">
              {pending.length === 0 ? (
                <p className="text-gray-500 py-8">Nenhum conteúdo pendente. Crie no Bot Criador de Conteúdo.</p>
              ) : (
                pending.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        {p.business.name}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(p.createdAt)}</p>
                      {p.scheduledAt && (
                        <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                          Agendado para {formatDate(p.scheduledAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConcluir(p.id)}
                        disabled={actionId === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePending(p.id)}
                        disabled={actionId === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'releases' && (
            <div className="space-y-4">
              {releases.length === 0 ? (
                <p className="text-gray-500 py-8">Nenhum release publicado.</p>
              ) : (
                releases.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{r.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        {r.business.name}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                    <Link
                      href={`/empresa/${r.business.slug}/release/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-500 py-8">Nenhum post.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <ArrowUpDown className="w-4 h-4" />
                      Ordenar por:
                    </span>
                    <select
                      value={postsSortBy}
                      onChange={(e) => setPostsSortBy(e.target.value as 'recent' | 'likes' | 'comments')}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="recent">Mais recentes</option>
                      <option value="likes">Mais curtidas</option>
                      <option value="comments">Mais comentários</option>
                    </select>
                  </div>
                  {sortedPosts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          {p.business ? (
                            <>
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              {p.business.name}
                            </>
                          ) : p.guide ? (
                            <>
                              <User className="w-4 h-4 flex-shrink-0" />
                              {p.guide.name}
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(p.createdAt)}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1" title="Curtidas">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            {p.likes ?? 0} curtidas
                          </span>
                          <span className="flex items-center gap-1" title="Comentários">
                            <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                            {p._count?.comment ?? 0} comentários
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver no feed
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Editar conteúdo pendente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (lead)</label>
                <textarea
                  value={editForm.lead}
                  onChange={(e) => setEditForm((f) => ({ ...f, lead: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corpo (HTML)</label>
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <div className="mt-3">
                  <SEOPanel title={editForm.title} lead={editForm.lead} bodyHtml={editForm.body} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agendar publicação</label>
                <input
                  type="datetime-local"
                  value={editForm.scheduledAt}
                  onChange={(e) => setEditForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Defina data e hora para publicar automaticamente. Deixe em branco para publicar manualmente (Concluir).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de destaque (thumb)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP. Máximo 5MB.</p>
                {editFeaturedPreview && (
                  <img src={editFeaturedPreview} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-xl border border-gray-200" />
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={actionId === editModal.id}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionId === editModal.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
