import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const body = await request.json()
    const { title, lead, body: bodyHtml } = body as {
      title?: string
      lead?: string
      body?: string
    }

    const existing = await prisma.pendingrelease.findUnique({
      where: { id },
    })
    if (!existing || existing.status !== 'PENDING') {
      return NextResponse.json({ message: 'Pendente não encontrado ou já publicado' }, { status: 404 })
    }

    const data: { title?: string; lead?: string | null; body?: string } = {}
    if (title !== undefined) data.title = String(title).trim()
    if (lead !== undefined) data.lead = lead === '' ? null : String(lead).trim()
    if (bodyHtml !== undefined) data.body = String(bodyHtml).trim()

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
