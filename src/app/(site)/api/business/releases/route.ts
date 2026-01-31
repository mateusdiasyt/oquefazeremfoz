import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

// Função para gerar slug
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

// GET - Listar releases da empresa (público para publicados, dono vê rascunhos)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ message: 'businessId é obrigatório' }, { status: 400 })
    }

    const user = await getCurrentUser()
    const isOwner = user?.businesses?.some((b: { id: string }) => b.id === businessId) ||
      user?.activeBusinessId === businessId ||
      user?.businessId === businessId

    const where: { businessId: string; isPublished?: boolean } = { businessId }
    if (!isOwner) {
      where.isPublished = true
    }

    const releases = await prisma.businessrelease.findMany({
      where,
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({ releases }, { status: 200 })
  } catch (error: any) {
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json({ releases: [] }, { status: 200 })
    }
    console.error('Erro ao buscar releases:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar release
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const businessId = formData.get('businessId') as string
    const title = formData.get('title') as string
    const lead = formData.get('lead') as string
    const body = formData.get('body') as string
    const customSlug = formData.get('slug') as string
    const isPublished = formData.get('isPublished') !== 'false'
    const featuredImage = formData.get('featuredImage') as File

    if (!businessId || !title || !body) {
      return NextResponse.json({ message: 'businessId, título e corpo são obrigatórios' }, { status: 400 })
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id }
    })
    if (!business) return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 403 })

    let slug = customSlug?.trim() || generateSlug(title)
    let counter = 1
    while (true) {
      const exists = await prisma.businessrelease.findUnique({
        where: { businessId_slug: { businessId, slug } }
      })
      if (!exists) break
      slug = `${generateSlug(title)}-${counter}`
      counter++
    }

    let featuredImageUrl: string | null = null
    if (featuredImage && featuredImage.size > 0) {
      if (!featuredImage.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
      }
      if (featuredImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'Imagem muito grande. Máximo 5MB' }, { status: 400 })
      }
      const bytes = await featuredImage.arrayBuffer()
      const ext = featuredImage.name.split('.').pop() || 'jpg'
      const blob = await put(
        `business/${businessId}/releases/${Date.now()}.${ext}`,
        bytes,
        { access: 'public', contentType: featuredImage.type }
      )
      featuredImageUrl = blob.url
    }

    const release = await prisma.businessrelease.create({
      data: {
        id: `release_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId,
        title: title.trim(),
        slug,
        lead: lead?.trim() || null,
        body: body.trim(),
        featuredImageUrl,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Release criada com sucesso', release }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
