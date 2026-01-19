import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { isAdmin } from '../../../../../lib/cookies'
import { planSchema } from '../../../../../lib/validators'

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const plans = await prisma.plan.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = planSchema.parse(body)
  const plan = await prisma.plan.create({ data: parsed })
  return NextResponse.json(plan)
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = planSchema.parse(body)
  if (!parsed.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { id, ...data } = parsed
  const plan = await prisma.plan.update({ where: { id }, data })
  return NextResponse.json(plan)
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
