import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

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

    // Verificar se a empresa existe
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário já curtiu esta empresa
    const existingLike = await prisma.businessLike.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Se já curtiu, remover a curtida
      await prisma.businessLike.delete({
        where: {
          businessId_userId: {
            businessId,
            userId: user.id
          }
        }
      })

      // Decrementar contador
      await prisma.business.update({
        where: { id: businessId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Curtida removida com sucesso!',
        isLiked: false,
        likesCount: business.likesCount - 1
      })
    } else {
      // Se não curtiu, adicionar curtida
      await prisma.businessLike.create({
        data: {
          businessId,
          userId: user.id
        }
      })

      // Incrementar contador
      await prisma.business.update({
        where: { id: businessId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Empresa curtida com sucesso!',
        isLiked: true,
        likesCount: business.likesCount + 1
      })
    }

  } catch (error) {
    console.error('Erro ao curtir empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

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

    // Verificar se o usuário curtiu esta empresa
    const existingLike = await prisma.businessLike.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id
        }
      }
    })

    return NextResponse.json({ 
      isLiked: !!existingLike
    })

  } catch (error) {
    console.error('Erro ao verificar curtida:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
