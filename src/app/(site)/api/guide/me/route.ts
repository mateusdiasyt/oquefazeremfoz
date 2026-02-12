import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

/** Retorna o guia do usuário logado (para publicar como guia na home). */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const guide = await prisma.guide.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        profileImage: true,
        isVerified: true,
        isApproved: true,
      },
    })

    if (!guide) {
      return NextResponse.json({ guide: null }, { status: 200 })
    }

    return NextResponse.json({ guide }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar guia do usuário:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
