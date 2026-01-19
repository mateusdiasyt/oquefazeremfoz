import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { productSchema } from '../../../../../lib/validators'

export async function GET() {
  const items = await prisma.businessproduct.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const data = productSchema.parse(await req.json())
  const item = await prisma.businessproduct.create({ 
    data: {
      ...data,
      id: data.id || `businessproduct_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      updatedAt: new Date()
    }
  })
  return NextResponse.json(item)
}
