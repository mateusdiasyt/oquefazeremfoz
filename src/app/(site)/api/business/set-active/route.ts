import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// POST - Definir empresa ativa
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

    // Verificar se a empresa pertence ao usuário
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    })

    if (!business) {
      return NextResponse.json({ 
        message: 'Empresa não encontrada ou não pertence ao usuário' 
      }, { status: 404 })
    }

    // Atualizar empresa ativa do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { activeBusinessId: businessId }
    })

    return NextResponse.json({ 
      message: 'Empresa ativa definida com sucesso',
      activeBusinessId: businessId
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao definir empresa ativa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
