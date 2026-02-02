import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

// PUT - Atualizar vídeo FozTV
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, isPublished, order } = body

    const existing = await prisma.foztvvideo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Vídeo não encontrado' }, { status: 404 })
    }

    const video = await prisma.foztvvideo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl.trim() }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl: thumbnailUrl?.trim() || null }),
        ...(isPublished !== undefined && { isPublished: !!isPublished }),
        ...(typeof order === 'number' && { order }),
        ...(isPublished && !existing.publishedAt && { publishedAt: new Date() }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Erro ao atualizar vídeo FozTV:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Deletar vídeo FozTV
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    await prisma.foztvvideo.delete({ where: { id } })
    return NextResponse.json({ message: 'Vídeo removido' })
  } catch (error) {
    console.error('Erro ao deletar vídeo FozTV:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
