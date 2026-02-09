import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { businessId, title, lead, body: bodyHtml } = body as {
      businessId?: string
      title?: string
      lead?: string
      body?: string
    }

    if (!businessId || !title || bodyHtml === undefined) {
      return NextResponse.json(
        { message: 'businessId, título e corpo são obrigatórios' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })
    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    let slug = generateSlug(title)
    let counter = 1
    while (true) {
      const exists = await prisma.businessrelease.findUnique({
        where: { businessId_slug: { businessId, slug } },
      })
      if (!exists) break
      slug = `${generateSlug(title)}-${counter}`
      counter++
    }

    const release = await prisma.businessrelease.create({
      data: {
        id: `release_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId,
        title: title.trim(),
        slug,
        lead: (lead && String(lead).trim()) || null,
        body: String(bodyHtml).trim(),
        featuredImageUrl: null,
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
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
    console.error('Erro ao criar release (admin):', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
