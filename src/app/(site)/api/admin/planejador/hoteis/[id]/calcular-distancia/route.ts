import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../../lib/auth'
import { prisma } from '../../../../../../../../lib/db'
import { calcularDistanciaDoAeroporto } from '../../../../../../../../lib/distanciaAeroporto'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/** POST - Calcula distância do aeroporto pelo endereço do hotel (Nominatim + OSRM) e salva. Body opcional: { endereco: string }. */
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
    const hotel = await prisma.hotel.findUnique({ where: { id } })
    if (!hotel) {
      return NextResponse.json({ message: 'Hotel não encontrado' }, { status: 404 })
    }
    let endereco: string
    try {
      const body = await request.json().catch(() => ({}))
      endereco = (body.endereco && String(body.endereco).trim()) || hotel.endereco?.trim() || `${hotel.nome}, Foz do Iguaçu, Brasil`
    } catch {
      endereco = hotel.endereco?.trim() || `${hotel.nome}, Foz do Iguaçu, Brasil`
    }
    const km = await calcularDistanciaDoAeroporto(endereco)
    if (km == null) {
      return NextResponse.json(
        {
          message:
            'Não foi possível calcular a distância para esse endereço. Preencha o endereço completo do hotel e tente novamente.',
        },
        { status: 422 }
      )
    }
    await prisma.hotel.update({
      where: { id },
      data: { distanciaAeroportoKm: km },
    })
    return NextResponse.json({ success: true, distanciaAeroportoKm: km })
  } catch (e) {
    console.error('Erro ao calcular distância do hotel:', e)
    return NextResponse.json(
      { message: 'Erro ao calcular distância. Tente novamente.' },
      { status: 500 }
    )
  }
}
