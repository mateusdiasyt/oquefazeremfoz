import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

// GET - Listar vídeos publicados do FozTV (público)
export async function GET() {
  try {
    const videos = await prisma.foztvvideo.findMany({
      where: { isPublished: true },
      orderBy: [
        { order: 'asc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        publishedAt: true,
        order: true
      }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Erro ao listar vídeos FozTV:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
