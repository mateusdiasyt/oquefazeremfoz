'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotification } from '../../../contexts/NotificationContext'
import { Check, CheckCheck } from 'lucide-react'

interface Conversation {
  id: string
  otherParticipant: {
    id: string
    name: string
    profileImage: string | null
    isVerified: boolean
    slug: string | null
  } | null
  lastMessage: {
    id: string
    content: string
    isRead: boolean
    createdAt: string
    sender: {
      id: string
      name: string
      profileImage: string | null
    }
  } | null
  unreadCount: number
  updatedAt: string
}

interface Message {
  id: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    profileImage: string | null
    isVerified: boolean
  }
  receiver: {
    id: string
    name: string
    profileImage: string | null
    isVerified: boolean
  }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      // Atualizar lista de conversas após marcar como lidas
      setTimeout(() => {
        fetchConversations()
      }, 500)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedConversation.otherParticipant?.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.data])
        setNewMessage('')
        showNotification('Mensagem enviada!', 'success')
        
        // Atualizar lista de conversas
        fetchConversations()
      } else {
        const errorData = await response.json()
        showNotification(errorData.message, 'error')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      showNotification('Erro ao enviar mensagem', 'error')
    } finally {
      setSending(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-dark-800 rounded-2xl shadow-strong overflow-hidden">
          <div className="flex h-[600px]">
            {/* Lista de Conversas */}
            <div className="w-1/3 border-r border-dark-600">
              <div className="p-4 border-b border-dark-600">
                <h1 className="text-xl font-display font-semibold text-dark-100">Mensagens</h1>
              </div>
              
              <div className="overflow-y-auto h-full">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-dark-400">
                    <svg className="w-12 h-12 mx-auto mb-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-dark-600 cursor-pointer hover:bg-dark-700 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-dark-700' : ''
                      } ${
                        conversation.unreadCount > 0 ? 'bg-dark-750' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {conversation.otherParticipant?.profileImage ? (
                            <img
                              src={conversation.otherParticipant.profileImage}
                              alt={conversation.otherParticipant.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {conversation.otherParticipant?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className={`truncate ${
                              conversation.unreadCount > 0 
                                ? 'font-bold text-dark-100' 
                                : 'font-semibold text-dark-100'
                            }`}>
                              {conversation.otherParticipant?.name || 'Usuário'}
                            </h3>
                            {conversation.otherParticipant?.isVerified && (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976zM1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.819V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className={`text-sm truncate ${
                              conversation.unreadCount > 0 
                                ? 'font-semibold text-dark-100' 
                                : 'text-dark-400'
                            }`}>
                              {conversation.lastMessage.sender.id === user?.id ? 'Você: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-dark-500">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header do Chat */}
                  <div className="p-4 border-b border-dark-600 bg-dark-700">
                    <div className="flex items-center space-x-3">
                      {selectedConversation.otherParticipant?.profileImage ? (
                        <img
                          src={selectedConversation.otherParticipant.profileImage}
                          alt={selectedConversation.otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {selectedConversation.otherParticipant?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-dark-100">
                          {selectedConversation.otherParticipant?.name || 'Usuário'}
                        </h2>
                        <p className="text-sm text-dark-400">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender.id === user?.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-700 text-dark-100'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            message.sender.id === user?.id ? 'text-primary-100' : 'text-dark-400'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.sender.id === user?.id && (
                              <div className="flex items-center ml-1">
                                {message.isRead ? (
                                  <CheckCheck size={12} className="text-blue-400" />
                                ) : (
                                  <Check size={12} className="opacity-60" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input de Mensagem */}
                  <div className="p-4 border-t border-dark-600">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-dark-700 text-dark-100 px-4 py-2 rounded-full border border-dark-600 focus:outline-none focus:border-primary-500"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-dark-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Selecione uma conversa para começar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






