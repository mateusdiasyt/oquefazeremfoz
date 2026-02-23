import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import {
  tempoTotalAtrativos,
  capacidadeTotalHoras,
  diasMinimosRecomendados,
  roteirizar,
  calcularCustos,
  type TipoViagem,
  type Transporte,
  type AtrativoInput,
} from '../../../../../lib/planejador'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TIPOS_VIAGEM: TipoViagem[] = ['economica', 'padrao', 'conforto']
const TRANSPORTES: Transporte[] = ['sem_carro', 'carro_proprio', 'transfer']

/** POST: calcula roteiro e custos. Body: { dias, pessoas, tipoViagem, transporte, atrativosIds[] } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dias = Math.min(7, Math.max(1, Number(body.dias) || 1))
    const pessoas = Math.min(20, Math.max(1, Number(body.pessoas) || 1))
    const tipoViagem = TIPOS_VIAGEM.includes(body.tipoViagem) ? body.tipoViagem : 'padrao'
    const transporte = TRANSPORTES.includes(body.transporte) ? body.transporte : 'sem_carro'
    const atrativosIds: string[] = Array.isArray(body.atrativosIds) ? body.atrativosIds : []

    if (atrativosIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos um atrativo.' },
        { status: 400 }
      )
    }

    const [atrativosRows, configRow] = await Promise.all([
      prisma.atrativo.findMany({
        where: { id: { in: atrativosIds }, ativo: true },
      }),
      prisma.planejadorconfig.findUnique({ where: { id: 'default' } }),
    ])

    const config = configRow
      ? {
          alimentacaoEconomicaCents: configRow.alimentacaoEconomicaCents,
          alimentacaoPadraoCents: configRow.alimentacaoPadraoCents,
          alimentacaoConfortoCents: configRow.alimentacaoConfortoCents,
          multiplicadorUber: configRow.multiplicadorUber,
          multiplicadorTransfer: configRow.multiplicadorTransfer,
          multiplicadorCarroProprio: configRow.multiplicadorCarroProprio,
          horasMaximasPorDia: configRow.horasMaximasPorDia,
          moeda: configRow.moeda,
        }
      : {
          alimentacaoEconomicaCents: 5000,
          alimentacaoPadraoCents: 12000,
          alimentacaoConfortoCents: 20000,
          multiplicadorUber: 1,
          multiplicadorTransfer: 1.5,
          multiplicadorCarroProprio: 0.3,
          horasMaximasPorDia: 8,
          moeda: 'BRL' as const,
        }

    const atrativos: AtrativoInput[] = atrativosRows.map((a) => ({
      id: a.id,
      nome: a.nome,
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

    const tempoTotalHoras = tempoTotalAtrativos(atrativos)
    const capacidadeTotal = capacidadeTotalHoras(dias, config.horasMaximasPorDia)
    const diasRecomendados = diasMinimosRecomendados(tempoTotalHoras, config.horasMaximasPorDia)
    const naoCabeNosDias = tempoTotalHoras > capacidadeTotal

    const roteiro = roteirizar(atrativos, dias, config.horasMaximasPorDia)
    const custos = calcularCustos(
      atrativos,
      { dias, pessoas, tipoViagem, transporte },
      config
    )

    const exigeDocumento = atrativos.some((a) => a.exigeDocumento)

    return NextResponse.json({
      success: true,
      roteiro,
      custos: {
        ingressosCents: custos.ingressosCents,
        transporteCents: custos.transporteCents,
        alimentacaoCents: custos.alimentacaoCents,
        totalCents: custos.totalCents,
        totalPorPessoaCents: custos.totalPorPessoaCents,
      },
      tempoTotalHoras,
      moeda: config.moeda,
      avisoDias: naoCabeNosDias
        ? {
            tempoTotalHoras,
            diasRecomendados,
            mensagem: `Os passeios selecionados exigem aproximadamente ${Math.round(tempoTotalHoras)} horas. Para aproveitar sem correria, recomendamos no mínimo ${diasRecomendados} dias.`,
          }
        : null,
      dicas: [
        'Leve protetor solar e repelente.',
        'Use calçados confortáveis para caminhadas.',
        exigeDocumento ? 'Documento de identidade é necessário para alguns atrativos (Argentina/Paraguai).' : null,
      ].filter(Boolean),
    })
  } catch (e) {
    console.error('Erro ao calcular roteiro:', e)
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular roteiro. Tente novamente.' },
      { status: 500 }
    )
  }
}
