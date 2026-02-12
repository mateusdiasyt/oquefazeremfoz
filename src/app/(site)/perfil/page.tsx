'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/NotificationContext'
import {
  User,
  Mail,
  Camera,
  Star,
  Heart,
  Edit3,
  Save,
  X,
  Package,
  FileText,
  MessageCircle,
  Plus,
  Trash2,
  ExternalLink,
  Megaphone,
  Image as ImageIcon,
  Video,
} from 'lucide-react'

interface UserReview {
  id: string
  rating: number
  comment: string
  imageUrl: string | null
  createdAt: string
  business: { id: string; name: string; slug: string; profileImage: string | null; isVerified: boolean }
}

interface UserFollow {
  id: string
  business: { id: string; name: string; slug: string; profileImage: string | null; isVerified: boolean; category: string }
  createdAt: string
}

interface GuideInfo {
  id: string
  name: string
  slug: string | null
  profileImage: string | null
  isVerified: boolean
  isApproved: boolean
  followersCount?: number
  ratingAvg?: number
  ratingCount?: number
}

interface GuideProduct {
  id: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  imageUrl: string | null
  order: number
  isActive: boolean
}

interface GuidePost {
  id: string
  title: string
  body?: string
  imageUrl?: string
  videoUrl?: string
  likes: number
  createdAt: string
}

interface GuideReviewItem {
  id: string
  rating: number
  comment: string | null
  imageUrl: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { showNotification } = useNotification()

  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Dados para turista/empresa
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [follows, setFollows] = useState<UserFollow[]>([])

  // Dados para guia
  const [guide, setGuide] = useState<GuideInfo | null>(null)
  const [products, setProducts] = useState<GuideProduct[]>([])
  const [posts, setPosts] = useState<GuidePost[]>([])
  const [guideReviews, setGuideReviews] = useState<GuideReviewItem[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPriceCents, setProductPriceCents] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  type GuideSection = 'publicacoes' | 'pacotes' | 'avaliacoes'
  const [guideSection, setGuideSection] = useState<GuideSection>('publicacoes')
  const [postComposerOpen, setPostComposerOpen] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [postImageFile, setPostImageFile] = useState<File | null>(null)
  const [postVideoFile, setPostVideoFile] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null)
  const [uploadingPost, setUploadingPost] = useState(false)

  const isGuide = user?.roles?.includes('GUIDE')

  useEffect(() => {
    if (user) {
      setNameValue(user.name || '')
      setEmailValue(user.email || '')
      setProfileImage(user.profileImage || null)
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    try {
      setLoading(true)
      if (isGuide) {
        const [meRes, productsRes, postsRes, reviewsRes] = await Promise.all([
          fetch('/api/guide/me'),
          fetch('/api/guide/products?guideId=placeholder').then((r) => (r.ok ? r : { ok: false })), // will refetch with real id
          fetch('/api/guide/posts?guideId=placeholder').then((r) => (r.ok ? r : { ok: false })),
          fetch('/api/guide/reviews?guideId=placeholder').then((r) => (r.ok ? r : { ok: false })),
        ])
        const meData = meRes.ok ? await meRes.json() : {}
        const guideInfo = meData.guide || null
        setGuide(guideInfo)
        if (guideInfo?.id) {
          const [pRes, ptRes, rRes] = await Promise.all([
            fetch(`/api/guide/products?guideId=${guideInfo.id}`),
            fetch(`/api/guide/posts?guideId=${guideInfo.id}`),
            fetch(`/api/guide/reviews?guideId=${guideInfo.id}`),
          ])
          if (pRes.ok) {
            const plist = await pRes.json()
            setProducts(Array.isArray(plist) ? plist : plist.products || [])
          }
          if (ptRes.ok) {
            const ptData = await ptRes.json()
            setPosts(ptData.posts || [])
          }
          if (rRes.ok) {
            const rData = await rRes.json()
            setGuideReviews(rData.reviews || [])
          }
        }
      } else {
        const [reviewsRes, followsRes] = await Promise.all([
          fetch('/api/user/reviews'),
          fetch('/api/user/follows'),
        ])
        if (reviewsRes.ok) {
          const d = await reviewsRes.json()
          setReviews(d.reviews || [])
        }
        if (followsRes.ok) {
          const d = await followsRes.json()
          setFollows(d.follows || [])
        }
      }
    } catch (e) {
      console.error(e)
      showNotification('Erro ao carregar dados do perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      showNotification('Apenas imagens até 5MB', 'error')
      return
    }
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/user/profile-image', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setProfileImage(data.profileImage)
        await refreshUser()
        showNotification('Foto atualizada!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showNotification(err?.message || 'Erro ao atualizar foto', 'error')
      }
    } catch {
      showNotification('Erro ao fazer upload', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateName = async () => {
    if (!nameValue.trim()) return
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue.trim() }),
      })
      if (res.ok) {
        showNotification('Nome atualizado!', 'success')
        setEditingName(false)
      } else showNotification('Erro ao atualizar nome', 'error')
    } catch {
      showNotification('Erro ao atualizar nome', 'error')
    }
  }

  const handleUpdateEmail = async () => {
    if (!emailValue.trim()) return
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue.trim() }),
      })
      if (res.ok) {
        showNotification('Email atualizado!', 'success')
        setEditingEmail(false)
      } else showNotification('Erro ao atualizar email', 'error')
    } catch {
      showNotification('Erro ao atualizar email', 'error')
    }
  }

  const handleAddProduct = async () => {
    if (!guide?.id || !productName.trim() || !productPriceCents) {
      showNotification('Preencha nome e valor do pacote', 'error')
      return
    }
    setSavingProduct(true)
    try {
      const res = await fetch('/api/guide/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: guide.id,
          name: productName.trim(),
          description: productDescription.trim() || null,
          priceCents: Math.round(parseFloat(productPriceCents.replace(',', '.')) * 100) || 0,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setProducts((p) => [created, ...p])
        setProductName('')
        setProductDescription('')
        setProductPriceCents('')
        setShowProductForm(false)
        showNotification('Pacote cadastrado!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showNotification(err?.message || 'Erro ao cadastrar', 'error')
      }
    } catch {
      showNotification('Erro ao cadastrar pacote', 'error')
    } finally {
      setSavingProduct(false)
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guide?.id || !postTitle.trim()) {
      showNotification('Título é obrigatório', 'error')
      return
    }
    setUploadingPost(true)
    try {
      const formData = new FormData()
      formData.append('guideId', guide.id)
      formData.append('title', postTitle.trim())
      formData.append('body', postBody.trim())
      if (postImageFile) formData.append('image', postImageFile)
      if (postVideoFile) formData.append('video', postVideoFile)
      const res = await fetch('/api/guide/posts', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => [data.post, ...prev])
        setPostTitle('')
        setPostBody('')
        setPostImageFile(null)
        setPostVideoFile(null)
        setPostImagePreview(null)
        setPostVideoPreview(null)
        setPostComposerOpen(false)
        showNotification('Publicação criada!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showNotification(err?.message || 'Erro ao publicar', 'error')
      }
    } catch {
      showNotification('Erro ao publicar', 'error')
    } finally {
      setUploadingPost(false)
    }
  }

  const handlePostDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta publicação?')) return
    try {
      const res = await fetch(`/api/guide/posts?postId=${postId}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        showNotification('Publicação excluída', 'success')
      } else {
        showNotification('Erro ao excluir', 'error')
      }
    } catch {
      showNotification('Erro ao excluir', 'error')
    }
  }

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora mesmo'
    if (min < 60) return `há ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `há ${h}h`
    return `há ${Math.floor(h / 24)} dias`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Faça login para acessar seu perfil.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ——— Guia sem perfil cadastrado ———
  if (isGuide && !guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <Package className="w-14 h-14 mx-auto text-violet-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil de guia</h2>
          <p className="text-gray-600 mb-6">Você está registrado como guia, mas ainda não possui um perfil público. Cadastre-se como guia para criar publicações e pacotes.</p>
          <Link href="/guias" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700">
            Ir para guias
          </Link>
        </div>
      </div>
    )
  }

  // ——— Perfil GUIA ———
  if (isGuide && guide) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="card p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                {(profileImage || guide.profileImage) ? (
                  <img
                    src={profileImage || guide.profileImage || ''}
                    alt=""
                    className="w-28 h-28 rounded-2xl border-2 border-gray-100 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-violet-100 border-2 border-violet-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-violet-600">{(guide.name || user.name)?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 bg-violet-500 text-white p-2 rounded-full cursor-pointer hover:bg-violet-600 shadow-lg">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleProfileImageUpload(e.target.files[0])} disabled={uploadingImage} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-1">Guia turístico</p>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">{guide.name || user.name || 'Guia'}</h1>
                  {guide.isVerified && <img src="/icons/verificado.png" alt="Verificado" className="w-5 h-5 flex-shrink-0" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <User size={16} />
                    {user.name || '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={16} />
                    {user.email}
                  </span>
                </div>
                {guide.slug && (
                  <Link
                    href={`/guia/${guide.slug}`}
                    className="inline-flex items-center gap-2 mt-3 text-violet-600 hover:text-violet-700 font-medium text-sm"
                  >
                    <ExternalLink size={16} />
                    Ver perfil público
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-5 text-center">
              <FileText className="w-8 h-8 mx-auto text-violet-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              <p className="text-sm text-gray-500">Publicações</p>
            </div>
            <div className="card p-5 text-center">
              <Package className="w-8 h-8 mx-auto text-violet-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-sm text-gray-500">Pacotes</p>
            </div>
            <div className="card p-5 text-center">
              <Heart className="w-8 h-8 mx-auto text-violet-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{guide.followersCount ?? 0}</p>
              <p className="text-sm text-gray-500">Seguidores</p>
            </div>
            <div className="card p-5 text-center">
              <Star className="w-8 h-8 mx-auto text-violet-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{guideReviews.length}</p>
              <p className="text-sm text-gray-500">Avaliações</p>
            </div>
          </div>

          {/* Abas: clicar mostra a seção */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6 w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setGuideSection('publicacoes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                guideSection === 'publicacoes' ? 'bg-white text-violet-600 shadow-sm border border-violet-100' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <FileText size={18} />
              Publicações {posts.length > 0 && `(${posts.length})`}
            </button>
            <button
              type="button"
              onClick={() => setGuideSection('pacotes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                guideSection === 'pacotes' ? 'bg-white text-violet-600 shadow-sm border border-violet-100' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Package size={18} />
              Pacotes e preços {products.length > 0 && `(${products.length})`}
            </button>
            <button
              type="button"
              onClick={() => setGuideSection('avaliacoes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                guideSection === 'avaliacoes' ? 'bg-white text-violet-600 shadow-sm border border-violet-100' : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Star size={18} />
              Avaliações {guideReviews.length > 0 && `(${guideReviews.length})`}
            </button>
          </div>

          {/* Conteúdo da aba ativa */}
          <div className="card p-6">
            {guideSection === 'publicacoes' && (
              <>
                <div className="mb-4">
                  {!postComposerOpen ? (
                    <button
                      type="button"
                      onClick={() => setPostComposerOpen(true)}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-violet-200 hover:bg-violet-50/40 transition-all w-full text-left"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        {(profileImage || guide.profileImage) ? (
                          <img src={profileImage || guide.profileImage || ''} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg">
                            {(guide.name || user.name)?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-gray-500 text-sm">No que você está pensando?</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-violet-100 bg-violet-50/30">
                      <form onSubmit={handlePostSubmit} className="space-y-4">
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Título da publicação"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                          required
                        />
                        <textarea
                          value={postBody}
                          onChange={(e) => setPostBody(e.target.value)}
                          placeholder="No que você está pensando?"
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        />
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <ImageIcon size={18} />
                            <span>Imagem</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setPostImageFile(file)
                                  const reader = new FileReader()
                                  reader.onload = (ev) => setPostImagePreview(ev.target?.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <Video size={18} />
                            <span>Vídeo</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setPostVideoFile(file)
                                  const reader = new FileReader()
                                  reader.onload = (ev) => setPostVideoPreview(ev.target?.result as string)
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                        </div>
                        {postImagePreview && <img src={postImagePreview} alt="Preview" className="w-full max-w-sm rounded-xl object-cover h-36" />}
                        {postVideoPreview && <video src={postVideoPreview} controls className="w-full max-w-sm rounded-xl mt-2" />}
                        <div className="flex gap-2">
                          <button type="submit" disabled={uploadingPost} className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50">
                            {uploadingPost ? 'Publicando...' : 'Publicar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPostComposerOpen(false)
                              setPostTitle('')
                              setPostBody('')
                              setPostImageFile(null)
                              setPostVideoFile(null)
                              setPostImagePreview(null)
                              setPostVideoPreview(null)
                            }}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                {posts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Nenhuma publicação ainda.</p>
                    <p className="text-sm mt-1">Clique acima para criar sua primeira publicação.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {posts.map((post) => (
                      <li key={post.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900">{post.title}</p>
                            {post.body && <p className="text-sm text-gray-600 mt-1">{post.body}</p>}
                            {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-2 rounded-xl max-h-64 object-cover w-full" />}
                            {post.videoUrl && <video src={post.videoUrl} controls className="mt-2 rounded-xl max-h-64 w-full" />}
                            <p className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleString('pt-BR')} · {post.likes ?? 0} curtidas</p>
                          </div>
                          <button type="button" onClick={() => handlePostDelete(post.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {guideSection === 'pacotes' && (
              <>
                {!showProductForm ? (
                  <button
                    type="button"
                    onClick={() => setShowProductForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700"
                  >
                    <Plus size={18} />
                    Cadastrar pacote
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                    <h3 className="font-semibold text-gray-900">Novo pacote</h3>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nome do pacote (ex: Passeio Cataratas meio dia)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400"
                    />
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Descrição (opcional)"
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={productPriceCents}
                      onChange={(e) => setProductPriceCents(e.target.value)}
                      placeholder="Valor (R$)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddProduct}
                        disabled={savingProduct || !productName.trim() || !productPriceCents}
                        className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50"
                      >
                        {savingProduct ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setProductName(''); setProductDescription(''); setProductPriceCents('') }}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                {products.length === 0 && !showProductForm && (
                  <p className="text-gray-500 text-sm mt-3">Nenhum pacote cadastrado. Cadastre para exibir no perfil.</p>
                )}
                {products.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {products.map((prod) => (
                      <li key={prod.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{prod.name}</p>
                          {prod.description && <p className="text-sm text-gray-500 line-clamp-1">{prod.description}</p>}
                        </div>
                        <p className="font-semibold text-violet-600">{(prod.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {guideSection === 'avaliacoes' && (
              <>
                {guideReviews.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Star className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>Nenhuma avaliação ainda.</p>
                    <p className="text-sm mt-1">As avaliações dos turistas aparecerão aqui.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {guideReviews.map((rev) => (
                      <li key={rev.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={16} className={s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{rev.user?.name || rev.user?.email || 'Anônimo'}</span>
                          <span className="text-xs text-gray-400">{getTimeAgo(rev.createdAt)}</span>
                        </div>
                        {rev.comment && <p className="text-gray-700 text-sm">{rev.comment}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ——— Perfil TURISTA / EMPRESA (layout original) ———
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profileImage ? (
                <img src={profileImage} alt="" className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-strong bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{(user?.name || user?.email)?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 shadow-lg">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleProfileImageUpload(e.target.files[0])} disabled={uploadingImage} />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{user?.name || 'Usuário'}</h1>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-500" />
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200" placeholder="Seu nome" />
                      <button onClick={handleUpdateName} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16} /></button>
                      <button onClick={() => { setEditingName(false); setNameValue(user?.name || '') }} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user?.name || 'Nome não informado'}</span>
                      <button onClick={() => setEditingName(true)} className="p-1 text-gray-400 hover:text-pink-600 rounded"><Edit3 size={14} /></button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-500" />
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200" placeholder="Seu email" />
                      <button onClick={handleUpdateEmail} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={16} /></button>
                      <button onClick={() => { setEditingEmail(false); setEmailValue(user?.email || '') }} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user?.email}</span>
                      <button onClick={() => setEditingEmail(true)} className="p-1 text-gray-400 hover:text-pink-600 rounded"><Edit3 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3"><Star className="w-6 h-6 text-white" /></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{reviews.length}</h3>
            <p className="text-gray-600">Avaliações</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3"><Heart className="w-6 h-6 text-white" /></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{follows.length}</h3>
            <p className="text-gray-600">Empresas Seguidas</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Suas Avaliações</h2>
            {reviews.length === 0 ? (
              <div className="card p-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma avaliação ainda</h3>
                <p className="text-gray-500">Comece a avaliar empresas para ver suas avaliações aqui!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                        {review.business.profileImage ? <img src={review.business.profileImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-semibold border-2 border-purple-200">{review.business.name.charAt(0).toUpperCase()}</div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{review.business.name}</h4>
                          {review.business.isVerified && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                          <span className="text-sm text-gray-500">{getTimeAgo(review.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}
                        </div>
                        {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
                        {review.imageUrl && <img src={review.imageUrl} alt="" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Empresas que Você Segue</h2>
            {follows.length === 0 ? (
              <div className="card p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma empresa seguida</h3>
                <p className="text-gray-500">Comece a seguir empresas para vê-las aqui!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {follows.map((follow) => (
                  <div key={follow.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                        {follow.business.profileImage ? <img src={follow.business.profileImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-purple-600 font-semibold border-2 border-purple-200">{follow.business.name.charAt(0).toUpperCase()}</div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{follow.business.name}</h4>
                          {follow.business.isVerified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{follow.business.category}</p>
                        <p className="text-xs text-gray-500">Seguindo desde {new Date(follow.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
