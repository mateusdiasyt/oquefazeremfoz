import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

// GET - Listar banners ativos (público)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ banners }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
