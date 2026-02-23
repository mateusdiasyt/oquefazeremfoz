import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** Lista atrativos ativos para o formulário público do planejador */
export async function GET() {
  try {
    const atrativos = await prisma.atrativo.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json(
      atrativos.map((a) => ({
        id: a.id,
        nome: a.nome,
        imageUrl: a.imageUrl ?? null,
        precoAdultoCents: a.precoAdultoCents,
        precoCriancaCents: a.precoCriancaCents,
        duracaoMediaHoras: a.duracaoMediaHoras,
        tempoDeslocamentoMedioHoras: a.tempoDeslocamentoMedioHoras,
        distanciaAeroportoKm: a.distanciaAeroportoKm ?? null,
        regiao: a.regiao,
        nivelCansaco: a.nivelCansaco,
        custoTransporteMedioCents: a.custoTransporteMedioCents,
        exigeDocumento: a.exigeDocumento,
      }))
    )
  } catch (e) {
    console.error('Erro ao listar atrativos:', e)
    return NextResponse.json({ error: 'Erro ao carregar atrativos' }, { status: 500 })
  }
}
