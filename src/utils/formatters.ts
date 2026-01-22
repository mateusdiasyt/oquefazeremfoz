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
