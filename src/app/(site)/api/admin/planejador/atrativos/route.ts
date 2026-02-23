import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** GET - Listar todos os atrativos (admin) */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const atrativos = await prisma.atrativo.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
    return NextResponse.json(atrativos)
  } catch (e) {
    console.error('Erro ao listar atrativos admin:', e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

/** POST - Criar atrativo (admin) */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const body = await request.json()
    const nome = String(body.nome || '').trim()
    if (!nome) {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }
    const id = `atr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const maxOrdem = await prisma.atrativo.aggregate({ _max: { ordem: true } })
    const ordem = Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : (maxOrdem._max.ordem ?? 0) + 1
    const atrativo = await prisma.atrativo.create({
      data: {
        id,
        nome,
        precoAdultoCents: Number(body.precoAdultoCents) || 0,
        precoCriancaCents: Number(body.precoCriancaCents) || 0,
        duracaoMediaHoras: Number(body.duracaoMediaHoras) || 0,
        tempoDeslocamentoMedioHoras: Number(body.tempoDeslocamentoMedioHoras) || 0,
        regiao: String(body.regiao || 'Centro').trim(),
        nivelCansaco: ['leve', 'medio', 'intenso'].includes(body.nivelCansaco) ? body.nivelCansaco : 'medio',
        custoTransporteMedioCents: Number(body.custoTransporteMedioCents) || 0,
        exigeDocumento: Boolean(body.exigeDocumento),
        ativo: Boolean(body.ativo !== false),
        ordem,
      },
    })
    return NextResponse.json(atrativo)
  } catch (e) {
    console.error('Erro ao criar atrativo:', e)
    return NextResponse.json({ message: 'Erro ao criar atrativo' }, { status: 500 })
  }
}
