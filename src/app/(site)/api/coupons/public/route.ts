import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

// GET - Buscar todos os cupons públicos com filtro de categoria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Buscar cupons ativos com dados da empresa
    const coupons = await prisma.businesscoupon.findMany({
      where: {
        isActive: true,
        business: {
          isApproved: true, // Apenas empresas aprovadas
          ...(category && category !== 'Todas' ? { category } : {})
        }
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
        createdAt: 'desc'
      }
    })

    // Buscar categorias únicas das empresas que têm cupons
    const categories = await prisma.business.findMany({
      where: {
        isApproved: true,
        businesscoupon: {
          some: {
            isActive: true
          }
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    const uniqueCategories = ['Todas', ...categories.map(c => c.category).sort()]

    return NextResponse.json({ 
      coupons,
      categories: uniqueCategories
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar cupons públicos:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
