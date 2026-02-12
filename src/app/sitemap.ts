import { MetadataRoute } from 'next'
import { buildSitemap } from '@/lib/sitemap'

/**
 * Sitemap dinâmico em /sitemap.xml (padrão sitemaps.org 0.9).
 * Gerado a cada requisição a partir do banco; novas empresas, releases e
 * edições passam a aparecer automaticamente, sem intervenção manual.
 * Não inclui páginas privadas, admin nem URLs com query.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await buildSitemap()
  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }))
}
