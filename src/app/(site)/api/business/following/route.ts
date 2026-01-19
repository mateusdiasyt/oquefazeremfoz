import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Listar empresas que o usuário está seguindo
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar empresas seguidas
    const following = await prisma.businessLike.findMany({
      where: {
        userId: user.id
      },
      include: {
        business: {
          select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                isVerified: true,
                category: true
              }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Mapear empresas seguidas
    const businesses = following.map(follow => ({
        id: follow.business.id,
        name: follow.business.name,
        slug: follow.business.slug,
        profileImage: follow.business.profileImage,
        isVerified: follow.business.isVerified,
        category: follow.business.category,
        followedAt: follow.createdAt
      }))

    return NextResponse.json({ businesses })

  } catch (error) {
    console.error('Erro ao buscar empresas seguidas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
