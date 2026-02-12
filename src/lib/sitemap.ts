/**
 * Geração automática de sitemap (padrão sitemaps.org 0.9).
 * O sitemap é gerado sob demanda a cada requisição a /sitemap.xml,
 * refletindo sempre o estado atual do banco (novas empresas, releases e
 * atualizações entram automaticamente, sem trigger manual).
 *
 * Estrutura preparada para evolução:
 * - sitemap-index.xml → lista sitemap-static.xml, sitemap-empresas.xml, sitemap-releases.xml
 * - Cada sub-sitemap pode ser exposto em rotas separadas se ultrapassar 50k URLs.
 */

import { prisma } from './db'

export const SITEMAP_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oquefazeremfoz.com.br'

export type SitemapEntry = {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

function toIso8601(date: Date): string {
  return date.toISOString()
}

function entry(
  path: string,
  lastMod: Date,
  changeFreq: SitemapEntry['changeFrequency'],
  priority: number
): SitemapEntry {
  const url = path.startsWith('http') ? path : `${SITEMAP_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  return {
    url,
    lastModified: toIso8601(lastMod),
    changeFrequency: changeFreq,
    priority,
  }
}

/** URLs estáticas públicas. Não inclui admin, painéis ou páginas privadas. */
export function getStaticEntries(): SitemapEntry[] {
  const now = new Date()
  return [
    entry('', now, 'daily', 1.0),
    entry('/o-que-fazer-em-foz-do-iguacu', now, 'weekly', 0.95),
    entry('/empresas', now, 'daily', 0.9),
    entry('/cupons', now, 'daily', 0.8),
    entry('/mapa-turistico', now, 'weekly', 0.7),
    entry('/selo-verificado', now, 'weekly', 0.7),
    entry('/cameras-ao-vivo', now, 'weekly', 0.8),
    entry('/foztv', now, 'weekly', 0.8),
    entry('/portal', now, 'daily', 0.8),
    entry('/guias', now, 'weekly', 0.8),
  ]
}

/** Todas as páginas de empresas aprovadas. Apenas slug público, sem parâmetros. */
export async function getBusinessEntries(): Promise<SitemapEntry[]> {
  const list = await prisma.business.findMany({
    where: { isApproved: true },
    select: { slug: true, updatedAt: true },
    take: 50000,
  })
  return list
    .filter((b) => b.slug != null && b.slug !== '')
    .map((b) =>
      entry(`/empresa/${b.slug!}`, b.updatedAt, 'weekly', 0.8)
    )
}

/** Todos os releases publicados de empresas aprovadas. */
export async function getReleaseEntries(): Promise<SitemapEntry[]> {
  const list = await prisma.businessrelease.findMany({
    where: {
      isPublished: true,
      business: { isApproved: true },
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
      business: { select: { slug: true } },
    },
    take: 50000,
  })
  return list
    .filter((r) => r.business?.slug != null)
    .map((r) =>
      entry(
        `/empresa/${r.business!.slug}/release/${r.slug}`,
        r.updatedAt ?? r.publishedAt ?? new Date(),
        'weekly',
        0.7
      )
    )
}

/** Monta o sitemap completo (estático + empresas + releases). Sem URLs privadas ou com query. */
export async function buildSitemap(): Promise<SitemapEntry[]> {
  const [businessEntries, releaseEntries] = await Promise.all([
    getBusinessEntries(),
    getReleaseEntries(),
  ])
  return [...getStaticEntries(), ...businessEntries, ...releaseEntries]
}
