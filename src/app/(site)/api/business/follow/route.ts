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

    // Buscar empresa e verificar follow em paralelo para melhor performance
    const [targetBusiness, existingFollow] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          userId: true,
          followersCount: true
        }
      }),
      prisma.businesslike.findFirst({
        where: {
          userId: user.id,
          businessId: businessId
        },
        select: {
          id: true
        }
      })
    ])

    if (!targetBusiness) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    if (!targetBusiness.userId) {
      return NextResponse.json({ message: 'Empresa sem usuário associado' }, { status: 400 })
    }
    
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
      // Desseguir - remover businesslike e atualizar contador em paralelo
      const [, updatedBusiness] = await Promise.all([
        prisma.businesslike.delete({
          where: { id: existingFollow.id }
        }),
        prisma.business.update({
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
      ])

      return NextResponse.json({ 
        message: 'Empresa desseguida com sucesso',
        isFollowing: false,
        followersCount: updatedBusiness.followersCount
      })
    } else {
      // Seguir - criar businesslike e atualizar contador em paralelo
      try {
        const [, updatedBusiness] = await Promise.all([
          prisma.businesslike.create({
            data: {
              id: `businesslike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              userId: user.id,
              businessId: businessId
            }
          }),
          prisma.business.update({
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
        ])

        return NextResponse.json({ 
          message: 'Empresa seguida com sucesso',
          isFollowing: true,
          followersCount: updatedBusiness.followersCount,
          followedAsBusiness: false
        })
      } catch (error: any) {
        // Se já existe (P2002 = unique constraint violation), retornar sucesso
        if (error.code === 'P2002') {
          return NextResponse.json({ 
            message: 'Empresa seguida com sucesso',
            isFollowing: true,
            followersCount: targetBusiness.followersCount
          })
        }
        throw error
      }
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
