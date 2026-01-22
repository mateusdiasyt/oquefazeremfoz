/**
 * Capitaliza a primeira letra de cada palavra em uma string
 * @param str - String a ser formatada
 * @returns String com todas as palavras capitalizadas
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return ''
  
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Formata uma data para mostrar tempo relativo (ex: "há 5 minutos")
 * @param dateString - Data em formato string
 * @returns String formatada com tempo relativo
 */
export function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'agora'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  const days = Math.floor(diffInSeconds / 86400)
  if (days < 7) {
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  // Se for mais de 7 dias, mostrar data formatada
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
