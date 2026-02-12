import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Listar comentários de um release
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('releaseId')
    if (!releaseId) {
      return NextResponse.json({ message: 'releaseId é obrigatório' }, { status: 400 })
    }

    const user = await getCurrentUser()
    const comments = await prisma.releasecomment.findMany({
      where: { releaseId, parentId: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: {
          select: { id: true, name: true, profileImage: true, isVerified: true, slug: true }
        },
        replies: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            business: {
              select: { id: true, name: true, profileImage: true, isVerified: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Erro ao buscar comentários do release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar comentário em um release
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { releaseId, content, parentId, businessId } = await request.json()
    if (!releaseId || !content?.trim()) {
      return NextResponse.json({ message: 'releaseId e conteúdo são obrigatórios' }, { status: 400 })
    }

    let finalBusinessId: string | null = null
    if (businessId) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, userId: user.id }
      })
      if (!biz) {
        return NextResponse.json({ message: 'Empresa não encontrada ou não pertence ao usuário' }, { status: 403 })
      }
      finalBusinessId = businessId
    }

    const release = await prisma.businessrelease.findUnique({
      where: { id: releaseId }
    })
    if (!release) {
      return NextResponse.json({ message: 'Release não encontrado' }, { status: 404 })
    }

    const commentId = `releasecomment_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const comment = await prisma.releasecomment.create({
      data: {
        id: commentId,
        releaseId,
        userId: user.id,
        businessId: finalBusinessId,
        parentId: parentId || null,
        body: content.trim()
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: {
          select: { id: true, name: true, profileImage: true, isVerified: true, slug: true }
        }
      }
    })

    return NextResponse.json({ message: 'Comentário criado', comment }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar comentário no release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
