import { MetadataRoute } from 'next'
import { prisma } from '../lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://oquefazeremfoz.com.br'

  // Buscar todas as empresas aprovadas
  const businesses = await prisma.business.findMany({
    where: {
      isApproved: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    take: 1000, // Limitar a 1000 empresas
  })

  // Filtrar apenas empresas com slug válido e gerar URLs
  const businessUrls: MetadataRoute.Sitemap = businesses
    .filter((business) => business.slug !== null)
    .map((business) => ({
      url: `${baseUrl}/empresa/${business.slug}`,
      lastModified: business.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // URLs estáticas principais
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/empresas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cupons`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mapa-turistico`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/selo-verificado`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...businessUrls]
}
