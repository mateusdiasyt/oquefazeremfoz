import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Verificar se o usuário curtiu o post do guia
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const guidePostId = (await params).id
    const existing = await prisma.guidepostlike.findFirst({
      where: { guidePostId, userId: user.id },
      select: { id: true }
    })
    return NextResponse.json({ liked: !!existing })
  } catch (error) {
    console.error('Erro ao verificar like do post do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Curtir/descurtir post do guia
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const guidePostId = (await params).id
    const post = await prisma.guidepost.findUnique({
      where: { id: guidePostId }
    })
    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    const existing = await prisma.guidepostlike.findFirst({
      where: { guidePostId, userId: user.id },
      select: { id: true }
    })

    if (existing) {
      await prisma.guidepostlike.delete({ where: { id: existing.id } })
      const updated = await prisma.guidepost.update({
        where: { id: guidePostId },
        data: { likes: { decrement: 1 } }
      })
      return NextResponse.json({ liked: false, likesCount: updated.likes })
    }

    const likeId = `guidepostlike_${Date.now()}_${Math.random().toString(36).substring(7)}`
    await prisma.guidepostlike.create({
      data: { id: likeId, guidePostId, userId: user.id }
    })
    const updated = await prisma.guidepost.update({
      where: { id: guidePostId },
      data: { likes: { increment: 1 } }
    })
    return NextResponse.json({ liked: true, likesCount: updated.likes })
  } catch (error) {
    console.error('Erro ao curtir/descurtir post do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
