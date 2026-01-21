import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

// DELETE - Deletar usuário e todos os dados relacionados (cascade delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!user.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const userId = params.id

    // Verificar se está tentando deletar a si mesmo
    if (user.id === userId) {
      return NextResponse.json({ message: 'Você não pode deletar seu próprio usuário' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Deletar usuário e todos os dados relacionados usando transação
    // O Prisma vai fazer cascade delete automaticamente baseado no schema
    await prisma.$transaction(async (tx) => {
      // Deletar todas as empresas do usuário primeiro (que vai deletar posts, produtos, cupons, etc)
      const businesses = await tx.business.findMany({
        where: { userId: userId },
        select: { id: true }
      })

      for (const business of businesses) {
        // Deletar posts da empresa
        await tx.post.deleteMany({
          where: { businessId: business.id }
        })

        // Deletar produtos da empresa
        await tx.product.deleteMany({
          where: { businessId: business.id }
        })

        // Deletar cupons da empresa
        await tx.coupon.deleteMany({
          where: { businessId: business.id }
        })

        // Deletar likes da empresa
        await tx.businesslike.deleteMany({
          where: { businessId: business.id }
        })

        // Deletar follow da empresa
        await tx.follow.deleteMany({
          where: {
            OR: [
              { followerBusinessId: business.id },
              { followingBusinessId: business.id }
            ]
          }
        })

        // Deletar a empresa
        await tx.business.delete({
          where: { id: business.id }
        })
      }

      // Deletar likes de posts do usuário
      await tx.postlike.deleteMany({
        where: { userId: userId }
      })

      // Deletar comentários do usuário
      await tx.postcomment.deleteMany({
        where: { userId: userId }
      })

      // Deletar follow do usuário (como follower e following)
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: userId },
            { followingId: userId }
          ]
        }
      })

      // Deletar mensagens do usuário
      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })

      // Deletar conversas do usuário
      await tx.conversation.deleteMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      })

      // Deletar sessões do usuário
      await tx.session.deleteMany({
        where: { userId: userId }
      })

      // Deletar roles do usuário
      await tx.userrole.deleteMany({
        where: { userId: userId }
      })

      // Deletar reviews do usuário
      await tx.businessreview.deleteMany({
        where: { userId: userId }
      })

      // Finalmente, deletar o usuário
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ message: 'Usuário deletado com sucesso' }, { status: 200 })

  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
