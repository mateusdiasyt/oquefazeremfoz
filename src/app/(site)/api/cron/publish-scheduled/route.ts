import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { publishPendingRelease } from '@/lib/publishPendingRelease'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '') || request.nextUrl.searchParams.get('secret')
    if (secret && token !== secret) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const now = new Date()
    const toPublish = await prisma.pendingrelease.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: now, not: null },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    const published: { id: string; releaseId: string }[] = []
    for (const p of toPublish) {
      const result = await publishPendingRelease(p.id)
      if (result) published.push({ id: p.id, releaseId: result.releaseId })
    }

    return NextResponse.json({
      message: `${published.length} agendamento(s) publicados`,
      published,
    })
  } catch (error) {
    console.error('Erro ao publicar agendados:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
