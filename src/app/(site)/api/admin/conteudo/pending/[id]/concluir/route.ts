import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    const pending = await prisma.pendingrelease.findUnique({
      where: { id },
      include: { business: true },
    })
    if (!pending || pending.status !== 'PENDING') {
      return NextResponse.json({ message: 'Pendente não encontrado ou já publicado' }, { status: 404 })
    }

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

    return NextResponse.json({
      message: 'Release publicado com sucesso',
      release: {
        id: release.id,
        slug: release.slug,
        title: release.title,
      },
    })
  } catch (error) {
    console.error('Erro ao concluir pendente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
