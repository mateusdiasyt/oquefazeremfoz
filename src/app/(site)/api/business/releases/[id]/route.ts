import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { put } from '@vercel/blob'

// GET - Buscar release por ID (dono vê rascunhos)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const release = await prisma.businessrelease.findUnique({
      where: { id: params.id },
      include: { business: { select: { id: true, name: true, slug: true } } }
    })
    if (!release) return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })

    const user = await getCurrentUser()
    const isOwner = user && (user.businesses?.some((b: { id: string }) => b.id === release.businessId) ||
      user.activeBusinessId === release.businessId || user.businessId === release.businessId)

    if (!release.isPublished && !isOwner) {
      return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })
    }

    return NextResponse.json(release, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH - Atualizar release
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const release = await prisma.businessrelease.findUnique({
      where: { id: params.id },
      include: { business: true }
    })
    if (!release) return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })
    if (release.business.userId !== user.id && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') || ''
    let title: string | undefined
    let lead: string | undefined
    let body: string | undefined
    let isPublished: string | undefined
    let featuredImage: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      title = formData.get('title') as string
      lead = formData.get('lead') as string
      body = formData.get('body') as string
      isPublished = formData.get('isPublished') as string
      featuredImage = formData.get('featuredImage') as File
    } else {
      const json = await request.json()
      title = json.title
      lead = json.lead
      body = json.body
      isPublished = json.isPublished !== undefined ? String(json.isPublished) : undefined
    }

    const data: Record<string, unknown> = { updatedAt: new Date() }
    if (title !== undefined) data.title = title.trim()
    if (lead !== undefined) data.lead = lead?.trim() || null
    if (body !== undefined) data.body = body.trim()
    if (isPublished === 'true') {
      data.isPublished = true
      if (!release.publishedAt) data.publishedAt = new Date()
    } else if (isPublished === 'false') {
      data.isPublished = false
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
        `business/${release.businessId}/releases/${Date.now()}.${ext}`,
        bytes,
        { access: 'public', contentType: featuredImage.type }
      )
      data.featuredImageUrl = blob.url
    }

    const updated = await prisma.businessrelease.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json({ message: 'Release atualizada', release: updated }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir release
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const release = await prisma.businessrelease.findUnique({
      where: { id: params.id },
      include: { business: true }
    })
    if (!release) return NextResponse.json({ message: 'Release não encontrada' }, { status: 404 })
    if (release.business.userId !== user.id && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    await prisma.businessrelease.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Release excluída' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir release:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
