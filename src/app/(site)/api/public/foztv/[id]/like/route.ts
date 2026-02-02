import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../../lib/auth'
import { prisma } from '../../../../../../../lib/db'

// POST - Curtir/descurtir vídeo FozTV
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Faça login para curtir' }, { status: 401 })
    }

    const videoId = (await params).id

    const video = await prisma.foztvvideo.findUnique({
      where: { id: videoId, isPublished: true }
    })
    if (!video) {
      return NextResponse.json({ message: 'Vídeo não encontrado' }, { status: 404 })
    }

    const existing = await prisma.foztvvideolike.findUnique({
      where: {
        videoId_userId: { videoId, userId: user.id }
      }
    })

    if (existing) {
      await prisma.foztvvideolike.delete({
        where: { id: existing.id }
      })
      const count = await prisma.foztvvideolike.count({ where: { videoId } })
      return NextResponse.json({ liked: false, likeCount: count })
    }

    const likeId = `foztvlike_${Date.now()}_${Math.random().toString(36).substring(7)}`
    await prisma.foztvvideolike.create({
      data: {
        id: likeId,
        videoId,
        userId: user.id
      }
    })
    const count = await prisma.foztvvideolike.count({ where: { videoId } })
    return NextResponse.json({ liked: true, likeCount: count })
  } catch (error) {
    console.error('Erro ao curtir vídeo FozTV:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
