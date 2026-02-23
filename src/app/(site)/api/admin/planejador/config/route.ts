import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** GET - Configurações do planejador (admin) */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const config = await prisma.planejadorconfig.findUnique({
      where: { id: 'default' },
    })
    if (!config) {
      return NextResponse.json({
        id: 'default',
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
      })
    }
    return NextResponse.json(config)
  } catch (e) {
    console.error('Erro ao buscar config planejador:', e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

/** PUT - Atualizar configurações (admin) */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const body = await request.json()
    const config = await prisma.planejadorconfig.upsert({
      where: { id: 'default' },
      update: {
        ...(body.alimentacaoEconomicaCents !== undefined && { alimentacaoEconomicaCents: Number(body.alimentacaoEconomicaCents) }),
        ...(body.alimentacaoPadraoCents !== undefined && { alimentacaoPadraoCents: Number(body.alimentacaoPadraoCents) }),
        ...(body.alimentacaoConfortoCents !== undefined && { alimentacaoConfortoCents: Number(body.alimentacaoConfortoCents) }),
        ...(body.multiplicadorUber !== undefined && { multiplicadorUber: Number(body.multiplicadorUber) }),
        ...(body.multiplicadorTransfer !== undefined && { multiplicadorTransfer: Number(body.multiplicadorTransfer) }),
        ...(body.multiplicadorCarroProprio !== undefined && { multiplicadorCarroProprio: Number(body.multiplicadorCarroProprio) }),
        ...(body.horasMaximasPorDia !== undefined && { horasMaximasPorDia: Math.max(1, Math.min(12, Number(body.horasMaximasPorDia))) }),
        ...(body.moeda !== undefined && { moeda: String(body.moeda).trim() || 'BRL' }),
        ...(body.precoGasolinaCents !== undefined && { precoGasolinaCents: Number(body.precoGasolinaCents) }),
        ...(body.consumoKmPorLitro !== undefined && { consumoKmPorLitro: Number(body.consumoKmPorLitro) }),
        ...(body.custoPorKmCents !== undefined && { custoPorKmCents: Math.max(0, Number(body.custoPorKmCents)) }),
      },
      create: {
        id: 'default',
        alimentacaoEconomicaCents: Number(body.alimentacaoEconomicaCents) ?? 5000,
        alimentacaoPadraoCents: Number(body.alimentacaoPadraoCents) ?? 12000,
        alimentacaoConfortoCents: Number(body.alimentacaoConfortoCents) ?? 20000,
        multiplicadorUber: Number(body.multiplicadorUber) ?? 1,
        multiplicadorTransfer: Number(body.multiplicadorTransfer) ?? 1.5,
        multiplicadorCarroProprio: Number(body.multiplicadorCarroProprio) ?? 0.3,
        horasMaximasPorDia: Math.min(12, Math.max(1, Number(body.horasMaximasPorDia) ?? 8)),
        moeda: String(body.moeda || 'BRL').trim(),
        precoGasolinaCents: Number(body.precoGasolinaCents) ?? 590,
        consumoKmPorLitro: Number(body.consumoKmPorLitro) ?? 10,
        custoPorKmCents: Math.max(0, Number(body.custoPorKmCents) ?? 0),
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(config)
  } catch (e) {
    console.error('Erro ao atualizar config planejador:', e)
    return NextResponse.json({ message: 'Erro ao atualizar configurações' }, { status: 500 })
  }
}
