// Função para detectar URLs em um texto
export function detectUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlRegex) || []
  return urls.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })
}

// Função para remover URLs do texto e retornar o texto limpo + URLs
export function extractUrlsFromText(text: string): { cleanText: string; urls: string[] } {
  const urls = detectUrls(text)
  let cleanText = text
  
  // Remover URLs do texto
  urls.forEach(url => {
    cleanText = cleanText.replace(url, '').trim()
  })
  
  // Limpar espaços extras
  cleanText = cleanText.replace(/\s+/g, ' ').trim()
  
  return { cleanText, urls }
}





