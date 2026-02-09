import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.pendingrelease.findUnique({
      where: { id },
    })
    if (!existing || existing.status !== 'PENDING') {
      return NextResponse.json({ message: 'Pendente não encontrado ou já publicado' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type') || ''
    let title: string | undefined
    let lead: string | undefined
    let bodyHtml: string | undefined
    let featuredImage: File | null = null
    let scheduledAt: string | null | undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      title = formData.get('title') as string
      lead = formData.get('lead') as string
      bodyHtml = formData.get('body') as string
      featuredImage = formData.get('featuredImage') as File
      const sa = formData.get('scheduledAt')
      scheduledAt = sa === '' || sa === null ? null : (sa as string)
    } else {
      const body = await request.json()
      title = body.title
      lead = body.lead
      bodyHtml = body.body
      scheduledAt = body.scheduledAt
    }

    const data: { title?: string; lead?: string | null; body?: string; featuredImageUrl?: string | null; scheduledAt?: Date | null } = {}
    if (title !== undefined) data.title = String(title).trim()
    if (lead !== undefined) data.lead = lead === '' ? null : String(lead).trim()
    if (bodyHtml !== undefined) data.body = String(bodyHtml).trim()
    if (scheduledAt !== undefined) {
      data.scheduledAt = scheduledAt === null || scheduledAt === '' ? null : new Date(scheduledAt)
    }

    if (featuredImage && featuredImage.size > 0) {
      if (!featuredImage.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
      }
      if (featuredImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'Imagem muito grande. Máximo 5MB' }, { status: 400 })
      }
      const bytes = await featuredImage.arrayBuffer()
      const ext = featuredImage.name.split('.').pop() || 'jpg'
      const blob = await put(
        `admin/pending/${id}/${Date.now()}.${ext}`,
        bytes,
        { access: 'public', contentType: featuredImage.type }
      )
      data.featuredImageUrl = blob.url
    }

    const updated = await prisma.pendingrelease.update({
      where: { id },
      data,
    })

    return NextResponse.json({ message: 'Atualizado', pending: updated })
  } catch (error) {
    console.error('Erro ao atualizar pendente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.pendingrelease.findUnique({
      where: { id },
    })
    if (!existing || existing.status !== 'PENDING') {
      return NextResponse.json({ message: 'Pendente não encontrado ou já publicado' }, { status: 404 })
    }

    await prisma.pendingrelease.delete({ where: { id } })
    return NextResponse.json({ message: 'Removido' })
  } catch (error) {
    console.error('Erro ao remover pendente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
