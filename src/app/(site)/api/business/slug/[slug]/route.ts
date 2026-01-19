import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { getCurrentUser } from '../../../../../../lib/auth'

// GET - Buscar empresa por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    // Buscar empresa por slug
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário atual curtiu e está seguindo esta empresa
    let isLiked = false
    let isFollowing = false
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        // Verificar like
        const existingLike = await prisma.businessLike.findUnique({
          where: {
            businessId_userId: {
              businessId: business.id,
              userId: currentUser.id
            }
          }
        })
        isLiked = !!existingLike

        // Verificar follow (usando BusinessLike)
        const existingFollow = await prisma.businessLike.findFirst({
          where: {
            userId: currentUser.id,
            businessId: business.id
          }
        })
        isFollowing = !!existingFollow
      }
    } catch (error) {
      // Se não conseguir verificar o usuário, continua sem erro
      console.log('Usuário não logado ou erro na verificação de like/follow')
    }

    // Retornar dados da empresa com status de curtida e follow
    return NextResponse.json({
      ...business,
      isLiked,
      isFollowing,
      likesCount: business.likesCount || 0,
      followersCount: business.followersCount || 0
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar empresa por slug:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
