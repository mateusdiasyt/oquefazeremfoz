'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface OpenChatContextType {
  /** Abre o balão e inicia/seleciona conversa com este guia */
  openWithGuideId: string | null
  setOpenWithGuideId: (guideId: string | null) => void
  /** Abre o balão e seleciona esta conversa */
  openWithConversationId: string | null
  setOpenWithConversationId: (id: string | null) => void
  /** Limpar após o FloatingChat ter aberto */
  consumeOpenRequest: () => { guideId: string | null; conversationId: string | null }
}

const OpenChatContext = createContext<OpenChatContextType | undefined>(undefined)

export function OpenChatProvider({ children }: { children: ReactNode }) {
  const [openWithGuideId, setOpenWithGuideId] = useState<string | null>(null)
  const [openWithConversationId, setOpenWithConversationId] = useState<string | null>(null)

  const consumeOpenRequest = useCallback(() => {
    const g = openWithGuideId
    const c = openWithConversationId
    setOpenWithGuideId(null)
    setOpenWithConversationId(null)
    return { guideId: g, conversationId: c }
  }, [openWithGuideId, openWithConversationId])

  return (
    <OpenChatContext.Provider
      value={{
        openWithGuideId,
        setOpenWithGuideId,
        openWithConversationId,
        setOpenWithConversationId,
        consumeOpenRequest,
      }}
    >
      {children}
    </OpenChatContext.Provider>
  )
}

export function useOpenChat() {
  const ctx = useContext(OpenChatContext)
  if (ctx === undefined) throw new Error('useOpenChat must be used within OpenChatProvider')
  return ctx
}
