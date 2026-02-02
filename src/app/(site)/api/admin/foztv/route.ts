import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET - Listar todos os vídeos FozTV (admin)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const videos = await prisma.foztvvideo.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Erro ao listar vídeos FozTV:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar vídeo FozTV (admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, isPublished, order } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: 'Título e URL do vídeo são obrigatórios' },
        { status: 400 }
      )
    }

    const baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 0
    while (await prisma.foztvvideo.findUnique({ where: { slug } })) {
      counter++
      slug = `${baseSlug}-${counter}`
    }

    const id = `foztv_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const now = new Date()
    const publishedAt = isPublished ? now : null

    const video = await prisma.foztvvideo.create({
      data: {
        id,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        isPublished: !!isPublished,
        order: typeof order === 'number' ? order : 0,
        publishedAt,
        createdAt: now,
        updatedAt: now
      }
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar vídeo FozTV:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
