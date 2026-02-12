import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET() {
  try {
    const count = await prisma.guide.count({
      where: { isApproved: true }
    })
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
