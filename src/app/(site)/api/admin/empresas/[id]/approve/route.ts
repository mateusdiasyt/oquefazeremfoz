import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'

// POST - Aprovar empresa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { id } = params

    // Verificar se a empresa existe
    const empresa = await prisma.business.findUnique({
      where: { id }
    })

    if (!empresa) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Aprovar a empresa
    const updatedEmpresa = await prisma.business.update({
      where: { id },
      data: { 
        isApproved: true,
        approvedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Empresa aprovada com sucesso',
      empresa: updatedEmpresa 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao aprovar empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}