import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isTourist } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

// POST - Seguir ou desseguir um usuário
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ message: 'Você não pode seguir a si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário alvo existe e tem uma empresa
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { business: true }
    })

    if (!targetUser || !targetUser.business) {
      return NextResponse.json({ message: 'Usuário ou empresa não encontrada' }, { status: 404 })
    }

    if (action === 'follow') {
      // Verificar se já está seguindo
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId
          }
        }
      })

      if (existingFollow) {
        return NextResponse.json({ message: 'Você já está seguindo este usuário' }, { status: 400 })
      }

      // Criar o follow
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId
        }
      })

      // Atualizar contadores
      await prisma.business.update({
        where: { userId: targetUserId },
        data: {
          followersCount: {
            increment: 1
          }
        }
      })

      // Nota: followingCount removido do schema Business

      return NextResponse.json({ message: 'Usuário seguido com sucesso!' }, { status: 200 })

    } else if (action === 'unfollow') {
      // Verificar se está seguindo
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId
          }
        }
      })

      if (!existingFollow) {
        return NextResponse.json({ message: 'Você não está seguindo este usuário' }, { status: 400 })
      }

      // Remover o follow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId
          }
        }
      })

      // Atualizar contadores
      await prisma.business.update({
        where: { userId: targetUserId },
        data: {
          followersCount: {
            decrement: 1
          }
        }
      })

      // Nota: followingCount removido do schema Business

      return NextResponse.json({ message: 'Usuário desseguido com sucesso!' }, { status: 200 })

    } else {
      return NextResponse.json({ message: 'Ação inválida' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro ao seguir/desseguir usuário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se está seguindo um usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')

    if (!targetUserId) {
      return NextResponse.json({ message: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId
        }
      }
    })

    return NextResponse.json({ 
      isFollowing: !!follow,
      followId: follow?.id || null
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}





