/**
 * Análise SEO baseada em Search Quality Guidelines, EEAT e boas práticas on-page.
 * Apenas fatores que influenciam ranqueamento.
 */

function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

function getWordCount(text: string): number {
  const t = (text || '').trim()
  return t ? t.split(/\s+/).filter(Boolean).length : 0
}

function getHeadingStructure(html: string): { h1: number; h2: number; h3: number } {
  const str = html || ''
  return {
    h1: (str.match(/<h1[\s>]/gi) || []).length,
    h2: (str.match(/<h2[\s>]/gi) || []).length,
    h3: (str.match(/<h3[\s>]/gi) || []).length
  }
}

const GENERIC_TERMS = [
  'saiba mais',
  'descubra',
  'clique aqui',
  'leia mais',
  'confira',
  'acesse',
  'veja mais',
  'saiba tudo',
  'fique por dentro',
  'não perca'
]

const EXAGGERATED_PHRASES = [
  'melhor do mundo',
  'o melhor',
  'único no mercado',
  '100% garantido',
  'revolucionário',
  'imperdível',
  'incrível',
  'fantástico',
  'inacreditável',
  'número 1',
  '#1'
]

const INTENT_PATTERNS = {
  informacional: /\b(como|o que é|guia|dicas|como fazer|o que são|quais|por que|porquê)\b/gi,
  comercial: /\b(melhor|comparativo|vs|versus|review|avaliação|top \d+)\b/gi,
  navegacional: /\b(site|página|login|acessar|contato)\b/gi,
  transacional: /\b(comprar|preço|promoção|desconto|oferta|agende|reserve)\b/gi
}

export interface TitleAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  charCount: number
  hasKeyword: boolean
  hasGeneric: boolean
  suggestion?: string
}

export interface MetaAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  charCount: number
  suggestion?: string
}

export interface ContentLengthAnalysis {
  status: 'ok' | 'warn' | 'bad' | 'excellent'
  statusLabel: string
  wordCount: number
  label: string
  feedback: string
}

export interface StructureAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  h1: number
  h2: number
  h3: number
  suggestions: string[]
}

export interface KeywordAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  mainKeyword?: string
  inFirstParagraphs: boolean
  hasVariations: boolean
  possibleStuffing: boolean
  observation: string
}

export interface LegibilityAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  avgSentenceLength: number
  hasLists: boolean
  hasBold: boolean
  feedback: string
}

export interface EEATAnalysis {
  status: 'ok' | 'warn' | 'bad'
  statusLabel: string
  hasExaggerated: boolean
  feedback: string
}

export interface SearchIntentAnalysis {
  type: 'informacional' | 'comercial' | 'navegacional' | 'transacional'
  label: string
  match: boolean
}

export interface SEOAnalysisResult {
  title: TitleAnalysis
  meta: MetaAnalysis
  contentLength: ContentLengthAnalysis
  structure: StructureAnalysis
  keywords: KeywordAnalysis
  legibility: LegibilityAnalysis
  eeat: EEATAnalysis
  searchIntent: SearchIntentAnalysis
  score: number
  grade: 'ruim' | 'regular' | 'bom' | 'excelente'
  gradeLabel: string
  improvements: string[]
}

function analyzeTitle(title: string): TitleAnalysis {
  const t = title.trim()
  const len = t.length

  if (!t) {
    return {
      status: 'bad',
      statusLabel: '❌ Ruim',
      charCount: 0,
      hasKeyword: false,
      hasGeneric: false,
      suggestion: 'Adicione um título claro e descritivo.'
    }
  }

  const lower = t.toLowerCase()
  const hasGeneric = GENERIC_TERMS.some((term) => lower.includes(term))
  const words = t.split(/\s+/).filter(Boolean)
  const mainWord = words.length >= 2 ? words.slice(0, 2).join(' ').toLowerCase() : lower
  const bodyText = '' // We don't have body here; keyword check will be in combined analysis
  const hasKeyword = words.length >= 2

  let status: TitleAnalysis['status'] = 'ok'
  let suggestion: string | undefined

  if (len < 40) {
    status = 'warn'
    suggestion = `Título curto. Ideal: 40-65 caracteres. Adicione ${40 - len} caracteres.`
  } else if (len > 65) {
    status = 'warn'
    suggestion = `Título longo. Corte ${len - 65} caracteres (ideal: 40-65).`
  }

  if (hasGeneric) {
    status = status === 'ok' ? 'warn' : status
    suggestion = (suggestion ? suggestion + ' ' : '') + 'Evite termos genéricos como "saiba mais" ou "descubra".'
  }

  if (status === 'ok' && !hasKeyword) {
    status = 'warn'
    suggestion = 'Inclua a palavra-chave principal no título.'
  }

  if (len < 30) status = 'bad'
  if (len > 70) status = 'bad'

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Bom' : status === 'warn' ? '⚠️ Ajustar' : '❌ Ruim',
    charCount: len,
    hasKeyword,
    hasGeneric,
    suggestion
  }
}

function analyzeMeta(lead: string, title: string): MetaAnalysis {
  const l = lead.trim()
  const len = l.length

  if (!l) {
    return {
      status: 'warn',
      statusLabel: '⚠️ Ajustar',
      charCount: 0,
      suggestion: 'Adicione um resumo de 120-160 caracteres. Ele aparece nos resultados de busca e incentiva o clique.'
    }
  }

  const repeatsTitle = title.trim().length > 0 && l.toLowerCase().includes(title.trim().toLowerCase().slice(0, 20))
  let status: MetaAnalysis['status'] = 'ok'
  let suggestion: string | undefined

  if (len < 120) {
    status = 'warn'
    suggestion = `Resumo curto (${len} caracteres). Ideal: 120-160 para aparecer completo na busca.`
  } else if (len > 160) {
    status = 'warn'
    suggestion = `Resumo longo (${len} caracteres). Será cortado na busca. Ideal: 120-160.`
  }

  if (repeatsTitle) {
    status = status === 'ok' ? 'warn' : status
    suggestion = (suggestion ? suggestion + ' ' : '') + 'Evite repetir o título. Destaque o benefício ou curiosidade.'
  }

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Bom' : status === 'warn' ? '⚠️ Ajustar' : '❌ Ruim',
    charCount: len,
    suggestion
  }
}

function analyzeContentLength(wordCount: number): ContentLengthAnalysis {
  let status: ContentLengthAnalysis['status'] = 'bad'
  let statusLabel = '❌ Ruim'
  let label = 'Muito curto'
  let feedback = ''

  if (wordCount >= 1500) {
    status = 'excellent'
    statusLabel = '⭐ Excelente'
    label = 'Muito bom'
    feedback = 'Conteúdo extenso e completo. Boa profundidade para ranquear.'
  } else if (wordCount >= 700) {
    status = 'ok'
    statusLabel = '✅ Bom'
    label = 'Bom'
    feedback = 'Extensão adequada. O conteúdo parece completo.'
  } else if (wordCount >= 300) {
    status = 'warn'
    statusLabel = '⚠️ Médio'
    label = 'Médio'
    feedback = 'Texto médio. Considere aprofundar com mais detalhes para ranquear melhor.'
  } else if (wordCount > 0) {
    status = 'bad'
    statusLabel = '❌ Muito curto'
    label = 'Muito curto'
    feedback = 'Conteúdo muito curto. Textos com 300+ palavras tendem a ranquear melhor.'
  } else {
    feedback = 'Adicione o conteúdo do artigo.'
  }

  return {
    status,
    statusLabel,
    wordCount,
    label,
    feedback
  }
}

function analyzeStructure(html: string, hasPageTitle: boolean): StructureAnalysis {
  const h = getHeadingStructure(html || '')
  const suggestions: string[] = []

  let status: StructureAnalysis['status'] = 'ok'

  if (hasPageTitle && h.h1 > 0) {
    suggestions.push('O título da página já é o H1. Use H2 e H3 no texto para seções.')
  }

  if (h.h2 === 0 && h.h3 === 0 && getWordCount(stripHtml(html)) > 100) {
    status = 'warn'
    suggestions.push('Divida o texto em seções com H2. Ex: "Benefícios", "Como funciona".')
  }

  if (h.h2 > 0 && h.h3 === 0 && getWordCount(stripHtml(html)) > 300) {
    suggestions.push('Use H3 para aprofundar tópicos dentro das seções.')
  }

  if (h.h1 > 1) {
    status = 'warn'
    suggestions.push('Use apenas 1 H1 por página. O restante deve ser H2 ou H3.')
  }

  const hasStructure = h.h1 > 0 || h.h2 > 0 || h.h3 > 0
  if (!hasStructure && getWordCount(stripHtml(html)) > 50) {
    status = 'warn'
    if (suggestions.length === 0) {
      suggestions.push('Adicione H2 e H3 para organizar o texto. Facilita leitura e SEO.')
    }
  }

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Bom' : status === 'warn' ? '⚠️ Ajustar' : '❌ Ruim',
    h1: h.h1,
    h2: h.h2,
    h3: h.h3,
    suggestions
  }
}

function extractMainKeyword(title: string): string {
  const words = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\sáàâãéèêíïóôõöúç]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['com', 'para', 'como', 'que', 'uma', 'uma', 'sobre', 'todos', 'mais'].includes(w))
  return words.slice(0, 3).join(' ') || title.slice(0, 30)
}

function analyzeKeywords(title: string, bodyHtml: string): KeywordAnalysis {
  const text = stripHtml(bodyHtml || '').toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const mainKeyword = extractMainKeyword(title)
  const keywordTerms = mainKeyword.split(/\s+/).filter(Boolean)

  if (!text || words.length < 20) {
    return {
      status: 'warn',
      statusLabel: '⚠️ Ajustar',
      inFirstParagraphs: false,
      hasVariations: false,
      possibleStuffing: false,
      observation: 'Conteúdo insuficiente para analisar palavras-chave.'
    }
  }

  const first150 = text.slice(0, 150)
  const inFirstParagraphs = keywordTerms.some((k) => first150.includes(k))
  const keywordCount = keywordTerms.reduce((acc, k) => acc + (text.split(k).length - 1), 0)
  const density = (keywordCount / words.length) * 100
  const possibleStuffing = density > 3.5

  const hasVariations = keywordTerms.length >= 2 ? keywordTerms.some((k) => text.includes(k)) : true

  let status: KeywordAnalysis['status'] = 'ok'
  let observation = ''

  if (!inFirstParagraphs) {
    status = 'warn'
    observation = 'Palavra-chave do título não aparece nos primeiros parágrafos. Coloque no início.'
  }
  if (possibleStuffing) {
    status = 'bad'
    observation = 'Possível excesso de repetição. Use a palavra-chave de forma natural.'
  }
  if (status === 'ok') {
    observation = 'Uso natural da palavra-chave no texto.'
  }

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Bom' : status === 'warn' ? '⚠️ Ajustar' : '❌ Ruim',
    mainKeyword: mainKeyword || undefined,
    inFirstParagraphs,
    hasVariations,
    possibleStuffing,
    observation
  }
}

function analyzeLegibility(html: string): LegibilityAnalysis {
  const text = stripHtml(html || '')
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const words = text.split(/\s+/).filter(Boolean)
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0
  const hasLists = /<(ul|ol)\b/i.test(html || '')
  const hasBold = /<(strong|b)\b/i.test(html || '')

  let status: LegibilityAnalysis['status'] = 'ok'
  let feedback = ''

  if (avgSentenceLength > 25 && sentences.length > 3) {
    status = 'warn'
    feedback = 'Algumas frases podem estar longas. Ideal: 15-20 palavras por frase.'
  } else if (avgSentenceLength > 35) {
    status = 'bad'
    feedback = 'Frases muito longas. Quebre em frases menores.'
  }

  if (!hasLists && words.length > 150) {
    status = status === 'ok' ? 'warn' : status
    feedback = (feedback ? feedback + ' ' : '') + 'Use listas para destacar itens. Facilita a leitura.'
  }

  if (!hasBold && words.length > 100) {
    feedback = (feedback ? feedback + ' ' : '') + 'Destaque termos importantes em negrito.'
  }

  if (status === 'ok' && !feedback) {
    feedback = 'Texto escaneável. Frases e parágrafos em bom tamanho.'
  }

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Boa' : status === 'warn' ? '⚠️ Média' : '❌ Difícil',
    avgSentenceLength: Math.round(avgSentenceLength),
    hasLists,
    hasBold,
    feedback
  }
}

function analyzeEEAT(html: string): EEATAnalysis {
  const text = stripHtml(html || '').toLowerCase()
  const title = ''

  const hasExaggerated = EXAGGERATED_PHRASES.some((p) => text.includes(p))

  let status: EEATAnalysis['status'] = 'ok'
  let feedback = ''

  if (hasExaggerated) {
    status = 'warn'
    feedback = 'Evite promessas exageradas. Linguagem objetiva transmite mais confiança.'
  } else {
    feedback = 'Linguagem adequada. Transmite credibilidade.'
  }

  return {
    status,
    statusLabel: status === 'ok' ? '✅ Bom' : '⚠️ Ajustar',
    hasExaggerated,
    feedback
  }
}

function detectSearchIntent(title: string, bodyHtml: string): SearchIntentAnalysis {
  const text = (title + ' ' + stripHtml(bodyHtml || '')).toLowerCase()

  const scores = {
    informacional: (text.match(INTENT_PATTERNS.informacional) || []).length,
    comercial: (text.match(INTENT_PATTERNS.comercial) || []).length,
    navegacional: (text.match(INTENT_PATTERNS.navegacional) || []).length,
    transacional: (text.match(INTENT_PATTERNS.transacional) || []).length
  }

  const max = Math.max(...Object.values(scores))
  const types = (['informacional', 'comercial', 'navegacional', 'transacional'] as const).filter(
    (k) => scores[k] === max
  )
  const type = types[0] || 'informacional'

  const labels = {
    informacional: 'Informacional (guia, dicas, explicação)',
    comercial: 'Comercial (comparativo, avaliação)',
    navegacional: 'Navegacional (encontrar algo específico)',
    transacional: 'Transacional (comprar, agendar)'
  }

  return {
    type,
    label: labels[type],
    match: max > 0
  }
}

export function runSEOAnalysis(title: string, lead: string, bodyHtml: string): SEOAnalysisResult {
  const bodyText = stripHtml(bodyHtml || '')
  const wordCount = getWordCount(bodyText)

  const titleAnalysis = analyzeTitle(title)
  const metaAnalysis = analyzeMeta(lead, title)
  const contentLength = analyzeContentLength(wordCount)
  const structure = analyzeStructure(bodyHtml, title.trim().length > 0)
  const keywords = analyzeKeywords(title, bodyHtml)
  const legibility = analyzeLegibility(bodyHtml)
  const eeat = analyzeEEAT(bodyHtml)
  const searchIntent = detectSearchIntent(title, bodyHtml)

  const weights = {
    title: 0.075,
    meta: 0.075,
    content: 0.15,
    structure: 0.2,
    keywords: 0.175,
    legibility: 0.1,
    eeat: 0.05,
    intent: 0.175
  }

  const scoreTitle = titleAnalysis.status === 'ok' ? 100 : titleAnalysis.status === 'warn' ? 60 : 20
  const scoreMeta = metaAnalysis.status === 'ok' ? 100 : metaAnalysis.status === 'warn' ? 60 : lead.trim() ? 30 : 0
  const scoreContent =
    contentLength.status === 'excellent' ? 100 : contentLength.status === 'ok' ? 85 : contentLength.status === 'warn' ? 50 : 20
  const scoreStructure = structure.status === 'ok' ? 100 : structure.status === 'warn' ? 60 : 30
  const scoreKeywords = keywords.status === 'ok' ? 100 : keywords.status === 'warn' ? 60 : 30
  const scoreLegibility = legibility.status === 'ok' ? 100 : legibility.status === 'warn' ? 60 : 30
  const scoreEeat = eeat.status === 'ok' ? 100 : 70
  const scoreIntent = wordCount > 50 ? 100 : 50

  const score = Math.round(
    scoreTitle * weights.title +
      scoreMeta * weights.meta +
      scoreContent * weights.content +
      scoreStructure * weights.structure +
      scoreKeywords * weights.keywords +
      scoreLegibility * weights.legibility +
      scoreEeat * weights.eeat +
      scoreIntent * weights.intent
  )

  let grade: SEOAnalysisResult['grade'] = 'ruim'
  let gradeLabel = '❌ Ruim'

  if (score >= 80) {
    grade = 'excelente'
    gradeLabel = '⭐ Excelente'
  } else if (score >= 60) {
    grade = 'bom'
    gradeLabel = '✅ Bom'
  } else if (score >= 40) {
    grade = 'regular'
    gradeLabel = '⚠️ Regular'
  }

  const improvements: string[] = []
  if (titleAnalysis.suggestion) improvements.push(titleAnalysis.suggestion)
  if (metaAnalysis.suggestion && metaAnalysis.status !== 'ok') improvements.push(metaAnalysis.suggestion)
  structure.suggestions.forEach((s) => improvements.push(s))
  if (keywords.observation && keywords.status !== 'ok') improvements.push(keywords.observation)
  if (legibility.feedback && legibility.status !== 'ok') improvements.push(legibility.feedback)
  if (eeat.feedback && eeat.status !== 'ok') improvements.push(eeat.feedback)
  if (contentLength.wordCount < 300 && contentLength.wordCount > 0) {
    improvements.push('Aumente o conteúdo para pelo menos 300 palavras.')
  }

  return {
    title: titleAnalysis,
    meta: metaAnalysis,
    contentLength,
    structure,
    keywords,
    legibility,
    eeat,
    searchIntent,
    score: Math.min(100, Math.max(0, score)),
    grade,
    gradeLabel,
    improvements: improvements.slice(0, 5)
  }
}
