import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar todas as empresas do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar todas as empresas do usuário
    const businesses = await prisma.business.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        profileImage: true,
        coverImage: true,
        isApproved: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Se usuário tem empresas mas não tem activeBusinessId, definir a primeira como ativa
    let activeBusinessId = user.activeBusinessId || businesses[0]?.id || null
    
    if (businesses.length > 0 && !user.activeBusinessId) {
      // Definir a primeira empresa como ativa automaticamente
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { activeBusinessId: businesses[0].id }
        })
        activeBusinessId = businesses[0].id
      } catch (error: any) {
        // Continuar mesmo se falhar (pode ser que activeBusinessId não existe ainda no banco)
      }
    }

    return NextResponse.json({ 
      businesses,
      activeBusinessId: activeBusinessId
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
