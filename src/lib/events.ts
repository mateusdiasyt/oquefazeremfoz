/** Nome do evento disparado quando mensagens são enviadas ou visualizadas (para atualizar contador no header). */
export const MESSAGES_UPDATED = 'messages-updated'

export function dispatchMessagesUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MESSAGES_UPDATED))
  }
}
