import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'

// POST - Verificar/Desverificar guia
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
    const { isVerified } = await request.json()

    // Verificar se o guia existe
    const guide = await prisma.guide.findUnique({
      where: { id }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
    }

    // Atualizar verificação
    const updatedGuide = await prisma.guide.update({
      where: { id },
      data: { 
        isVerified: isVerified === true || isVerified === 'true'
      }
    })

    return NextResponse.json({ 
      message: 'Verificação atualizada com sucesso',
      guide: updatedGuide 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar verificação do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
