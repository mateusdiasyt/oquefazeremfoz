'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { MessageCircle, X, Send, ChevronDown, ChevronUp, Search, ArrowLeft, Check, CheckCheck } from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  profileImage: string | null
  isVerified: boolean
  category: string
  followedAt: string
  userId?: string
}

interface Message {
  id: string
  content: string
  sender?: {
    id: string
    name: string
    business?: {
      id: string
      name: string
      profileImage: string | null
    }
  }
  receiver?: {
    id: string
    name: string
    business?: {
      id: string
      name: string
      profileImage: string | null
    }
  }
  createdAt: string
  isRead: boolean
}

interface Conversation {
  id: string
  business: Business | null
  lastMessage: Message | null
  unreadCount?: number
  updatedAt: string
}

export default function FloatingChat() {
  const { user } = useAuth()
  const { playMessageSound } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef<number>(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      
      if (response.ok) {
        const data = await response.json()
        const newConversations = data.conversations || []
        
        // ✅ CORREÇÃO: Comparar antes de atualizar (evita re-render desnecessário)
        const hasChanges = 
          newConversations.length !== conversations.length ||
          JSON.stringify(newConversations.map(c => ({ id: c.id, unreadCount: c.unreadCount }))) !==
          JSON.stringify(conversations.map(c => ({ id: c.id, unreadCount: c.unreadCount })))
        
        if (hasChanges) {
          setConversations(newConversations)
        }
      } else {
        const errorData = await response.json()
        console.error('Erro ao buscar conversas:', errorData)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    }
  }, [conversations])

  const fetchMessages = useCallback(async (conversationId: string, silent: boolean = false) => {
    try {
      // Apenas mostrar loading se for carregamento inicial (não há mensagens) e não for silencioso
      if (!silent && messages.length === 0) {
        setIsInitialLoading(true)
      }

      const response = await fetch(`/api/messages/${conversationId}`)
      
      if (response.ok) {
        const data = await response.json()
        const newMessages = data.messages || []
        
        // ✅ CORREÇÃO: Comparação leve usando hash
        const getMessagesHash = (msgs: Message[]) => 
          msgs.length > 0 
            ? `${msgs.length}_${msgs[msgs.length - 1].id}_${msgs[msgs.length - 1].isRead}`
            : '0'
        
        const hasChanges = 
          newMessages.length !== messages.length ||
          getMessagesHash(newMessages) !== getMessagesHash(messages)
        
        if (hasChanges) {
          // Verificar se há mensagens novas (não enviadas pelo usuário atual)
          const hasNewMessages = newMessages.some((msg: Message) => 
            msg.receiver?.id === user?.id && !msg.isRead
          )
          
          if (hasNewMessages && silent) {
            // Apenas tocar som se for atualização silenciosa com mensagens novas
            playMessageSound()
          }
          
          setMessages(newMessages)
          lastMessageCountRef.current = newMessages.length
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao buscar mensagens:', errorData)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }, [user, playMessageSound, messages])

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
    }
  }, [isOpen, user, fetchConversations])

  // Polling para lista de conversas (mesmo sem conversa selecionada)
  useEffect(() => {
    if (!isOpen || !user) return

    let interval: NodeJS.Timeout | null = null

    const startConversationsPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        fetchConversations()
      }, 10000) // ✅ Aumentar para 10s (reduzir spam e carga)
    }

    const stopConversationsPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const handleFocus = () => {
      startConversationsPolling()
    }

    const handleBlur = () => {
      stopConversationsPolling()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopConversationsPolling()
      } else {
        startConversationsPolling()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    startConversationsPolling()

    return () => {
      stopConversationsPolling()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen, user, fetchConversations])

  // Polling inteligente - só quando a janela está ativa
  useEffect(() => {
    if (!isOpen || !user || !selectedConversation) return

    // Só fazer polling se a conversa for real (não temporária)
    const conversationId = selectedConversation.id
    if (conversationId.startsWith('temp-')) {
      return
    }

    let interval: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        // ✅ Polling apenas de mensagens (conversas tem polling separado)
        fetchMessages(conversationId, true)
      }, 3000) // Verificar a cada 3 segundos (mais responsivo)
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    // Iniciar polling quando a janela ganha foco
    const handleFocus = () => {
      setIsOnline(true)
      startPolling()
    }

    // Parar polling quando a janela perde foco
    const handleBlur = () => {
      setIsOnline(false)
      stopPolling()
    }

    // Verificar se a página está visível
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsOnline(false)
        stopPolling()
      } else {
        setIsOnline(true)
        startPolling()
      }
    }

    // Adicionar listeners
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Iniciar polling inicial
    startPolling()

    return () => {
      stopPolling()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen, user, selectedConversation?.id, fetchMessages, fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, true)
      // Atualizar lista de conversas após marcar como lidas
      setTimeout(() => {
        fetchConversations()
      }, 500)
    }
  }, [selectedConversation, fetchMessages, fetchConversations])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
    }
  }, [isOpen, user, fetchConversations])

  // Polling para lista de conversas (mesmo sem conversa selecionada)
  useEffect(() => {
    if (!isOpen || !user) return

    let interval: NodeJS.Timeout | null = null

    const startConversationsPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        fetchConversations()
      }, 10000) // ✅ Aumentar para 10s (reduzir spam e carga)
    }

    const stopConversationsPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const handleFocus = () => {
      startConversationsPolling()
    }

    const handleBlur = () => {
      stopConversationsPolling()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopConversationsPolling()
      } else {
        startConversationsPolling()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    startConversationsPolling()

    return () => {
      stopConversationsPolling()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen, user, fetchConversations])

  // Polling inteligente - só quando a janela está ativa
  useEffect(() => {
    if (!isOpen || !user || !selectedConversation) return

    // Só fazer polling se a conversa for real (não temporária)
    const conversationId = selectedConversation.id
    if (conversationId.startsWith('temp-')) {
      return
    }

    let interval: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        // ✅ Polling apenas de mensagens (conversas tem polling separado)
        fetchMessages(conversationId, true)
      }, 3000) // Verificar a cada 3 segundos (mais responsivo)
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    // Iniciar polling quando a janela ganha foco
    const handleFocus = () => {
      setIsOnline(true)
      startPolling()
    }

    // Parar polling quando a janela perde foco
    const handleBlur = () => {
      setIsOnline(false)
      stopPolling()
    }

    // Verificar se a página está visível
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsOnline(false)
        stopPolling()
      } else {
        setIsOnline(true)
        startPolling()
      }
    }

    // Adicionar listeners
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Iniciar polling inicial
    startPolling()

    return () => {
      stopPolling()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen, user, selectedConversation?.id, fetchMessages, fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, true)
      // Atualizar lista de conversas após marcar como lidas
      setTimeout(() => {
        fetchConversations()
      }, 500)
    }
  }, [selectedConversation, fetchMessages, fetchConversations])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) {
      return
    }

    const messageContent = newMessage.trim()
    const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // ✅ OPTIMISTIC UI: Criar mensagem otimista IMEDIATAMENTE
    const optimisticMessage: Message = {
      id: tempMessageId,
      content: messageContent,
      sender: {
        id: user.id,
        name: user.name || user.email || 'Você',
        business: user.activeBusinessId ? {
          id: user.activeBusinessId,
          name: '',
          profileImage: ''
        } : undefined
      },
      receiver: {
        id: selectedConversation.business?.userId || '',
        name: selectedConversation.business?.name || '',
        business: selectedConversation.business ? {
          id: selectedConversation.business.id,
          name: selectedConversation.business.name,
          profileImage: selectedConversation.business.profileImage || ''
        } : undefined
      },
      createdAt: new Date().toISOString(),
      isRead: false
    }

    // ✅ Atualizar UI instantaneamente (0ms de delay)
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    scrollToBottom()

    try {
      // Primeiro, encontrar ou criar conversa
      let conversation = selectedConversation
      if (conversation.id.startsWith('temp-')) {
        const startResponse = await fetch('/api/messages/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: conversation.business!.id })
        })
        
        if (startResponse.ok) {
          const startData = await startResponse.json()
          conversation = startData.conversation
          setSelectedConversation(conversation)
        } else {
          // Reverter mensagem otimista
          setMessages(prev => prev.filter(msg => msg.id !== tempMessageId))
          return
        }
      }

      // Enviar mensagem em background
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          receiverId: conversation.business?.userId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const realMessage = data.message
        
        // ✅ Substituir mensagem otimista pela real
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId ? realMessage : msg
        ))

        // Se a conversa era temporária, atualizar ID
        if (selectedConversation.id.startsWith('temp-') && realMessage.conversationId) {
          setSelectedConversation(prev => ({
            ...prev!,
            id: realMessage.conversationId
          }))
        }
        
        // Atualizar lista de conversas em background (não bloqueia)
        fetchConversations()
      } else {
        // ✅ Reverter mensagem otimista se falhar
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId))
        const errorData = await response.json()
        console.error('❌ Erro ao enviar mensagem:', errorData)
      }
    } catch (error) {
      // ✅ Reverter mensagem otimista se erro
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId))
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const formatConversationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    if (diffInDays < 1) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  if (!user) return null

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full shadow-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 z-50 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              {selectedConversation ? (
                <>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {selectedConversation.business?.profileImage ? (
                      <img
                        src={selectedConversation.business.profileImage}
                        alt={selectedConversation.business.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {selectedConversation.business?.name?.charAt(0)?.toUpperCase() || 'E'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{selectedConversation.business?.name}</h3>
                    <p className="text-xs text-white opacity-90">{selectedConversation.business?.category}</p>
                  </div>
                </>
              ) : (
                <div>
            <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">Conversas</h3>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  </div>
                  <p className="text-xs text-white opacity-90">
                    {conversations.length} conversas • {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content */}
              <div className="flex h-[520px]">
                {/* Conversations List */}
                {!selectedConversation ? (
                  <div className="w-full flex flex-col">
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar conversas..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <MessageCircle size={48} className="mb-4 opacity-50" />
                          <p className="text-sm">Nenhuma conversa ainda</p>
                          <p className="text-xs opacity-75">Comece uma conversa com uma empresa</p>
                    </div>
                  ) : (
                        conversations.map((conversation) => (
                      <button
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`w-full p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                              (conversation.unreadCount || 0) > 0 ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                                  {conversation.business?.profileImage ? (
                                    <img
                                      src={conversation.business.profileImage}
                                      alt={conversation.business.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-white font-bold">
                                      {conversation.business?.name?.charAt(0)?.toUpperCase() || 'E'}
                                    </span>
                                  )}
                                </div>
                                {(conversation.unreadCount || 0) > 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm truncate ${
                                    (conversation.unreadCount || 0) > 0 
                                      ? 'font-bold text-gray-900' 
                                      : 'font-semibold text-gray-800'
                                  }`}>
                                    {conversation.business?.name}
                                  </h4>
                                  <span className={`text-xs ${
                                    (conversation.unreadCount || 0) > 0 
                                      ? 'text-gray-700 font-medium' 
                                      : 'text-gray-500'
                                  }`}>
                                    {conversation.lastMessage && formatConversationTime(conversation.lastMessage.createdAt)}
                                  </span>
                                </div>
                                
                                <p className={`text-sm truncate mt-1 text-left ${
                                  (conversation.unreadCount || 0) > 0 
                                    ? 'font-semibold text-gray-900' 
                                    : 'text-gray-600'
                                }`}>
                                  {conversation.lastMessage?.content || 'Nenhuma mensagem ainda'}
                                </p>
                              </div>
                            </div>
                          </button>
                    ))
                  )}
                </div>
              </div>
                ) : (
                  /* Messages Area */
                  <div className="w-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {isInitialLoading ? (
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <MessageCircle size={48} className="mb-4 opacity-50" />
                          <p className="text-sm">Nenhuma mensagem ainda</p>
                          <p className="text-xs opacity-75">Envie uma mensagem para começar</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender?.id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                              message.sender?.id === user.id
                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`} style={{ textAlign: 'left' }}>
                              {message.sender?.id !== user.id && (
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  {message.sender?.name || message.sender?.business?.name || 'Usuário'}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 ${
                                message.sender?.id === user.id ? 'text-pink-100' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatTime(message.createdAt)}
                                </span>
                                {message.sender?.id === user.id && (
                                  <div className="flex items-center ml-1">
                                    {message.isRead ? (
                                      <CheckCheck size={14} className="text-blue-400" />
                                    ) : (
                                      <Check size={14} className="opacity-60" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite uma mensagem..."
                            className="w-full px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                          />
                        </div>
                        
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:from-pink-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}