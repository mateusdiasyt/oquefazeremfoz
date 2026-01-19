import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Se for uma empresa, retornar dados da empresa
    if (isCompany(user.roles)) {
      const business = await prisma.business.findUnique({
        where: { userId: user.id }
      })

      if (!business) {
        return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
      }

      return NextResponse.json({ 
        type: 'business',
        business,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          roles: user.roles
        }
      }, { status: 200 })
    }

    // Se for usuário comum (turista), retornar dados do usuário
    return NextResponse.json({ 
      type: 'user',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        roles: user.roles,
        createdAt: user.createdAt
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}