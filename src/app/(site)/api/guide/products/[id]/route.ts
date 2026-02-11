import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isGuide, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH - Atualizar produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }
    const { id } = await params
    const product = await prisma.guideproduct.findUnique({ where: { id }, include: { guide: true } })
    if (!product || product.guide.userId !== user.id) {
      return NextResponse.json({ message: 'Produto não encontrado ou acesso negado' }, { status: 403 })
    }
    const body = await request.json()
    const { name, description, priceCents, currency, imageUrl, isActive, order } = body
    const updated = await prisma.guideproduct.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
        ...(priceCents !== undefined && { priceCents: Number(priceCents) }),
        ...(currency !== undefined && { currency: String(currency) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl).trim() : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(order !== undefined && { order: Number(order) }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar produto do guia:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Remover produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }
    const { id } = await params
    const product = await prisma.guideproduct.findUnique({ where: { id }, include: { guide: true } })
    if (!product || product.guide.userId !== user.id) {
      return NextResponse.json({ message: 'Produto não encontrado ou acesso negado' }, { status: 403 })
    }
    await prisma.guideproduct.delete({ where: { id } })
    return NextResponse.json({ message: 'Produto removido' })
  } catch (error) {
    console.error('Erro ao remover produto do guia:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
