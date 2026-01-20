import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as empresas (removendo filtro isApproved temporariamente para que apareçam)
    // TODO: Implementar sistema de aprovação via admin se necessário
    const businesses = await prisma.business.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Aumentado para 50 empresas
    })

    return NextResponse.json({ businesses }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
