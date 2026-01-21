import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// POST - Seguir ou desseguir uma empresa
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    // Buscar a empresa sendo seguida
    const targetBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!targetBusiness) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Determinar se é empresa e qual empresa usar para seguir
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId

    let existingFollow = null
    
    if (isCompanyUser && activeBusinessId) {
      // Se for empresa, seguir como empresa usando businessId
      existingFollow = await prisma.follow.findFirst({
        where: {
          followerBusinessId: activeBusinessId,
          followingBusinessId: businessId
        }
      })
    } else {
      // Se for usuário normal, seguir como usuário (manter compatibilidade com sistema atual usando businesslike)
      existingFollow = await prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        }
      })
    }

    if (existingFollow) {
      
      if (isCompanyUser && activeBusinessId) {
        // Desseguir como empresa - remover follow
        await prisma.follow.delete({
          where: {
            id: existingFollow.id
          }
        })
      } else {
        // Desseguir como usuário - remover businesslike
        await prisma.businesslike.delete({
          where: { id: existingFollow.id }
        })
      }

      // Atualizar contadores
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: {
          followersCount: {
            decrement: 1
          }
        },
        select: {
          followersCount: true
        }
      })

      return NextResponse.json({ 
        message: 'Empresa desseguida com sucesso',
        isFollowing: false,
        followersCount: updatedBusiness.followersCount
      })
    } else {
      if (isCompanyUser && activeBusinessId) {
        // Seguir como empresa - criar follow com businessId
        await prisma.follow.create({
          data: {
            id: `follow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            followerId: user.id, // Manter para compatibilidade
            followingId: targetBusiness.userId, // Manter para compatibilidade
            followerBusinessId: activeBusinessId,
            followingBusinessId: businessId
          }
        })
      } else {
        // Seguir como usuário - criar businesslike (manter sistema atual)
        await prisma.businesslike.create({
          data: {
            id: `businesslike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            userId: user.id,
            businessId: businessId
          }
        })
      }

      // Atualizar contadores
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: {
          followersCount: {
            increment: 1
          }
        },
        select: {
          followersCount: true
        }
      })

      return NextResponse.json({ 
        message: 'Empresa seguida com sucesso',
        isFollowing: true,
        followersCount: updatedBusiness.followersCount,
        followedAsBusiness: isCompanyUser && !!activeBusinessId
      })
    }

  } catch (error) {
    console.error('Erro ao seguir/desseguir empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se está seguindo uma empresa
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    // Buscar a empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        userId: true
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se está seguindo (como empresa ou usuário)
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId
    
    let existingFollow = null
    
    if (isCompanyUser && activeBusinessId) {
      // Verificar se a empresa está seguindo
      existingFollow = await prisma.follow.findFirst({
        where: {
          followerBusinessId: activeBusinessId,
          followingBusinessId: businessId
        }
      })
    } else {
      // Verificar se o usuário está seguindo (businesslike)
      existingFollow = await prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        }
      })
    }

    return NextResponse.json({ 
      isFollowing: !!existingFollow,
      followedAsBusiness: isCompanyUser && !!activeBusinessId
    })

  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
