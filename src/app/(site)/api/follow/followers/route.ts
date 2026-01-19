import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar seguidores de um usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId') || user.id

    const followers = await prisma.follow.findMany({
      where: { followingId: targetUserId },
      include: {
        follower: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ followers }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar seguidores:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}






