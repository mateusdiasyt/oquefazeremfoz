import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// POST - Seguir ou desseguir uma empresa
export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando follow/unfollow...')
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { businessId } = await request.json()
    console.log('BusinessId recebido:', businessId)

    if (!businessId) {
      console.log('BusinessId não fornecido')
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    // Buscar a empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se já está seguindo (usando businesslike)
    const existingLike = await prisma.businesslike.findFirst({
      where: {
        userId: user.id,
        businessId: businessId
      }
    })

    if (existingLike) {
      console.log('Desseguindo empresa...')
      // Desseguir - remover businesslike
      await prisma.businesslike.delete({
        where: { id: existingLike.id }
      })
      console.log('businesslike deletado')

      // Atualizar contadores
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: {
          followersCount: {
            decrement: 1
          }
        }
      })
      console.log('Contador atualizado:', updatedBusiness.followersCount)

      return NextResponse.json({ 
        message: 'Empresa desseguida com sucesso',
        isFollowing: false,
        followersCount: updatedBusiness.followersCount
      })
    } else {
      console.log('Seguindo empresa...')
      // Seguir - criar businesslike
      await prisma.businesslike.create({
        data: {
          userId: user.id,
          businessId: businessId
        }
      })
      console.log('businesslike criado')

      // Atualizar contadores
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: {
          followersCount: {
            increment: 1
          }
        }
      })
      console.log('Contador atualizado:', updatedBusiness.followersCount)

      return NextResponse.json({ 
        message: 'Empresa seguida com sucesso',
        isFollowing: true,
        followersCount: updatedBusiness.followersCount
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
      include: { user: true }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se está seguindo (usando businesslike)
    const existingLike = await prisma.businesslike.findFirst({
      where: {
        userId: user.id,
        businessId: businessId
      }
    })

    return NextResponse.json({ 
      isFollowing: !!existingLike 
    })

  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
