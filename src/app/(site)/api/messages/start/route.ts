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
            user: {
              some: {
                id: user.id
              }
            }
          },
          {
            user: {
              some: {
                id: business.userId
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            activeBusinessId: true,
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                isVerified: true,
                category: true
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    // Se não existe, criar nova conversa
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: `conversation_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          updatedAt: new Date(),
          user: {
            connect: [
              { id: user.id },
              { id: business.userId }
            ]
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              activeBusinessId: true,
              business: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  profileImage: true,
                  isVerified: true,
                  category: true
                },
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      })
    }

    // Transformar dados para o formato esperado pelo componente
    const otherParticipant = conversation.user.find(p => p.id !== user.id)
    
    // Buscar empresa ativa do outro participante
    const otherParticipantActiveBusiness = otherParticipant?.activeBusinessId 
      ? otherParticipant.business.find(b => b.id === otherParticipant.activeBusinessId)
      : otherParticipant?.business[0]
    
    const formattedConversation = {
      id: conversation.id,
      business: otherParticipantActiveBusiness && otherParticipant ? {
        id: otherParticipantActiveBusiness.id,
        name: otherParticipantActiveBusiness.name,
        slug: otherParticipantActiveBusiness.slug,
        profileImage: otherParticipantActiveBusiness.profileImage,
        isVerified: otherParticipantActiveBusiness.isVerified,
        category: otherParticipantActiveBusiness.category,
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
