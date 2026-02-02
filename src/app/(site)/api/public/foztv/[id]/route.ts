import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

export const dynamic = 'force-dynamic'

// GET - Detalhes do vídeo com likeCount e userLiked (para popup)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    const video = await prisma.foztvvideo.findUnique({
      where: { id, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        publishedAt: true,
        order: true,
        _count: { select: { foztvvideolike: true } }
      }
    })

    if (!video) {
      return NextResponse.json({ message: 'Vídeo não encontrado' }, { status: 404 })
    }

    let userLiked = false
    if (user) {
      const like = await prisma.foztvvideolike.findUnique({
        where: {
          videoId_userId: { videoId: id, userId: user.id }
        }
      })
      userLiked = !!like
    }

    const { _count, ...rest } = video
    const res = NextResponse.json({
      ...rest,
      likeCount: _count.foztvvideolike,
      userLiked
    })
    res.headers.set('Cache-Control', 'no-store, max-age=0')
    return res
  } catch (error) {
    console.error('Erro ao buscar vídeo FozTV:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
