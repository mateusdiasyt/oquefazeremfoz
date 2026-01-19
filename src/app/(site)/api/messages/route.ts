import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { businessId, content } = await request.json()

    if (!businessId || !content) {
      return NextResponse.json({ message: 'ID da empresa e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Buscar a empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário está seguindo a empresa
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: business.userId
      }
    })

    if (!follow) {
      return NextResponse.json({ message: 'Você precisa seguir a empresa para enviar mensagens' }, { status: 403 })
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        user: {
          every: {
            id: {
              in: [user.id, business.userId]
            }
          }
        }
      }
    })

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
        }
      })
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        id: `message_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        content,
        senderId: user.id,
        receiverId: business.userId,
        conversationId: conversation.id
      },
      include: {
        user_message_senderIdTouser: {
          select: {
            id: true,
            name: true,
            business: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        },
        user_message_receiverIdTouser: {
          select: {
            id: true,
            name: true,
            business: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ message: 'Mensagem enviada com sucesso', data: message })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Listar conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar conversas do usuário
    const conversations = await prisma.conversation.findMany({
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
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                isVerified: true,
                category: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            user_message_senderIdTouser: {
              select: {
                id: true,
                name: true,
                business: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true
                  }
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

    // Filtrar apenas conversas com empresas seguidas
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

    const followedBusinessIds = followedBusinesses.map(f => f.following.business?.id).filter(Boolean)

    const filteredConversations = conversations.filter(conv => {
      const otherParticipant = conv.user.find(p => p.id !== user.id)
      return otherParticipant?.business && followedBusinessIds.includes(otherParticipant.business.id)
    })

    return NextResponse.json({ conversations: filteredConversations })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
