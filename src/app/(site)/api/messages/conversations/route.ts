import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar empresas que o usuário está seguindo
    const followedBusinesses = await prisma.follow.findMany({
      where: {
        followerId: user.id
      },
      include: {
        following: {
          include: {
            business: true
          }
        }
      }
    })

    console.log('🏢 Empresas seguidas:', followedBusinesses.length)

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
          include: {
            business: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              include: {
                business: true
              }
            },
            receiver: {
              include: {
                business: true
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

    // Adicionar conversas existentes
    for (const conv of existingConversations) {
      const otherParticipant = conv.user.find(p => p.id !== user.id)
      const lastMessage = conv.messages[0]

      allConversations.push({
        id: conv.id,
        business: otherParticipant?.business ? {
          id: otherParticipant.business.id,
          name: otherParticipant.business.name,
          slug: otherParticipant.business.slug,
          profileImage: otherParticipant.business.profileImage,
          isVerified: otherParticipant.business.isVerified,
          category: otherParticipant.business.category,
          followedAt: new Date().toISOString(),
          userId: otherParticipant.id
        } : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sender: {
            id: lastMessage.sender.id,
            name: lastMessage.sender.name || lastMessage.sender.email,
            business: lastMessage.sender.business ? {
              id: lastMessage.sender.business.id,
              name: lastMessage.sender.business.name,
              profileImage: lastMessage.sender.business.profileImage
            } : undefined
          },
          receiver: {
            id: lastMessage.receiver?.id,
            name: lastMessage.receiver?.name || lastMessage.receiver?.email,
            business: lastMessage.receiver?.business ? {
              id: lastMessage.receiver?.business.id,
              name: lastMessage.receiver?.business.name,
              profileImage: lastMessage.receiver?.business.profileImage
            } : undefined
          },
          createdAt: lastMessage.createdAt.toISOString(),
          isRead: lastMessage.isRead
        } : null,
        updatedAt: conv.updatedAt.toISOString()
      })
    }

    // Adicionar empresas seguidas que não têm conversas ainda
    for (const follow of followedBusinesses) {
      const business = follow.following.business
      if (business) {
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
              followedAt: follow.createdAt.toISOString(),
              userId: follow.following.id
            },
            lastMessage: null,
            updatedAt: follow.createdAt.toISOString()
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
