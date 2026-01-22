import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!user.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todos os usuários com contagem de empresas
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        userrole: {
          select: {
            role: true
          }
        },
        _count: {
          select: {
            business: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatar usuários
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.userrole.map(r => r.role),
      createdAt: u.createdAt.toISOString(),
      businessCount: u._count.business
    }))

    return NextResponse.json({ users: formattedUsers }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
