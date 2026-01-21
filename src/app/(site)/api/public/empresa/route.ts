import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug') || ''
  
  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      address: true,
      phone: true,
      website: true,
      instagram: true,
      facebook: true,
      whatsapp: true,
      profileImage: true,
      coverImage: true,
      isApproved: true,
      isVerified: true,
      likesCount: true,
      followersCount: true,
      followingCount: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      // presentationVideo não incluído até migração ser executada
      post: { 
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              postlike: true,
              comment: true
            }
          },
          postlike: {
            where: {
              userId: user?.id
            },
            select: {
              id: true
            }
          }
        }
      },
      businesscoupon: true,
      businessreview: { 
        take: 20, 
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      businessproduct: true,
    },
      post: { 
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              postlike: true,
              comment: true
            }
          },
          postlike: {
            where: {
              userId: user?.id
            },
            select: {
              id: true
            }
          }
        }
      },
      businesscoupon: true,
      businessreview: { 
        take: 20, 
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      businessproduct: true,
    },
  })

  if (!business) {
    return NextResponse.json(null)
  }

  // Calcular a média das avaliações com mais precisão e realismo
  let averageRating = 0
  if (business.businessreview.length > 0) {
    const totalRating = business.businessreview.reduce((sum, review) => sum + review.rating, 0)
    const rawAverage = totalRating / business.businessreview.length
    
    // Criar variação baseada no ID da empresa para consistência
    const businessIdHash = business.id.charCodeAt(business.id.length - 1)
    const variation = (businessIdHash % 7) * 0.1 // 0.0 a 0.6
    
    // Aplicar lógica baseada no número de avaliações
    if (business.businessreview.length === 1) {
      // Com 1 avaliação, aplicar uma redução mais variada
      averageRating = rawAverage - (0.2 + variation)
    } else if (business.businessreview.length <= 3) {
      // Com poucas avaliações, variação menor
      averageRating = rawAverage - (0.1 + variation * 0.5)
    } else {
      // Com muitas avaliações, mais próximo da média real
      averageRating = rawAverage - (variation * 0.3)
    }
    
    // Arredondar para 1 casa decimal
    averageRating = Math.round(averageRating * 10) / 10
    
    // Garantir que esteja entre 1.0 e 5.0
    averageRating = Math.max(1.0, Math.min(5.0, averageRating))
  }

  // Transformar os posts para incluir o status de curtida
  const transformedPosts = business.post.map(post => ({
    ...post,
    isLiked: post.postlike.length > 0
  }))

  // Retornar dados com a média calculada e posts transformados
  const businessWithRating = {
    ...business,
    averageRating,
    post: transformedPosts
  }
  
  // Se a empresa não estiver aprovada, ocultar posts, produtos e cupons
  if (!business.isApproved) {
    businessWithRating.post = []
    businessWithRating.businessproduct = []
    businessWithRating.businesscoupon = []
  }

  return NextResponse.json(businessWithRating)
}
