import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '../../../../../lib/auth'

const prisma = new PrismaClient()

// PUT - Atualizar website da empresa
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!user.roles.includes('COMPANY')) {
      return NextResponse.json({ error: 'Apenas empresas podem editar o website' }, { status: 403 })
    }

    const body = await request.json()
    const { website } = body

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ error: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Validar URL se fornecida
    if (website && website.trim() !== '') {
      try {
        new URL(website)
      } catch {
        return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
      }
    }

    // Atualizar o website
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        website: website?.trim() || null
      }
    })

    return NextResponse.json({ 
      message: 'Website atualizado com sucesso!',
      business: updatedBusiness
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar website:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

