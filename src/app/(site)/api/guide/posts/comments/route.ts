import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Listar comentários de um post do guia
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guidePostId = searchParams.get('guidePostId')
    if (!guidePostId) {
      return NextResponse.json({ message: 'guidePostId é obrigatório' }, { status: 400 })
    }

    const comments = await prisma.guidepostcomment.findMany({
      where: { guidePostId, parentId: null },
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Erro ao buscar comentários do post do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar comentário em um post do guia
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const guidePostId = body.guidePostId
    const content = body.content?.trim()
    const parentId = body.parentId || null
    if (!guidePostId || !content) {
      return NextResponse.json({ message: 'guidePostId e conteúdo são obrigatórios' }, { status: 400 })
    }

    const post = await prisma.guidepost.findUnique({
      where: { id: guidePostId }
    })
    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    const commentId = `guidepostcomment_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const comment = await prisma.guidepostcomment.create({
      data: {
        id: commentId,
        guidePostId,
        userId: user.id,
        body: content,
        parentId
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ message: 'Comentário criado', comment }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar comentário no post do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
