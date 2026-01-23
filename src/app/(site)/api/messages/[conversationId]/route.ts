import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { conversationId } = params

    // Se é um ID temporário, retornar mensagens vazias
    if (conversationId.startsWith('temp-')) {
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    // Verificar se o usuário participa da conversa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        user: {
          some: {
            id: user.id
          }
        }
      },
      include: {
        user: true
      }
    })

    if (!conversation) {
      return NextResponse.json({ message: 'Conversa não encontrada' }, { status: 404 })
    }

    // ✅ CORREÇÃO: Buscar mensagens e marcar como lidas em paralelo
    const [messages] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId
        },
        include: {
          user_message_senderIdTouser: {
            select: {
              id: true,
              name: true,
              email: true,
              activeBusinessId: true,
              business: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true
                },
                orderBy: { createdAt: 'desc' },
                take: 1 // ✅ Apenas empresa ativa
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
                select: {
                  id: true,
                  name: true,
                  profileImage: true
                },
                orderBy: { createdAt: 'desc' },
                take: 1 // ✅ Apenas empresa ativa
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      // ✅ Marcar como lidas de forma assíncrona (não bloqueia resposta)
      prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      }).catch(err => {
        console.error('Erro ao marcar mensagens como lidas:', err)
        return { count: 0 }
      })
    ])

    // Transformar dados para o formato esperado pelo componente
    const formattedMessages = messages.map(message => {
      // Buscar empresa ativa do remetente
      const senderActiveBusiness = message.user_message_senderIdTouser.activeBusinessId 
        ? message.user_message_senderIdTouser.business.find(b => b.id === message.user_message_senderIdTouser.activeBusinessId)
        : message.user_message_senderIdTouser.business[0]
      
      // Buscar empresa ativa do receptor
      const receiverActiveBusiness = message.user_message_receiverIdTouser?.activeBusinessId 
        ? message.user_message_receiverIdTouser.business?.find(b => b.id === message.user_message_receiverIdTouser.activeBusinessId)
        : message.user_message_receiverIdTouser?.business?.[0]

      return {
        id: message.id,
        content: message.content,
        sender: {
          id: message.user_message_senderIdTouser.id,
          name: message.user_message_senderIdTouser.name || message.user_message_senderIdTouser.email,
          business: senderActiveBusiness ? {
            id: senderActiveBusiness.id,
            name: senderActiveBusiness.name,
            profileImage: senderActiveBusiness.profileImage
          } : undefined
        },
        receiver: {
          id: message.user_message_receiverIdTouser?.id,
          name: message.user_message_receiverIdTouser?.name || message.user_message_receiverIdTouser?.email,
          business: receiverActiveBusiness ? {
            id: receiverActiveBusiness.id,
            name: receiverActiveBusiness.name,
            profileImage: receiverActiveBusiness.profileImage
          } : undefined
        },
        createdAt: message.createdAt.toISOString(),
        isRead: message.isRead
      }
    })

    return NextResponse.json({ messages: formattedMessages }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log('📨 POST /api/messages/[conversationId] - Iniciando')
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { conversationId } = params
    const { content, receiverId } = await request.json()

    if (!content || !receiverId) {
      return NextResponse.json({ message: 'Conteúdo e destinatário são obrigatórios' }, { status: 400 })
    }

    let conversation

    // Se é um ID temporário, criar uma conversa real
    if (conversationId.startsWith('temp-')) {
      const businessId = conversationId.replace('temp-', '')
      
      // Buscar o usuário da empresa
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true }
      })

      if (!business) {
        return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
      }

      // Verificar se já existe uma conversa entre estes usuários
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          user: {
            every: {
              id: {
                in: [user.id, business.user.id]
              }
            }
          }
        }
      })

      if (existingConversation) {
        conversation = existingConversation
      } else {
        // Criar nova conversa
        conversation = await prisma.conversation.create({
          data: {
            id: `conversation_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            updatedAt: new Date(),
            user: {
              connect: [
                { id: user.id },
                { id: business.user.id }
              ]
            }
          }
        })
      }
    } else {
      // Verificar se o usuário participa da conversa existente
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          user: {
            some: {
              id: user.id
            }
          }
        }
      })

      if (!conversation) {
        return NextResponse.json({ message: 'Conversa não encontrada' }, { status: 404 })
      }
    }

    // Criar mensagem
    console.log('💬 Criando mensagem:', {
      conversationId: conversation.id,
      senderId: user.id,
      receiverId,
      content
    })
    
    const message = await prisma.message.create({
      data: {
        id: `message_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        conversationId: conversation.id,
        senderId: user.id,
        receiverId,
        content
      },
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
    })
    
    console.log('✅ Mensagem criada com sucesso:', message.id)

    // Atualizar timestamp da conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    })

    // Buscar empresa ativa do remetente
    const senderActiveBusiness = message.user_message_senderIdTouser.activeBusinessId 
      ? message.user_message_senderIdTouser.business.find(b => b.id === message.user_message_senderIdTouser.activeBusinessId)
      : message.user_message_senderIdTouser.business[0]
    
    // Buscar empresa ativa do receptor
    const receiverActiveBusiness = message.user_message_receiverIdTouser?.activeBusinessId 
      ? message.user_message_receiverIdTouser.business?.find(b => b.id === message.user_message_receiverIdTouser.activeBusinessId)
      : message.user_message_receiverIdTouser?.business?.[0]

    // Transformar dados para o formato esperado pelo componente
    const formattedMessage = {
      id: message.id,
      conversationId: conversation.id, // Adicionar ID da conversa
      content: message.content,
      sender: {
        id: message.user_message_senderIdTouser.id,
        name: message.user_message_senderIdTouser.name || message.user_message_senderIdTouser.email,
        business: senderActiveBusiness ? {
          id: senderActiveBusiness.id,
          name: senderActiveBusiness.name,
          profileImage: senderActiveBusiness.profileImage
        } : undefined
      },
        receiver: {
          id: message.user_message_receiverIdTouser?.id,
          name: message.user_message_receiverIdTouser?.name || message.user_message_receiverIdTouser?.email,
          business: receiverActiveBusiness ? {
            id: receiverActiveBusiness.id,
            name: receiverActiveBusiness.name,
            profileImage: receiverActiveBusiness.profileImage
          } : undefined
        },
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead
    }

    console.log('📤 Retornando mensagem formatada:', { 
      messageId: formattedMessage.id, 
      conversationId: formattedMessage.conversationId 
    })

    return NextResponse.json({ message: formattedMessage }, { status: 201 })

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}