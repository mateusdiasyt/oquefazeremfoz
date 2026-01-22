import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'

// GET - Buscar seguidores de uma empresa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id

    // Verificar se a empresa existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true }
    })

    if (!business) {
      console.log('❌ Empresa não encontrada')
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Buscar seguidores usando BusinessLike
    const businessLikes = await prisma.businesslike.findMany({
      where: {
        businessId: businessId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    // Formatar dados dos seguidores
    const followers = businessLikes.map((like, index) => {
      // Criar uma data baseada no índice para simular datas diferentes
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - (index + 1)) // Dias atrás baseado no índice
      
      return {
        id: like.user.id,
        name: like.user.name || like.user.email,
        email: like.user.email,
        profileImage: null, // User não tem profileImage no schema
        followedAt: baseDate.toISOString()
      }
    })


    return NextResponse.json({ 
      followers,
      total: followers.length
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Erro ao buscar seguidores:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
