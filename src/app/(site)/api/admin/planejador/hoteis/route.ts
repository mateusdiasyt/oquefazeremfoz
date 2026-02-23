import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

/** GET - Listar todos os hotéis (admin) */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const hoteis = await prisma.hotel.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
    return NextResponse.json(hoteis)
  } catch (e) {
    console.error('Erro ao listar hotéis:', e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

/** POST - Criar hotel (admin) */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const body = await request.json()
    const nome = String(body.nome || '').trim()
    const endereco = String(body.endereco || '').trim()
    if (!nome || !endereco) {
      return NextResponse.json({ message: 'Nome e endereço são obrigatórios' }, { status: 400 })
    }
    const maxOrdem = await prisma.hotel.aggregate({ _max: { ordem: true } })
    const ordem = Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : (maxOrdem._max.ordem ?? 0) + 1
    const hotel = await prisma.hotel.create({
      data: {
        nome,
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() || null : null,
        endereco,
        distanciaAeroportoKm: body.distanciaAeroportoKm != null ? Number(body.distanciaAeroportoKm) : null,
        ativo: body.ativo !== false,
        ordem,
      },
    })
    return NextResponse.json(hotel)
  } catch (e) {
    console.error('Erro ao criar hotel:', e)
    return NextResponse.json({ message: 'Erro ao criar hotel' }, { status: 500 })
  }
}
