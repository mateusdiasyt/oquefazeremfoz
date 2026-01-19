import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { productSchema } from '../../../../../lib/validators'

export async function GET() {
  const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const data = productSchema.parse(await req.json())
  const item = await prisma.product.create({ data })
  return NextResponse.json(item)
}
