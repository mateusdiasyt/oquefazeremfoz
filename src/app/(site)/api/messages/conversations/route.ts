import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar empresas que o usuário está seguindo (usando businesslike)
    const businessLikes = await prisma.businesslike.findMany({
      where: {
        userId: user.id
      },
      include: {
        business: {
          include: {
            user: true
          }
        }
      }
    })

    console.log('🏢 Empresas seguidas:', businessLikes.length)

    // Buscar conversas existentes do usuário
    const existingConversations = await prisma.conversation.findMany({
      where: {
        user: {
          some: {
            id: user.id
          }
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
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        message: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            user_message_senderIdTouser: {
              select: {
                id: true,
                name: true,
                email: true,
                activeBusinessId: true,
                business: {
                  orderBy: { createdAt: 'desc' }
                }
              }
            },
            user_message_receiverIdTouser: {
              select: {
                id: true,
                name: true,
                email: true,
                activeBusinessId: true,
                business: {
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('🔍 Conversas existentes no banco:', existingConversations.length)

    // Criar lista de conversas com empresas seguidas
    const allConversations = []

    // ✅ CORREÇÃO N+1: Buscar todos os counts de uma vez
    const conversationIds = existingConversations.map(c => c.id)
    const unreadCounts = conversationIds.length > 0 ? await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        receiverId: user.id,
        isRead: false,
        conversationId: {
          in: conversationIds
        }
      },
      _count: {
        id: true
      }
    }) : []

    // Criar mapa para lookup O(1)
    const unreadCountMap = new Map(
      unreadCounts.map(item => [item.conversationId, item._count.id])
    )

    // Adicionar conversas existentes
    for (const conv of existingConversations) {
      const otherParticipant = conv.user.find(p => p.id !== user.id)
      const lastMessage = conv.message[0]

      // ✅ Usar mapa em vez de query individual
      const unreadCount = unreadCountMap.get(conv.id) || 0

      // Buscar empresa ativa do outro participante
      const otherParticipantActiveBusiness = otherParticipant?.activeBusinessId 
        ? otherParticipant.business.find(b => b.id === otherParticipant.activeBusinessId)
        : otherParticipant?.business[0]

      // Buscar empresa ativa do remetente da última mensagem
      const senderActiveBusiness = lastMessage?.user_message_senderIdTouser.activeBusinessId 
        ? lastMessage.user_message_senderIdTouser.business.find(b => b.id === lastMessage.user_message_senderIdTouser.activeBusinessId)
        : lastMessage?.user_message_senderIdTouser.business[0]

      // Buscar empresa ativa do receptor da última mensagem
      const receiverActiveBusiness = lastMessage?.user_message_receiverIdTouser?.activeBusinessId 
        ? lastMessage.user_message_receiverIdTouser.business?.find(b => b.id === lastMessage.user_message_receiverIdTouser.activeBusinessId)
        : lastMessage?.user_message_receiverIdTouser?.business?.[0]

      allConversations.push({
        id: conv.id,
        business: otherParticipantActiveBusiness && otherParticipant ? {
          id: otherParticipantActiveBusiness.id,
          name: otherParticipantActiveBusiness.name,
          slug: otherParticipantActiveBusiness.slug,
          profileImage: otherParticipantActiveBusiness.profileImage,
          isVerified: otherParticipantActiveBusiness.isVerified,
          category: otherParticipantActiveBusiness.category,
          followedAt: new Date().toISOString(),
          userId: otherParticipant.id
        } : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sender: {
            id: lastMessage.user_message_senderIdTouser.id,
            name: lastMessage.user_message_senderIdTouser.name || lastMessage.user_message_senderIdTouser.email,
            business: senderActiveBusiness ? {
              id: senderActiveBusiness.id,
              name: senderActiveBusiness.name,
              profileImage: senderActiveBusiness.profileImage
            } : undefined
          },
          receiver: {
            id: lastMessage.user_message_receiverIdTouser?.id,
            name: lastMessage.user_message_receiverIdTouser?.name || lastMessage.user_message_receiverIdTouser?.email,
            business: receiverActiveBusiness ? {
              id: receiverActiveBusiness.id,
              name: receiverActiveBusiness.name,
              profileImage: receiverActiveBusiness.profileImage
            } : undefined
          },
          createdAt: lastMessage.createdAt.toISOString(),
          isRead: lastMessage.isRead
        } : null,
        unreadCount,
        updatedAt: conv.updatedAt.toISOString()
      })
    }

    // Adicionar empresas seguidas que não têm conversas ainda
    for (const businessLike of businessLikes) {
      const business = businessLike.business
      if (business && business.user) {
        // Verificar se já existe conversa com esta empresa
        const hasConversation = allConversations.some(conv => 
          conv.business && conv.business.id === business.id
        )

        if (!hasConversation) {
          allConversations.push({
            id: `temp-${business.id}`, // ID temporário para empresas sem conversa
            business: {
              id: business.id,
              name: business.name,
              slug: business.slug,
              profileImage: business.profileImage,
              isVerified: business.isVerified,
              category: business.category,
              followedAt: businessLike.id, // Usando o ID do businesslike como referência temporal
              userId: business.user.id
            },
            lastMessage: null,
            unreadCount: 0, // Sem conversa = sem mensagens não lidas
            updatedAt: business.createdAt.toISOString()
          })
        }
      }
    }

    // Ordenar por data de atualização (mais recente primeiro)
    const formattedConversations = allConversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    console.log('📋 Conversas formatadas:', formattedConversations.length)

    return NextResponse.json({ conversations: formattedConversations }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
