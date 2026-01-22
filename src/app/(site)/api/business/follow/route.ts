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

    if (!targetBusiness.userId) {
      return NextResponse.json({ message: 'Empresa sem usuário associado' }, { status: 400 })
    }

    // Determinar se é empresa e qual empresa usar para seguir
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId

    let existingFollow = null
    
    // Por enquanto, usar apenas businesslike para todos (até migração ser executada)
    // TODO: Após executar add-follow-business-columns.sql, descomentar código de follow para empresas
    existingFollow = await prisma.businesslike.findFirst({
      where: {
        userId: user.id,
        businessId: businessId
      }
    })
    
    /* Código para quando as colunas followerBusinessId e followingBusinessId existirem:
    if (isCompanyUser && activeBusinessId) {
      // Se for empresa, seguir como empresa usando businessId
      try {
        existingFollow = await prisma.follow.findFirst({
          where: {
            followerBusinessId: activeBusinessId,
            followingBusinessId: businessId
          }
        })
      } catch (error: any) {
        // Se as colunas não existirem, usar businesslike como fallback
        if (error.code === 'P2022') {
          existingFollow = await prisma.businesslike.findFirst({
            where: {
              userId: user.id,
              businessId: businessId
            }
          })
        } else {
          throw error
        }
      }
    } else {
      // Se for usuário normal, seguir como usuário (manter compatibilidade com sistema atual usando businesslike)
      existingFollow = await prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        }
      })
    }
    */

    if (existingFollow) {
      // Desseguir - remover businesslike (funciona para todos por enquanto)
      await prisma.businesslike.delete({
        where: { id: existingFollow.id }
      })
      
      /* Código para quando as colunas existirem:
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
      */

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
      // Seguir - criar businesslike (funciona para todos por enquanto)
      // Verificar novamente para evitar race condition
      const duplicateCheck = await prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        }
      })

      if (duplicateCheck) {
        // Se já existe, retornar sucesso (pode ter sido criado entre a verificação e agora)
        const currentBusiness = await prisma.business.findUnique({
          where: { id: businessId },
          select: { followersCount: true }
        })

        return NextResponse.json({ 
          message: 'Empresa seguida com sucesso',
          isFollowing: true,
          followersCount: currentBusiness?.followersCount || 0
        })
      }

      await prisma.businesslike.create({
        data: {
          id: `businesslike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: user.id,
          businessId: businessId
        }
      })
      
      /* Código para quando as colunas existirem:
      if (isCompanyUser && activeBusinessId) {
        // Seguir como empresa - criar follow com businessId
        // Verificar se já existe um follow com esses IDs de usuário para evitar constraint violation
        const existingUserFollow = await prisma.follow.findFirst({
          where: {
            followerId: user.id,
            followingId: targetBusiness.userId
          }
        })

        if (existingUserFollow) {
          // Se já existe follow entre usuários, atualizar para incluir businessIds
          await prisma.follow.update({
            where: { id: existingUserFollow.id },
            data: {
              followerBusinessId: activeBusinessId,
              followingBusinessId: businessId
            }
          })
        } else {
          // Criar novo follow
          await prisma.follow.create({
            data: {
              id: `follow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              followerId: user.id, // Obrigatório
              followingId: targetBusiness.userId, // Obrigatório
              followerBusinessId: activeBusinessId,
              followingBusinessId: businessId
            }
          })
        }
      } else {
        // Seguir como usuário - criar businesslike (manter sistema atual)
        // Verificar novamente para evitar race condition
        const duplicateCheck = await prisma.businesslike.findFirst({
          where: {
            userId: user.id,
            businessId: businessId
          }
        })

        if (duplicateCheck) {
          // Se já existe, retornar sucesso (pode ter sido criado entre a verificação e agora)
          const currentBusiness = await prisma.business.findUnique({
            where: { id: businessId },
            select: { followersCount: true }
          })

          return NextResponse.json({ 
            message: 'Empresa seguida com sucesso',
            isFollowing: true,
            followersCount: currentBusiness?.followersCount || 0
          })
        }

        await prisma.businesslike.create({
          data: {
            id: `businesslike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            userId: user.id,
            businessId: businessId
          }
        })
      }
      */

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
        followedAsBusiness: false // Será true quando as colunas existirem e código for descomentado
      })
    }

  } catch (error: any) {
    console.error('Erro ao seguir/desseguir empresa:', error)
    
    // Tratar erros específicos do Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        message: 'Você já está seguindo esta empresa' 
      }, { status: 400 })
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        message: 'Referência inválida. Empresa ou usuário não encontrado.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
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

    // Verificar se está seguindo (usando businesslike por enquanto)
    // TODO: Após executar add-follow-business-columns.sql, adicionar verificação de follow para empresas
    const existingFollow = await prisma.businesslike.findFirst({
      where: {
        userId: user.id,
        businessId: businessId
      }
    })
    
    /* Código para quando as colunas existirem:
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId
    
    let existingFollow = null
    
    if (isCompanyUser && activeBusinessId) {
      // Verificar se a empresa está seguindo
      try {
        existingFollow = await prisma.follow.findFirst({
          where: {
            followerBusinessId: activeBusinessId,
            followingBusinessId: businessId
          }
        })
      } catch (error: any) {
        // Se as colunas não existirem, usar businesslike como fallback
        if (error.code === 'P2022') {
          existingFollow = await prisma.businesslike.findFirst({
            where: {
              userId: user.id,
              businessId: businessId
            }
          })
        } else {
          throw error
        }
      }
    } else {
      // Verificar se o usuário está seguindo (businesslike)
      existingFollow = await prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        }
      })
    }
    */

    return NextResponse.json({ 
      isFollowing: !!existingFollow,
      followedAsBusiness: false // Será true quando as colunas existirem e código for descomentado
    })

  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
