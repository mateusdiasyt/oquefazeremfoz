import { prisma } from '../../../../../lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      business: true,
      comment: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          comment: true
        }
      }
    },
    take: 20,
  })
  return NextResponse.json(posts)
}
