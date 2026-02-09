import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/**
 * Todos os releases publicados por empresas aprovadas (Portal do Turismo).
 * Ordenado pelo mais recente primeiro.
 */
export async function GET() {
  try {
    const releases = await prisma.businessrelease.findMany({
      where: {
        isPublished: true,
        business: { isApproved: true },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(releases)
  } catch (error) {
    console.error('Erro ao buscar releases do portal:', error)
    return NextResponse.json({ message: 'Erro ao buscar releases' }, { status: 500 })
  }
}
