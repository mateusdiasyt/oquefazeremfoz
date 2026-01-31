import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/**
 * Últimos releases publicados, 1 por empresa (o mais recente de cada).
 * Ordenado pelo mais recente primeiro.
 */
export async function GET() {
  try {
    const releases = await prisma.businessrelease.findMany({
      where: {
        isPublished: true,
        business: { isApproved: true }
      },
      include: {
        business: {
          select: { id: true, name: true, slug: true, profileImage: true, isVerified: true }
        }
      },
      orderBy: { publishedAt: 'desc' as const }
    })

    const seen = new Set<string>()
    const onePerBusiness = releases
      .filter((r) => r.business && !seen.has(r.businessId) && seen.add(r.businessId))
      .slice(0, 12)

    return NextResponse.json(onePerBusiness)
  } catch (error) {
    console.error('Erro ao buscar releases recentes:', error)
    return NextResponse.json({ message: 'Erro ao buscar releases' }, { status: 500 })
  }
}
