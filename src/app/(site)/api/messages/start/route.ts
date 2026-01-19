import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    // Buscar o usuário da empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: true
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se já existe uma conversa entre os usuários
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: user.id
              }
            }
          },
          {
            participants: {
              some: {
                id: business.userId
              }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            business: true
          }
        }
      }
    })

    // Se não existe, criar nova conversa
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: user.id },
              { id: business.userId }
            ]
          }
        },
        include: {
          participants: {
            include: {
              business: true
            }
          }
        }
      })
    }

    // Transformar dados para o formato esperado pelo componente
    const otherParticipant = conversation.participants.find(p => p.id !== user.id)
    
    const formattedConversation = {
      id: conversation.id,
      business: otherParticipant?.business ? {
        id: otherParticipant.business.id,
        name: otherParticipant.business.name,
        slug: otherParticipant.business.slug,
        profileImage: otherParticipant.business.profileImage,
        isVerified: otherParticipant.business.isVerified,
        category: otherParticipant.business.category,
        followedAt: new Date().toISOString(), // Placeholder
        userId: otherParticipant.id // Adicionar userId para envio de mensagens
      } : null,
      lastMessage: null,
      updatedAt: conversation.updatedAt.toISOString()
    }

    return NextResponse.json({ conversation: formattedConversation }, { status: 200 })

  } catch (error) {
    console.error('Erro ao iniciar conversa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
