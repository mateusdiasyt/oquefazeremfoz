import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { calcFeeCents } from '../../../../../lib/pricing'

export async function POST(req: Request) {
  const { productId, qty = 1 } = await req.json()
  const p = await prisma.product.findUnique({ where: { id: productId } })
  if (!p) return NextResponse.json({ error: 'product not found' }, { status: 404 })

  const subtotal = p.priceCents * qty
  const fee = calcFeeCents(subtotal)
  const total = subtotal + fee

  const order = await prisma.order.create({
    data: {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      productId: p.id,
      qty,
      subtotalCts: subtotal,
      feeCts: fee,
      totalCts: total,
      status: 'PAID', // placeholder: marcar como pago por enquanto
    },
  })

  return NextResponse.json(order)
}
