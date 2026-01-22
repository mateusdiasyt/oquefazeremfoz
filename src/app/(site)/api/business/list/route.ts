import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar se há usuário logado
    let currentUser = null
    try {
      currentUser = await getCurrentUser()
    } catch (error) {
      // Usuário não logado, continuar sem erro
    }

    // ✅ CORREÇÃO: Filtrar apenas empresas com usuário válido e aprovadas
    const businesses = await prisma.business.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        address: true,
        phone: true,
        website: true,
        instagram: true,
        facebook: true,
        whatsapp: true,
        // presentationVideo: true, // Comentado até migração ser executada
        profileImage: true, // Garantir que profileImage está incluído
        coverImage: true,
        likesCount: true,
        isVerified: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // ✅ Incluir userId para validação
        user: {
          select: {
            id: true // ✅ Verificar se usuário existe
          }
        },
        businesslike: {
          select: {
            id: true,
            userId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Aumentado para 50 empresas
    })

    // ✅ Filtrar empresas que realmente têm usuário válido (double check)
    const validBusinesses = businesses.filter(b => b.user && b.user.id)

    // Buscar presentationVideo para todas as empresas usando SQL raw
    const businessIds = validBusinesses.map(b => b.id)
    const presentationVideosMap: Record<string, string | null> = {}
    
    if (businessIds.length > 0) {
      try {
        const videoResults = await prisma.$queryRaw<Array<{ id: string; presentationVideo: string | null }>>`
          SELECT id, "presentationVideo" FROM "business" WHERE id = ANY(${businessIds})
        `
        videoResults.forEach(result => {
          presentationVideosMap[result.id] = result.presentationVideo
        })
      } catch {
        // Se a coluna não existir, deixar tudo como null
      }
    }

    // Calcular followersCount dinamicamente para cada empresa e verificar se o usuário está seguindo
    const businessesWithFollowersCount = validBusinesses.map(business => {
      const isFollowing = currentUser 
        ? business.businesslike.some(like => like.userId === currentUser.id)
        : false

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        description: business.description,
        address: business.address,
        phone: business.phone,
        website: business.website,
        instagram: business.instagram,
        facebook: business.facebook,
        whatsapp: business.whatsapp,
        presentationVideo: presentationVideosMap[business.id] || null,
        profileImage: business.profileImage,
        coverImage: business.coverImage,
        likesCount: business.likesCount,
        followersCount: business.businesslike.length, // Contagem real de seguidores
        isFollowing, // Status de seguindo
        isVerified: business.isVerified,
        isApproved: business.isApproved,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      }
    })

    return NextResponse.json({ businesses: businessesWithFollowersCount }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
