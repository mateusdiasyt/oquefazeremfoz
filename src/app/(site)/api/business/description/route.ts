import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ message: 'Descrição é obrigatória' }, { status: 400 })
    }

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Atualizar a descrição
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: { description }
    })

    return NextResponse.json({ 
      message: 'Descrição atualizada com sucesso',
      business: updatedBusiness 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar descrição:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
