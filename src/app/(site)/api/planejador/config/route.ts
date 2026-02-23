import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** Retorna configurações públicas do planejador (apenas valores usados no cálculo) */
export async function GET() {
  try {
    const config = await prisma.planejadorconfig.findUnique({
      where: { id: 'default' },
    })
    if (!config) {
      return NextResponse.json(
        {
          alimentacaoEconomicaCents: 5000,
          alimentacaoPadraoCents: 12000,
          alimentacaoConfortoCents: 20000,
          multiplicadorUber: 1,
          multiplicadorTransfer: 1.5,
          multiplicadorCarroProprio: 0.3,
          horasMaximasPorDia: 8,
          moeda: 'BRL',
          precoGasolinaCents: 590,
          consumoKmPorLitro: 10,
          custoPorKmCents: 0,
        },
        { status: 200 }
      )
    }
    return NextResponse.json({
      alimentacaoEconomicaCents: config.alimentacaoEconomicaCents,
      alimentacaoPadraoCents: config.alimentacaoPadraoCents,
      alimentacaoConfortoCents: config.alimentacaoConfortoCents,
      multiplicadorUber: config.multiplicadorUber,
      multiplicadorTransfer: config.multiplicadorTransfer,
      multiplicadorCarroProprio: config.multiplicadorCarroProprio,
      horasMaximasPorDia: config.horasMaximasPorDia,
      moeda: config.moeda,
      precoGasolinaCents: config.precoGasolinaCents,
      consumoKmPorLitro: config.consumoKmPorLitro,
      custoPorKmCents: (config as { custoPorKmCents?: number }).custoPorKmCents ?? 0,
    })
  } catch (e) {
    console.error('Erro ao buscar config planejador:', e)
    return NextResponse.json({ error: 'Erro ao carregar configurações' }, { status: 500 })
  }
}
