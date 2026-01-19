import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.businesscoupon.findMany({
      where: {
        isActive: true,
        validUntil: {
          gt: new Date()
        }
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(coupons, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar cupons:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
