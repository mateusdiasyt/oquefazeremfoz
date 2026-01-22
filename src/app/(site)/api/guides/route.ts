import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    // Buscar apenas guias aprovados
    const where: any = {
      isApproved: true
    }

    // Filtro de busca por nome
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Filtro por especialidade
    if (category) {
      where.specialties = {
        contains: category,
        mode: 'insensitive'
      }
    }

    const guides = await prisma.guide.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isVerified: 'desc' },
        { ratingAvg: 'desc' },
        { followersCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Filtrar guias que têm usuário válido
    const validGuides = guides.filter(guide => guide.user && guide.user.id)

    return NextResponse.json({ 
      guides: validGuides 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar guias:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
