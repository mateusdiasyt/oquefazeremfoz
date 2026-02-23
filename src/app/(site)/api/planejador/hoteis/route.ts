import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export const dynamic = 'force-dynamic'

/** GET - Lista hotéis ativos para o seletor (carro próprio). Público. */
export async function GET() {
  try {
    const hoteis = await prisma.hotel.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      select: { id: true, nome: true, endereco: true },
    })
    return NextResponse.json(hoteis)
  } catch (e) {
    console.error('Erro ao listar hotéis:', e)
    return NextResponse.json({ error: 'Erro ao carregar hotéis' }, { status: 500 })
  }
}
