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
import {
  geocodificar,
  distanciaRotaKm,
  ordenarAtrativosPorDistanciaDoHotel,
  type Coord,
} from '../../../../../lib/rotasHotel'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const TIPOS_VIAGEM: TipoViagem[] = ['economica', 'padrao', 'conforto']
const TRANSPORTES: Transporte[] = ['sem_carro', 'carro_proprio', 'transfer']

/** POST: calcula roteiro e custos. Body: { dias, pessoas, tipoViagem, transporte, atrativosIds[], hotelId? } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dias = Math.min(7, Math.max(1, Number(body.dias) || 1))
    const pessoas = Math.min(20, Math.max(1, Number(body.pessoas) || 1))
    const tipoViagem = TIPOS_VIAGEM.includes(body.tipoViagem) ? body.tipoViagem : 'padrao'
    const transporte = TRANSPORTES.includes(body.transporte) ? body.transporte : 'sem_carro'
    const atrativosIds: string[] = Array.isArray(body.atrativosIds) ? body.atrativosIds : []
    const hotelId = body.hotelId ? String(body.hotelId).trim() || null : null

    if (atrativosIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos um atrativo.' },
        { status: 400 }
      )
    }

    const [atrativosRows, configRow, hotelRow] = await Promise.all([
      prisma.atrativo.findMany({
        where: { id: { in: atrativosIds }, ativo: true },
      }),
      prisma.planejadorconfig.findUnique({ where: { id: 'default' } }),
      hotelId ? prisma.hotel.findUnique({ where: { id: hotelId } }) : Promise.resolve(null),
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
          precoGasolinaCents: (configRow as { precoGasolinaCents?: number }).precoGasolinaCents ?? 590,
          consumoKmPorLitro: (configRow as { consumoKmPorLitro?: number }).consumoKmPorLitro ?? 10,
          custoPorKmCents: (configRow as { custoPorKmCents?: number }).custoPorKmCents ?? 0,
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
          precoGasolinaCents: 590,
          consumoKmPorLitro: 10,
          custoPorKmCents: 0,
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

    let roteiro = roteirizar(atrativos, dias, config.horasMaximasPorDia)
    let transporteCents = 0
    let rotaPorDia: Array<{ dia: number; km: number; custoTransporteCents: number; ordemNomes: string[] }> = []

    const usaHotelCarro = transporte === 'carro_proprio' && hotelRow && hotelId

    if (usaHotelCarro) {
      const hotelCoords = await geocodificar(hotelRow.endereco)
      if (!hotelCoords) {
        return NextResponse.json(
          { success: false, error: 'Não foi possível localizar o endereço do hotel. Tente outro ou use sem hotel.' },
          { status: 422 }
        )
      }
      const coordsByAtrativoId = new Map<string, Coord>()
      for (const row of atrativosRows) {
        const query = (row.endereco && row.endereco.trim()) || `${row.nome}, Foz do Iguaçu, Brasil`
        const coord = await geocodificar(query)
        if (coord) coordsByAtrativoId.set(row.id, coord)
        await new Promise((r) => setTimeout(r, 300))
      }
      const custoPorKmCents = (config as { custoPorKmCents?: number }).custoPorKmCents && (config as { custoPorKmCents?: number }).custoPorKmCents > 0
        ? (config as { custoPorKmCents: number }).custoPorKmCents
        : config.precoGasolinaCents / config.consumoKmPorLitro

      for (let i = 0; i < roteiro.length; i++) {
        const diaRoteiro = roteiro[i]
        const ordenados = ordenarAtrativosPorDistanciaDoHotel(
          diaRoteiro.atrativos,
          hotelCoords,
          (a) => coordsByAtrativoId.get(a.id) ?? null
        )
        const waypoints: Coord[] = [hotelCoords]
        for (const a of ordenados) {
          const c = coordsByAtrativoId.get(a.id)
          if (c) waypoints.push(c)
        }
        waypoints.push(hotelCoords)

        const km = waypoints.length > 2 ? await distanciaRotaKm(waypoints) : 0
        const custoDia = km != null ? Math.round(km * custoPorKmCents) : 0
        transporteCents += custoDia
        rotaPorDia.push({
          dia: diaRoteiro.dia,
          km: km ?? 0,
          custoTransporteCents: custoDia,
          ordemNomes: [hotelRow.nome, ...ordenados.map((a) => a.nome)],
        })
        roteiro[i] = { ...diaRoteiro, atrativos: ordenados }
      }
    } else {
      const custos = calcularCustos(
        atrativos,
        { dias, pessoas, tipoViagem, transporte },
        config
      )
      transporteCents = custos.transporteCents
    }

    const custos = calcularCustos(
      atrativos,
      { dias, pessoas, tipoViagem, transporte },
      config
    )
    const custosFinais = usaHotelCarro
      ? {
          ingressosCents: custos.ingressosCents,
          transporteCents,
          alimentacaoCents: custos.alimentacaoCents,
          totalCents: custos.ingressosCents + transporteCents + custos.alimentacaoCents,
          totalPorPessoaCents: pessoas > 0 ? Math.round((custos.ingressosCents + transporteCents + custos.alimentacaoCents) / pessoas) : 0,
        }
      : {
          ingressosCents: custos.ingressosCents,
          transporteCents: custos.transporteCents,
          alimentacaoCents: custos.alimentacaoCents,
          totalCents: custos.totalCents,
          totalPorPessoaCents: custos.totalPorPessoaCents,
        }

    const exigeDocumento = atrativos.some((a) => a.exigeDocumento)

    return NextResponse.json({
      success: true,
      roteiro,
      rotaPorDia: rotaPorDia.length > 0 ? rotaPorDia : undefined,
      custos: custosFinais,
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
