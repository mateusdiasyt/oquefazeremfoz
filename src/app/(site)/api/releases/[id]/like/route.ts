import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Curtir/descurtir release
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const releaseId = (await params).id
    const release = await prisma.businessrelease.findUnique({
      where: { id: releaseId }
    })
    if (!release) {
      return NextResponse.json({ message: 'Release não encontrado' }, { status: 404 })
    }

    const existingLike = await prisma.releaselike.findFirst({
      where: {
        releaseId,
        userId: user.id
      },
      select: { id: true }
    })

    if (existingLike) {
      await prisma.releaselike.delete({
        where: { id: existingLike.id }
      })
      const updated = await prisma.businessrelease.update({
        where: { id: releaseId },
        data: { likes: { decrement: 1 } }
      })
      return NextResponse.json({
        message: 'Release descurtido',
        liked: false,
        likesCount: updated.likes
      })
    }

    const likeId = `releaselike_${Date.now()}_${Math.random().toString(36).substring(7)}`
    await prisma.releaselike.create({
      data: {
        id: likeId,
        releaseId,
        userId: user.id
      }
    })
    const updated = await prisma.businessrelease.update({
      where: { id: releaseId },
      data: { likes: { increment: 1 } }
    })
    return NextResponse.json({
      message: 'Release curtido',
      liked: true,
      likesCount: updated.likes
    })
  } catch (error) {
    console.error('Erro ao curtir/descurtir release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se o usuário curtiu o release
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const releaseId = (await params).id
    const existingLike = await prisma.releaselike.findFirst({
      where: { releaseId, userId: user.id },
      select: { id: true }
    })
    return NextResponse.json({ liked: !!existingLike })
  } catch (error) {
    console.error('Erro ao verificar like do release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
