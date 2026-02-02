import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'

export const dynamic = 'force-dynamic'

// GET - Listar comentários do vídeo
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const videoId = (await params).id

    const video = await prisma.foztvvideo.findUnique({
      where: { id: videoId, isPublished: true }
    })
    if (!video) {
      return NextResponse.json({ message: 'Vídeo não encontrado' }, { status: 404 })
    }

    const comments = await prisma.foztvvideocomment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    const list = comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      user: c.user
        ? {
            id: c.user.id,
            name: c.user.name || 'Usuário',
            profileImage: c.user.profileImage
          }
        : null
    }))

    const res = NextResponse.json({ comments: list })
    res.headers.set('Cache-Control', 'no-store, max-age=0')
    return res
  } catch (error) {
    console.error('Erro ao listar comentários FozTV:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar comentário (requer login)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Faça login para comentar' }, { status: 401 })
    }

    const videoId = (await params).id
    const body = await request.json()
    const text = (body.body || body.comment || '').toString().trim()

    if (!text) {
      return NextResponse.json({ message: 'Comentário não pode ser vazio' }, { status: 400 })
    }

    const video = await prisma.foztvvideo.findUnique({
      where: { id: videoId, isPublished: true }
    })
    if (!video) {
      return NextResponse.json({ message: 'Vídeo não encontrado' }, { status: 404 })
    }

    const commentId = `foztvcomment_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const comment = await prisma.foztvvideocomment.create({
      data: {
        id: commentId,
        videoId,
        userId: user.id,
        body: text
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        user: comment.user
          ? {
              id: comment.user.id,
              name: comment.user.name || 'Usuário',
              profileImage: comment.user.profileImage
            }
          : null
      }
    })
  } catch (error) {
    console.error('Erro ao criar comentário FozTV:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
