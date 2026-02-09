import { prisma } from './db'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://oquefazeremfoz.com.br'
const SITE_NAME = 'OQFOZ'

export const DEFAULT_PAGES: Array<{
  path: string
  label: string
  title: string
  description: string
  keywords: string
}> = [
  { path: '/', label: 'Home', title: 'OQFOZ - O que fazer em Foz do Iguaçu', description: 'Descubra os melhores hotéis, restaurantes, atrações, passeios, ingressos e promoções em Foz do Iguaçu. Encontre empresas verificadas, cupons exclusivos e monte seu roteiro perfeito.', keywords: 'Foz do Iguaçu, atrações turísticas, hotéis, restaurantes, passeios, ingressos Cataratas, turismo, o que fazer em Foz, cupons, empresas verificadas' },
  { path: '/empresas', label: 'Empresas', title: 'Empresas em Foz do Iguaçu | OQFOZ', description: 'Lista de empresas verificadas em Foz do Iguaçu: hotéis, restaurantes, passeios e atrações.', keywords: 'empresas Foz do Iguaçu, hotéis, restaurantes, passeios' },
  { path: '/cupons', label: 'Cupons', title: 'Cupons e Promoções | OQFOZ', description: 'Cupons de desconto e promoções em Foz do Iguaçu.', keywords: 'cupons Foz do Iguaçu, promoções, descontos' },
  { path: '/mapa-turistico', label: 'Mapa Turístico', title: 'Mapa Turístico de Foz do Iguaçu | OQFOZ', description: 'Mapa com atrações e pontos turísticos de Foz do Iguaçu.', keywords: 'mapa Foz do Iguaçu, atrações, pontos turísticos' },
  { path: '/selo-verificado', label: 'Selo Verificado', title: 'Selo Verificado | OQFOZ', description: 'Empresas com selo de verificação OQFOZ em Foz do Iguaçu.', keywords: 'selo verificado, empresas verificadas Foz' },
  { path: '/cameras-ao-vivo', label: 'Câmeras ao Vivo', title: 'Câmeras ao Vivo | OQFOZ', description: 'Câmeras ao vivo de Foz do Iguaçu e Cataratas.', keywords: 'câmeras ao vivo, Foz do Iguaçu, Cataratas' },
  { path: '/foztv', label: 'FozTV', title: 'FozTV | Vídeos sobre Foz do Iguaçu | OQFOZ', description: 'Assista vídeos sobre Foz do Iguaçu: turismo, gastronomia, atrações e dicas.', keywords: 'FozTV, vídeos Foz do Iguaçu, turismo Foz, Cataratas vídeos' },
  { path: '/portal', label: 'Portal do Turismo', title: 'Portal do Turismo | Notícias para Turistas | OQFOZ', description: 'Notícias, releases e conteúdos para turistas em Foz do Iguaçu. Conteúdo das empresas Portal.', keywords: 'portal turismo Foz, notícias turismo, releases Foz do Iguaçu' },
  { path: '/guias', label: 'Guias', title: 'Guias de Turismo em Foz do Iguaçu | OQFOZ', description: 'Encontre guias de turismo em Foz do Iguaçu.', keywords: 'guias Foz do Iguaçu, turismo, passeios' },
  { path: '/login', label: 'Login', title: 'Entrar | OQFOZ', description: 'Faça login na sua conta OQFOZ.', keywords: '' },
  { path: '/register', label: 'Cadastro', title: 'Criar conta | OQFOZ', description: 'Crie sua conta no OQFOZ.', keywords: '' },
  { path: '/cadastrar-empresa', label: 'Cadastrar Empresa', title: 'Cadastrar Empresa | OQFOZ', description: 'Cadastre sua empresa no OQFOZ.', keywords: '' },
  { path: '/perfil', label: 'Perfil', title: 'Meu Perfil | OQFOZ', description: 'Gerencie seu perfil no OQFOZ.', keywords: '' },
]

export interface PageSeoData {
  path: string
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  robotsIndex: boolean | null
  robotsFollow: boolean | null
  canonical: string | null
}

export async function getPageSeo(path: string): Promise<PageSeoData | null> {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`
  const defaults = DEFAULT_PAGES.find(p => p.path === normalized)
  if (!defaults) return null

  try {
    const row = await prisma.pageseo.findUnique({
      where: { path: normalized }
    })
    return {
      path: normalized,
      title: row?.title ?? defaults.title,
      description: row?.description ?? defaults.description,
      keywords: row?.keywords ?? defaults.keywords,
      ogTitle: row?.ogTitle ?? null,
      ogDescription: row?.ogDescription ?? null,
      ogImage: row?.ogImage ?? null,
      robotsIndex: row?.robotsIndex ?? true,
      robotsFollow: row?.robotsFollow ?? true,
      canonical: row?.canonical ?? null,
    }
  } catch {
    return {
      path: normalized,
      title: defaults.title,
      description: defaults.description,
      keywords: defaults.keywords,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      robotsIndex: true,
      robotsFollow: true,
      canonical: null,
    }
  }
}

export function pageSeoToMetadata(data: PageSeoData): Metadata {
  const canonical = data.canonical || `${SITE_URL}${data.path}`
  const ogImage = data.ogImage || `${SITE_URL}/og-image.png`
  return {
    title: data.title || undefined,
    description: data.description || undefined,
    keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: canonical,
      siteName: SITE_NAME,
      title: data.ogTitle || data.title || undefined,
      description: data.ogDescription || data.description || undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.ogTitle || data.title || '' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.ogTitle || data.title || undefined,
      description: data.ogDescription || data.description || undefined,
    },
    robots: {
      index: data.robotsIndex ?? true,
      follow: data.robotsFollow ?? true,
    },
  }
}
