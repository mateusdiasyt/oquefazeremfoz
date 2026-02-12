import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import ReleaseDetailClient from './ReleaseDetailClient'

const SITE_URL = 'https://www.oquefazeremfoz.com.br'

function stripHtml(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; releaseSlug: string }>
}): Promise<Metadata> {
  const { slug: businessSlug, releaseSlug } = await params
  try {
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug, isApproved: true },
      select: { id: true, name: true },
    })
    if (!business) return {}

    const release = await prisma.businessrelease.findUnique({
      where: {
        businessId_slug: { businessId: business.id, slug: releaseSlug },
      },
    })
    if (!release || !release.isPublished) return {}

    const title = `${release.title} | OQFOZ`
    const description = release.lead
      ? release.lead.slice(0, 160) + (release.lead.length > 160 ? '...' : '')
      : stripHtml(release.body)
    const imageUrl = release.featuredImageUrl
      ? release.featuredImageUrl.startsWith('http')
        ? release.featuredImageUrl
        : `${SITE_URL}${release.featuredImageUrl.startsWith('/') ? '' : '/'}${release.featuredImageUrl}`
      : `${SITE_URL}/og-image.png`
    const url = `${SITE_URL}/empresa/${businessSlug}/release/${releaseSlug}`

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        locale: 'pt_BR',
        url,
        siteName: 'OQFOZ',
        title: release.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: release.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: release.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: url,
      },
    }
  } catch {
    return {}
  }
}

export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; releaseSlug: string }>
}) {
  const { slug: businessSlug, releaseSlug } = await params

  const business = await prisma.business.findUnique({
    where: { slug: businessSlug, isApproved: true },
    select: { id: true, name: true, slug: true, profileImage: true },
  })
  if (!business) redirect(`/empresa/${businessSlug}`)

  const release = await prisma.businessrelease.findUnique({
    where: {
      businessId_slug: { businessId: business.id, slug: releaseSlug },
    },
  })
  if (!release || !release.isPublished) redirect(`/empresa/${businessSlug}`)

  const releaseForClient = {
    id: release.id,
    title: release.title,
    slug: release.slug,
    lead: release.lead,
    body: release.body,
    featuredImageUrl: release.featuredImageUrl,
    publishedAt: release.publishedAt?.toISOString() ?? null,
    createdAt: release.createdAt.toISOString(),
    views: release.views ?? 0,
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      profileImage: business.profileImage,
    },
  }

  return <ReleaseDetailClient release={releaseForClient} />
}
