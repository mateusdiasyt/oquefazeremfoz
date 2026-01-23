import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar todos os guias
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todos os guias com dados do usuário
    const guides = await prisma.guide.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ guides }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar guias:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
