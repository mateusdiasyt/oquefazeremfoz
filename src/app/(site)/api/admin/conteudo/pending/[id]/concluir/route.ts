import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { publishPendingRelease } from '@/lib/publishPendingRelease'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const result = await publishPendingRelease(id)
    if (!result) {
      return NextResponse.json({ message: 'Pendente não encontrado ou já publicado' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Release publicado com sucesso',
      release: { id: result.releaseId, slug: result.slug },
    })
  } catch (error) {
    console.error('Erro ao concluir pendente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
