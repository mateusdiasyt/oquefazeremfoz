import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, guideId } = body

    let otherUserId: string
    let guide: { id: string; name: string; slug: string | null; profileImage: string | null; isVerified: boolean; userId: string } | null = null
    let business: { id: string; name: string; slug: string; profileImage: string | null; isVerified: boolean; category: string; userId: string } | null = null

    if (guideId) {
      const guideRow = await prisma.guide.findUnique({
        where: { id: guideId },
        select: { id: true, name: true, slug: true, profileImage: true, isVerified: true, userId: true },
      })
      if (!guideRow) {
        return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
      }
      otherUserId = guideRow.userId
      guide = { ...guideRow, userId: guideRow.userId }
    } else if (businessId) {
      const businessRow = await prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true },
      })
      if (!businessRow) {
        return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
      }
      otherUserId = businessRow.userId
      business = {
        id: businessRow.id,
        name: businessRow.name,
        slug: businessRow.slug,
        profileImage: businessRow.profileImage,
        isVerified: businessRow.isVerified,
        category: businessRow.category,
        userId: businessRow.userId,
      }
    } else {
      return NextResponse.json({ message: 'Informe businessId ou guideId' }, { status: 400 })
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { user: { some: { id: user.id } } },
          { user: { some: { id: otherUserId } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            activeBusinessId: true,
            business: {
              select: { id: true, name: true, slug: true, profileImage: true, isVerified: true, category: true },
              orderBy: { createdAt: 'desc' },
            },
            guide: {
              select: { id: true, name: true, slug: true, profileImage: true, isVerified: true },
            },
          },
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: `conversation_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          updatedAt: new Date(),
          user: { connect: [{ id: user.id }, { id: otherUserId }] },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              activeBusinessId: true,
              business: {
                select: { id: true, name: true, slug: true, profileImage: true, isVerified: true, category: true },
                orderBy: { createdAt: 'desc' },
              },
              guide: {
                select: { id: true, name: true, slug: true, profileImage: true, isVerified: true },
              },
            },
          },
        },
      })
    }

    const otherParticipant = conversation.user.find((p) => p.id !== user.id)
    const otherBusiness =
      otherParticipant?.activeBusinessId
        ? otherParticipant.business?.find((b) => b.id === otherParticipant.activeBusinessId)
        : otherParticipant?.business?.[0]
    const otherGuide = otherParticipant?.guide?.[0]

    const formattedConversation = {
      id: conversation.id,
      business:
        business || (otherBusiness && otherParticipant)
          ? {
              id: (business || otherBusiness)!.id,
              name: (business || otherBusiness)!.name,
              slug: (business || otherBusiness)!.slug ?? '',
              profileImage: (business || otherBusiness)!.profileImage,
              isVerified: (business || otherBusiness)!.isVerified,
              category: (business || otherBusiness)!.category ?? '',
              followedAt: new Date().toISOString(),
              userId: otherParticipant!.id,
            }
          : null,
      guide:
        guide || (otherGuide && otherParticipant)
          ? {
              id: (guide || otherGuide)!.id,
              name: (guide || otherGuide)!.name,
              slug: (guide || otherGuide)!.slug ?? '',
              profileImage: (guide || otherGuide)!.profileImage,
              isVerified: (guide || otherGuide)!.isVerified,
              userId: otherParticipant!.id,
            }
          : null,
      lastMessage: null,
      updatedAt: conversation.updatedAt.toISOString(),
    }

    return NextResponse.json({ conversation: formattedConversation }, { status: 200 })
  } catch (error) {
    console.error('Erro ao iniciar conversa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
