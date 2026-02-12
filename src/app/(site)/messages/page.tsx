'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { MessageCircle, Send, Check, CheckCheck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Conversation = {
  id: string
  business?: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
    userId: string
  } | null
  guide?: {
    id: string
    name: string
    slug: string | null
    profileImage: string | null
    isVerified: boolean
    userId: string
  } | null
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    isRead: boolean
    sender: { id: string; name: string; business?: { name: string } }
  } | null
  unreadCount: number
  updatedAt: string
}

type Message = {
  id: string
  content: string
  isRead: boolean
  createdAt: string
  sender: { id: string; name: string; profileImage?: string | null; isVerified?: boolean }
  receiver: { id: string; name: string; profileImage?: string | null; isVerified?: boolean }
}

function getOtherUserId(conv: Conversation): string | null {
  return conv.guide?.userId ?? conv.business?.userId ?? null
}

function getDisplayName(conv: Conversation): string {
  return conv.guide?.name ?? conv.business?.name ?? 'Conversa'
}

function getProfileImage(conv: Conversation): string | null {
  return conv.guide?.profileImage ?? conv.business?.profileImage ?? null
}

function getIsVerified(conv: Conversation): boolean {
  return conv.guide?.isVerified ?? conv.business?.isVerified ?? false
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [openingGuideId, setOpeningGuideId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/messages/conversations', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (conversationId.startsWith('temp-')) {
        setMessages([])
        return
      }
      try {
        const res = await fetch(`/api/messages/${conversationId}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages ?? [])
        }
      } catch {
        setMessages([])
      }
    },
    []
  )

  // Abrir conversa com guia/empresa via query (?guideId= ou ?businessId=)
  useEffect(() => {
    if (!user) return
    const guideId = searchParams.get('guideId')
    const businessId = searchParams.get('businessId')
    if (guideId) {
      setOpeningGuideId(guideId)
      fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      })
        .then((r) => r.json())
        .then((data) => {
          const conv = data.conversation
          if (conv) {
            setConversations((prev) => {
              const exists = prev.some((c) => c.id === conv.id)
              if (exists) return prev.map((c) => (c.id === conv.id ? conv : c))
              return [conv, ...prev]
            })
            setSelectedConversation(conv)
            fetchMessages(conv.id)
          }
        })
        .finally(() => setOpeningGuideId(null))
    } else if (businessId) {
      fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
        .then((r) => r.json())
        .then((data) => {
          const conv = data.conversation
          if (conv) {
            setConversations((prev) => {
              const exists = prev.some((c) => c.id === conv.id)
              if (exists) return prev.map((c) => (c.id === conv.id ? conv : c))
              return [conv, ...prev]
            })
            setSelectedConversation(conv)
            fetchMessages(conv.id)
          }
        })
    }
  }, [user, searchParams, fetchMessages])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversation?.id && !selectedConversation.id.startsWith('temp-')) {
      fetchMessages(selectedConversation.id)
      const t = setInterval(() => fetchMessages(selectedConversation.id), 6000)
      return () => clearInterval(t)
    }
  }, [selectedConversation?.id, fetchMessages])

  useEffect(() => {
    if (!user) return
    const t = setInterval(fetchConversations, 10000)
    return () => clearInterval(t)
  }, [user, fetchConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const otherUserId = selectedConversation ? getOtherUserId(selectedConversation) : null
    if (!newMessage.trim() || !otherUserId || !user) return

    setSending(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: otherUserId, content: newMessage.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.data])
        setNewMessage('')
        const wasTemp = selectedConversation?.id.startsWith('temp-')
        const prevConv = selectedConversation
        const res2 = await fetch('/api/messages/conversations', { cache: 'no-store' })
        if (res2.ok) {
          const data2 = await res2.json()
          const list = data2.conversations ?? []
          setConversations(list)
          if (wasTemp && prevConv) {
            const real = list.find(
              (c: Conversation) =>
                (prevConv.business && c.business?.id === prevConv.business?.id) ||
                (prevConv.guide && c.guide?.id === prevConv.guide?.id)
            )
            if (real) setSelectedConversation(real)
          }
        }
      }
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const d = new Date(dateString)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
    if (diff < 24) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  if (!user) return <></>

  const openingItem: Conversation = {
    id: 'opening',
    guide: { id: '', name: 'Abrindo...', userId: '', profileImage: null, isVerified: false, slug: null },
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  }
  const displayList = openingGuideId ? [openingItem, ...conversations] : conversations

  const content = (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)] min-h-[420px]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <MessageCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <h1 className="text-lg font-semibold text-gray-900">Mensagens</h1>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Lista de conversas */}
            <div
              className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${
                selectedConversation ? 'hidden md:flex' : ''
              }`}
            >
              {loading ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 && !openingGuideId ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Nenhuma conversa</p>
                  <p className="text-xs text-gray-400 mt-1">Ao clicar em &quot;Enviar mensagem&quot; em um guia ou empresa, a conversa aparece aqui.</p>
                </div>
              ) : (
                <ul className="flex-1 overflow-y-auto">
                  {displayList.map((conv) => {
                    if (conv.id === 'opening') {
                      return (
                        <li key="opening" className="px-4 py-3 border-b border-gray-100 bg-gray-50 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <span className="text-sm text-gray-500">Abrindo conversa...</span>
                          </div>
                        </li>
                      )
                    }
                    const isSelected = selectedConversation?.id === conv.id
                    return (
                      <li
                        key={conv.id}
                        role="button"
                        onClick={() => setSelectedConversation(conv)}
                        className={`px-4 py-3 border-b border-gray-100 transition-colors ${
                          isSelected ? 'bg-purple-50 border-l-2 border-l-purple-500' : 'hover:bg-gray-50'
                        } ${conv.unreadCount > 0 ? 'bg-purple-50/50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {getProfileImage(conv) ? (
                              <img
                                src={getProfileImage(conv)!}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                                {getDisplayName(conv).charAt(0).toUpperCase()}
                              </div>
                            )}
                            {conv.unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-purple-600 text-white text-xs font-medium rounded-full">
                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm truncate block ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                                {getDisplayName(conv)}
                              </span>
                              {getIsVerified(conv) && (
                                <img src="/icons/verificado.png" alt="" className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {conv.lastMessage.sender.id === user.id ? 'Você: ' : ''}
                                {conv.lastMessage.content}
                              </p>
                            )}
                            {conv.lastMessage && (
                              <span className="text-[11px] text-gray-400">{formatTime(conv.lastMessage.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Área do chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedConversation ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100"
                      aria-label="Voltar para lista"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {getProfileImage(selectedConversation) ? (
                      <img
                        src={getProfileImage(selectedConversation)!}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                        {getDisplayName(selectedConversation).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 truncate block">{getDisplayName(selectedConversation)}</span>
                        {getIsVerified(selectedConversation) && (
                          <img src="/icons/verificado.png" alt="" className="w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Conversa</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedConversation.id.startsWith('temp-') ? (
                      <p className="text-sm text-gray-500 text-center py-4">Envie uma mensagem para iniciar a conversa.</p>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender.id === user.id
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                                isMe
                                  ? 'bg-purple-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                <span className="text-[11px]">{formatTime(msg.createdAt)}</span>
                                {isMe && (msg.isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />)}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="w-14 h-14 text-gray-200 mb-4" />
                  <p className="text-gray-500 text-sm">Selecione uma conversa ou abra o link &quot;Enviar mensagem&quot; no perfil de um guia ou empresa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return content;
}
