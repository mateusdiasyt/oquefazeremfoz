import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** GET - Buscar um atrativo (admin) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const { id } = await params
    const atrativo = await prisma.atrativo.findUnique({ where: { id } })
    if (!atrativo) {
      return NextResponse.json({ message: 'Atrativo não encontrado' }, { status: 404 })
    }
    return NextResponse.json(atrativo)
  } catch (e) {
    console.error('Erro ao buscar atrativo:', e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

/** PUT - Atualizar atrativo (admin) */
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
    const atrativo = await prisma.atrativo.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: String(body.nome).trim() }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null }),
        ...(body.precoAdultoCents !== undefined && { precoAdultoCents: Number(body.precoAdultoCents) }),
        ...(body.precoCriancaCents !== undefined && { precoCriancaCents: Number(body.precoCriancaCents) }),
        ...(body.duracaoMediaHoras !== undefined && { duracaoMediaHoras: Number(body.duracaoMediaHoras) }),
        ...(body.tempoDeslocamentoMedioHoras !== undefined && { tempoDeslocamentoMedioHoras: Number(body.tempoDeslocamentoMedioHoras) }),
        ...(body.distanciaAeroportoKm !== undefined && { distanciaAeroportoKm: body.distanciaAeroportoKm === '' || body.distanciaAeroportoKm == null ? null : Number(body.distanciaAeroportoKm) }),
        ...(body.regiao !== undefined && { regiao: String(body.regiao).trim() }),
        ...(body.nivelCansaco !== undefined && { nivelCansaco: body.nivelCansaco }),
        ...(body.custoTransporteMedioCents !== undefined && { custoTransporteMedioCents: Number(body.custoTransporteMedioCents) }),
        ...(body.exigeDocumento !== undefined && { exigeDocumento: Boolean(body.exigeDocumento) }),
        ...(body.ativo !== undefined && { ativo: Boolean(body.ativo) }),
        ...(body.ordem !== undefined && { ordem: Number(body.ordem) }),
      },
    })
    return NextResponse.json(atrativo)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json({ message: 'Atrativo não encontrado' }, { status: 404 })
    }
    console.error('Erro ao atualizar atrativo:', e)
    return NextResponse.json({ message: 'Erro ao atualizar' }, { status: 500 })
  }
}

/** DELETE - Excluir atrativo (admin) */
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
    await prisma.atrativo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json({ message: 'Atrativo não encontrado' }, { status: 404 })
    }
    console.error('Erro ao excluir atrativo:', e)
    return NextResponse.json({ message: 'Erro ao excluir' }, { status: 500 })
  }
}
