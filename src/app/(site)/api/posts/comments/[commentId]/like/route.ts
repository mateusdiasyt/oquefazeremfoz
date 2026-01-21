import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const commentId = params.commentId

    if (!commentId) {
      return NextResponse.json({ message: 'ID do comentário é obrigatório' }, { status: 400 })
    }

    // Verificar se o comentário existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ message: 'Comentário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário já curtiu o comentário
    const existingLike = await prisma.commentlike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Se já curtiu, remover o like
      await prisma.commentlike.delete({
        where: { id: existingLike.id }
      })

      // Contar likes restantes
      const likesCount = await prisma.commentlike.count({
        where: { commentId }
      })

      return NextResponse.json({
        liked: false,
        likesCount
      }, { status: 200 })
    } else {
      // Se não curtiu, adicionar like
      await prisma.commentlike.create({
        data: {
          id: `commentlike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          commentId,
          userId: user.id
        }
      })

      // Contar likes
      const likesCount = await prisma.commentlike.count({
        where: { commentId }
      })

      return NextResponse.json({
        liked: true,
        likesCount
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Erro ao curtir comentário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
