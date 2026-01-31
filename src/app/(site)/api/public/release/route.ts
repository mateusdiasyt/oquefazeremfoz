import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export const dynamic = 'force-dynamic'

// GET - Buscar release por businessSlug + releaseSlug (página pública)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessSlug = searchParams.get('businessSlug')
    const releaseSlug = searchParams.get('releaseSlug')

    if (!businessSlug || !releaseSlug) {
      return NextResponse.json({ message: 'businessSlug e releaseSlug são obrigatórios' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { slug: businessSlug, isApproved: true },
      select: { id: true, name: true, slug: true, profileImage: true }
    })
    if (!business) return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })

    const release = await prisma.businessrelease.findUnique({
      where: {
        businessId_slug: { businessId: business.id, slug: releaseSlug }
      }
    })
    if (!release) return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })
    if (!release.isPublished) return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })

    return NextResponse.json({ ...release, business }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
