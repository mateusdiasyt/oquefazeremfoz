/**
 * Tradução automática de conteúdo (títulos, descrições) via API gratuita MyMemory.
 * Usado quando o usuário escolhe EN ou ES e o conteúdo está em PT.
 */

const CACHE = new Map<string, string>()
const MAX_LEN = 450

function cacheKey(text: string, to: string): string {
  return `${to}:${text.slice(0, 100)}`
}

export type ContentLocale = 'pt' | 'en' | 'es'

export async function translateContent(
  text: string | null | undefined,
  to: ContentLocale
): Promise<string> {
  if (!text || !text.trim()) return text ?? ''
  if (to === 'pt') return text
  const trimmed = text.trim().slice(0, MAX_LEN)
  const key = cacheKey(trimmed, to)
  if (CACHE.has(key)) return CACHE.get(key)!
  const langpair = to === 'es' ? 'pt|es' : 'pt|en'
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langpair}`
    )
    const data = await res.json()
    const translated = data?.responseData?.translatedText?.trim() || trimmed
    CACHE.set(key, translated)
    return translated
  } catch {
    return trimmed
  }
}
