import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se foi fornecido um ID específico
    const { searchParams } = new URL(request.url)
    const requestedBusinessId = searchParams.get('id')

    // Determinar qual empresa buscar
    let businessId: string | null = null
    if (requestedBusinessId) {
      // Verificar se a empresa solicitada pertence ao usuário
      const requestedBusiness = await prisma.business.findFirst({
        where: { 
          id: requestedBusinessId,
          userId: user.id
        }
      })
      if (requestedBusiness) {
        businessId = requestedBusinessId
      }
    } else {
      // Usar empresa ativa ou primeira empresa
      businessId = user.activeBusinessId || user.businessId || user.businesses?.[0]?.id || null
    }

    if (!businessId) {
      return NextResponse.json({ message: 'Nenhuma empresa encontrada' }, { status: 404 })
    }

    // Buscar dados da empresa
    // Tentar buscar com presentationVideo, mas se não existir, usar fallback
    let business: any = null
    try {
      business = await prisma.business.findFirst({
        where: { 
          id: businessId,
          userId: user.id // Verificar se pertence ao usuário
        },
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
          createdAt: true,
          updatedAt: true,
          userId: true,
          presentationVideo: true, // Tentar buscar se existir
          post: {
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: {
                  postlike: true,
                  comment: true
                }
              }
            }
          }
        }
      })
    } catch (error: any) {
      // Se presentationVideo não existir (P2022), buscar sem ele
      if (error.code === 'P2022' || error.message?.includes('presentationVideo') || error.message?.includes('does not exist')) {
        business = await prisma.business.findFirst({
          where: { 
            id: businessId,
            userId: user.id
          },
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
            createdAt: true,
            updatedAt: true,
            userId: true,
            post: {
              orderBy: { createdAt: 'desc' },
              include: {
                _count: {
                  select: {
                    postlike: true,
                    comment: true
                  }
                }
              }
            }
          }
        })
        // Adicionar presentationVideo como null se não existir
        if (business) {
          business.presentationVideo = null
        }
      } else {
        throw error
      }
    }

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ business }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar perfil da empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
