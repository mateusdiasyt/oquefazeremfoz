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

type TimeStrings = {
  now: string
  minute: string
  minutes: string
  hour: string
  hours: string
  day: string
  days: string
  ago: string
}

/**
 * Formata uma data para mostrar tempo relativo (ex: "há 5 minutos")
 * @param dateString - Data em formato string
 * @param timeStrings - Opcional: strings de tempo para i18n (ago, minutes, hours, etc.)
 * @returns String formatada com tempo relativo
 */
export function getTimeAgo(dateString: string, timeStrings?: TimeStrings): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const t = timeStrings
  const locale = t ? (t.ago === 'ago' ? 'en' : t.ago === 'hace' ? 'es' : 'pt') : 'pt'

  if (diffInSeconds < 60) return t?.now ?? 'agora'
  if (diffInSeconds < 3600) {
    const n = Math.floor(diffInSeconds / 60)
    const word = n === 1 ? (t?.minute ?? 'minuto') : (t?.minutes ?? 'minutos')
    if (locale === 'en') return `${n} ${word} ${t?.ago ?? 'ago'}`
    if (locale === 'es') return `${t?.ago ?? 'hace'} ${n} ${word}`
    return `${t?.ago ?? 'há'} ${n} ${word}`
  }
  if (diffInSeconds < 86400) {
    const n = Math.floor(diffInSeconds / 3600)
    const word = n === 1 ? (t?.hour ?? 'hora') : (t?.hours ?? 'horas')
    if (locale === 'en') return `${n} ${word} ${t?.ago ?? 'ago'}`
    if (locale === 'es') return `${t?.ago ?? 'hace'} ${n} ${word}`
    return `${t?.ago ?? 'há'} ${n} ${word}`
  }
  const n = Math.floor(diffInSeconds / 86400)
  if (n < 7) {
    const word = n === 1 ? (t?.day ?? 'dia') : (t?.days ?? 'dias')
    if (locale === 'en') return `${n} ${word} ${t?.ago ?? 'ago'}`
    if (locale === 'es') return `${t?.ago ?? 'hace'} ${n} ${word}`
    return `${t?.ago ?? 'há'} ${n} ${word}`
  }
  const localeCode = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR'
  return date.toLocaleDateString(localeCode, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
