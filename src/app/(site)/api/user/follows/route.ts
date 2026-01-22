import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'

// GET - Buscar empresas seguidas pelo usuário logado
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const follows = await prisma.businesslike.findMany({
      where: {
        userId: user.id
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            profileImage: true,
            isVerified: true,
            category: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json({ follows }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar empresas seguidas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
