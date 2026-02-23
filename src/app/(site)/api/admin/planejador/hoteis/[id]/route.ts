import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../../lib/auth'
import { prisma } from '../../../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** PUT - Atualizar hotel (admin) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: String(body.nome).trim() }),
        ...(body.endereco !== undefined && { endereco: String(body.endereco).trim() }),
        ...(body.ativo !== undefined && { ativo: Boolean(body.ativo) }),
        ...(body.ordem !== undefined && { ordem: Number(body.ordem) }),
      },
    })
    return NextResponse.json(hotel)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json({ message: 'Hotel não encontrado' }, { status: 404 })
    }
    console.error('Erro ao atualizar hotel:', e)
    return NextResponse.json({ message: 'Erro ao atualizar' }, { status: 500 })
  }
}

/** DELETE - Excluir hotel (admin) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const { id } = await params
    await prisma.hotel.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json({ message: 'Hotel não encontrado' }, { status: 404 })
    }
    console.error('Erro ao excluir hotel:', e)
    return NextResponse.json({ message: 'Erro ao excluir' }, { status: 500 })
  }
}
