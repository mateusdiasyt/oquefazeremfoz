import { NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const [releases, posts, pending] = await Promise.all([
      prisma.businessrelease.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, slug: true } },
          guide: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.pendingrelease.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, slug: true } },
        },
      }),
    ])

    return NextResponse.json({
      releases,
      posts,
      pending,
    })
  } catch (error) {
    console.error('Erro ao listar conteúdo:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
