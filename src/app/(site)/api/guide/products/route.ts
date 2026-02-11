import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isGuide, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Listar produtos do guia (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get('guideId')
    if (!guideId) {
      return NextResponse.json({ message: 'guideId é obrigatório' }, { status: 400 })
    }
    const products = await prisma.guideproduct.findMany({
      where: { guideId, isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao listar produtos do guia:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar produto (dono do guia)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }
    const body = await request.json()
    const { guideId, name, description, priceCents, currency = 'BRL', imageUrl } = body
    if (!guideId || !name || priceCents == null || priceCents < 0) {
      return NextResponse.json(
        { message: 'guideId, name e priceCents (valor em centavos) são obrigatórios' },
        { status: 400 }
      )
    }
    const guide = await prisma.guide.findFirst({
      where: { id: guideId, userId: user.id },
    })
    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado ou acesso negado' }, { status: 403 })
    }
    const id = `guideproduct_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const product = await prisma.guideproduct.create({
      data: {
        id,
        guideId,
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        priceCents: Number(priceCents),
        currency: String(currency),
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto do guia:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
