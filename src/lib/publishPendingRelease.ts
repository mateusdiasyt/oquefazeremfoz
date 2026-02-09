import { prisma } from './db'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim() || 'release'
}

export async function publishPendingRelease(id: string): Promise<{ releaseId: string; slug: string } | null> {
  const pending = await prisma.pendingrelease.findUnique({
    where: { id },
    include: { business: true },
  })
  if (!pending || pending.status !== 'PENDING') return null

  let slug = generateSlug(pending.title)
  let counter = 1
  while (true) {
    const exists = await prisma.businessrelease.findUnique({
      where: { businessId_slug: { businessId: pending.businessId, slug } },
    })
    if (!exists) break
    slug = `${generateSlug(pending.title)}-${counter}`
    counter++
  }

  const release = await prisma.businessrelease.create({
    data: {
      id: `release_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      businessId: pending.businessId,
      title: pending.title,
      slug,
      lead: pending.lead,
      body: pending.body,
      featuredImageUrl: pending.featuredImageUrl,
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  })

  await prisma.pendingrelease.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedReleaseId: release.id },
  })

  return { releaseId: release.id, slug: release.slug }
}
