import { NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publishPendingRelease } from '@/lib/publishPendingRelease'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
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
      message: published.length > 0 ? `${published.length} agendamento(s) publicados` : 'Nenhum agendamento pendente para publicar',
      published,
    })
  } catch (error) {
    console.error('Erro ao publicar agendados:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
