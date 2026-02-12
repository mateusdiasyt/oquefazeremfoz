import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const VIEW_COOKIE_PREFIX = 'rview_'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 horas (mesmo visitante não conta de novo)

/**
 * POST - Registra uma visualização no release (estilo YouTube).
 * Usa cookie para não contar o mesmo visitante várias vezes em 24h.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const releaseId = typeof body.releaseId === 'string' ? body.releaseId.trim() : null

    if (!releaseId) {
      return NextResponse.json({ message: 'releaseId é obrigatório' }, { status: 400 })
    }

    const cookieName = `${VIEW_COOKIE_PREFIX}${releaseId}`
    const alreadyViewed = request.cookies.get(cookieName)?.value === '1'

    if (alreadyViewed) {
      const release = await prisma.businessrelease.findUnique({
        where: { id: releaseId },
        select: { views: true },
      })
      return NextResponse.json(
        { views: release?.views ?? 0, counted: false },
        { status: 200 }
      )
    }

    const release = await prisma.businessrelease.update({
      where: { id: releaseId },
      data: { views: { increment: 1 } },
      select: { views: true },
    })

    const res = NextResponse.json({ views: release.views, counted: true }, { status: 200 })
    res.cookies.set(cookieName, '1', {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false, // não precisa ser httpOnly para leitura no cliente
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch (error) {
    console.error('Erro ao registrar visualização do release:', error)
    return NextResponse.json({ message: 'Erro ao registrar visualização' }, { status: 500 })
  }
}
