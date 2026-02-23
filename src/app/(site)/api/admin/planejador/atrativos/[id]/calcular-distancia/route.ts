import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../../lib/auth'
import { prisma } from '../../../../../../../../lib/db'
import { calcularDistanciaDoAeroporto } from '../../../../../../../../lib/distanciaAeroporto'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/** POST - Calcula distância do aeroporto pelo endereço (Nominatim + OSRM) e salva no atrativo. Body opcional: { endereco: string }. */
export async function POST(
  request: NextRequest,
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
    let endereco: string
    try {
      const body = await request.json().catch(() => ({}))
      endereco = (body.endereco && String(body.endereco).trim()) || (atrativo as { endereco?: string | null }).endereco?.trim() || `${atrativo.nome}, Foz do Iguaçu, Brasil`
    } catch {
      endereco = (atrativo as { endereco?: string | null }).endereco?.trim() || `${atrativo.nome}, Foz do Iguaçu, Brasil`
    }
    const km = await calcularDistanciaDoAeroporto(endereco)
    if (km == null) {
      return NextResponse.json(
        {
          message:
            'Não foi possível calcular a distância para esse endereço. Preencha o campo "Endereço ou nome do lugar" com um endereço mais completo (ex.: "Rodovia das Cataratas, km 18, Foz do Iguaçu") e tente novamente.',
        },
        { status: 422 }
      )
    }
    await prisma.atrativo.update({
      where: { id },
      data: { distanciaAeroportoKm: km },
    })
    return NextResponse.json({ success: true, distanciaAeroportoKm: km })
  } catch (e) {
    console.error('Erro ao calcular distância:', e)
    return NextResponse.json(
      { message: 'Erro ao calcular distância. Tente novamente.' },
      { status: 500 }
    )
  }
}
