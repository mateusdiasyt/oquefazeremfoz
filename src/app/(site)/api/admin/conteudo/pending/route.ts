import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { businessId, title, lead, body: bodyHtml } = body as {
      businessId?: string
      title?: string
      lead?: string
      body?: string
    }

    if (!businessId || !title || bodyHtml === undefined) {
      return NextResponse.json(
        { message: 'businessId, título e corpo são obrigatórios' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })
    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    const pending = await prisma.pendingrelease.create({
      data: {
        id: `pending_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId,
        title: title.trim(),
        lead: (lead && String(lead).trim()) || null,
        body: String(bodyHtml).trim(),
        featuredImageUrl: null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Conteúdo salvo como pendente. Revise em Gerenciar Conteúdo.',
      pending: {
        id: pending.id,
        title: pending.title,
        businessId: pending.businessId,
      },
    })
  } catch (error) {
    console.error('Erro ao salvar pendente:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
