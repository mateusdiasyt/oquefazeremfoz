import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/**
 * Últimos releases publicados, sem limite por empresa.
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
        },
        _count: { select: { releasecomment: true } }
      },
      orderBy: { publishedAt: 'desc' as const },
      take: 30
    })

    const headers = {
      'Cache-Control': 'no-store, max-age=0',
      'CDN-Cache-Control': 'no-store'
    }
    return NextResponse.json(releases, { headers })
  } catch (error) {
    console.error('Erro ao buscar releases recentes:', error)
    return NextResponse.json({ message: 'Erro ao buscar releases' }, { status: 500 })
  }
}
