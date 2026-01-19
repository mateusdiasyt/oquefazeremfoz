'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations()
    }
  }, [isOpen, user])

  // Polling inteligente - só quando a janela está ativa
  useEffect(() => {
    if (!isOpen || !user || !selectedConversation) return

    // Só fazer polling se a conversa for real (não temporária)
    if (selectedConversation.id.startsWith('temp-')) {
      return
    }

    let interval: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        fetchMessages(selectedConversation.id)
      }, 15000) // Verificar a cada 15 segundos
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
  }, [isOpen, user, selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      console.log('Buscando conversas...')
      const response = await fetch('/api/messages/conversations')
      console.log('Resposta fetchConversations:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Conversas encontradas:', data.conversations)
        setConversations(data.conversations || [])
      } else {
        const errorData = await response.json()
        console.error('Erro ao buscar conversas:', errorData)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('🔍 Buscando mensagens para conversa:', conversationId)
      setLoading(true)
      const response = await fetch(`/api/messages/${conversationId}`)
      
      console.log('📨 Resposta fetchMessages:', response.status)
        if (response.ok) {
          const data = await response.json()
        const newMessages = data.messages || []
        console.log('💬 Mensagens encontradas:', newMessages.length)
        console.log('📋 Dados das mensagens:', newMessages)
        
        // Verificar se há mensagens novas (não enviadas pelo usuário atual)
        const hasNewMessages = newMessages.some((msg: Message) => 
          msg.receiver?.id === user?.id && !msg.isRead
        )
        
        if (hasNewMessages) {
          playMessageSound()
        }
        
        setMessages(newMessages)
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao buscar mensagens:', errorData)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) {
      console.log('Condições não atendidas:', { 
        hasMessage: !!newMessage.trim(), 
        hasConversation: !!selectedConversation, 
        hasUser: !!user 
      })
      return
    }

    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      console.log('Enviando mensagem:', { messageContent, conversationId: selectedConversation.id })
      
      // Primeiro, encontrar ou criar conversa
      let conversation = selectedConversation
      if (!conversation.id) {
        console.log('Criando nova conversa para businessId:', conversation.business!.id)
        const startResponse = await fetch('/api/messages/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: conversation.business!.id })
        })
        
        console.log('Resposta start conversation:', startResponse.status)
        if (startResponse.ok) {
          const startData = await startResponse.json()
          conversation = startData.conversation
          setSelectedConversation(conversation)
          console.log('Nova conversa criada:', conversation)
        } else {
          const errorData = await startResponse.json()
          console.error('Erro ao criar conversa:', errorData)
          return
        }
      }

      // Enviar mensagem
      console.log('Enviando mensagem para conversa:', conversation.id)
      const response = await fetch(`/api/messages/${conversation!.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          receiverId: conversation.business?.userId
        })
      })

      console.log('📤 Resposta send message:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Mensagem enviada com sucesso:', data)
        
        // Se a conversa era temporária, agora temos uma conversa real
        if (conversation.id.startsWith('temp-') && data.message) {
          console.log('🔄 Conversa temporária convertida para real')
          // Atualizar a conversa selecionada com o ID real
          const realConversationId = data.message.conversationId || data.message.id
          console.log('🆔 ID real da conversa:', realConversationId)
          
          // Atualizar selectedConversation com ID real
          setSelectedConversation(prev => ({
            ...prev!,
            id: realConversationId
          }))
          
          // Buscar mensagens da conversa real
          await fetchMessages(realConversationId)
        } else {
          // Para conversas já existentes, buscar mensagens normalmente
          console.log('🔄 Atualizando mensagens da conversa:', conversation.id)
          if (conversation.id) {
            await fetchMessages(conversation.id)
          }
        }
        
        // Atualizar lista de conversas
        console.log('🔄 Atualizando lista de conversas')
        fetchConversations()
      } else {
        const errorData = await response.json()
        console.error('❌ Erro ao enviar mensagem:', errorData)
      }
    } catch (error) {
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
                            className="w-full p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
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
                              
                          <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm text-gray-800 truncate">
                                    {conversation.business?.name}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {conversation.lastMessage && formatConversationTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                                
                                <p className="text-sm text-gray-600 truncate mt-1 text-left">
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
                      {loading ? (
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
                                  <div className="flex items-center">
                                    {message.isRead ? (
                                      <CheckCheck size={12} className="text-blue-300" />
                                    ) : (
                                      <Check size={12} className="opacity-70" />
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