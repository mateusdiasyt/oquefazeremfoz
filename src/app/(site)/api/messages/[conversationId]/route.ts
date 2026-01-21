import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log('📨 GET /api/messages/[conversationId] - Iniciando')
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { conversationId } = params
    console.log('🔍 Buscando mensagens para conversa:', conversationId)

    // Se é um ID temporário, retornar mensagens vazias
    if (conversationId.startsWith('temp-')) {
      console.log('⏭️ ID temporário, retornando array vazio')
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    // Verificar se o usuário participa da conversa
    console.log('🔍 Verificando se conversa existe:', conversationId)
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

    console.log('💬 Conversa encontrada:', conversation ? 'Sim' : 'Não')
    if (conversation) {
      console.log('👥 Participantes da conversa:', conversation.user?.length || 0)
    }

    if (!conversation) {
      console.log('❌ Conversa não encontrada para o usuário')
      return NextResponse.json({ message: 'Conversa não encontrada' }, { status: 404 })
    }

    // Buscar mensagens da conversa
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      include: {
        user_message_senderIdTouser: {
          include: {
            business: true
          }
        },
        user_message_receiverIdTouser: {
          include: {
            business: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Marcar mensagens como lidas
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

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
          name: message.user_message_receiverIdTouser.business.name,
          profileImage: message.user_message_receiverIdTouser.business.profileImage
        } : undefined
      },
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead
    }))

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
    
    console.log('📝 Dados recebidos:', { conversationId, content, receiverId, userId: user.id })

    if (!content || !receiverId) {
      console.log('❌ Dados obrigatórios faltando')
      return NextResponse.json({ message: 'Conteúdo e destinatário são obrigatórios' }, { status: 400 })
    }

    let conversation

    // Se é um ID temporário, criar uma conversa real
    if (conversationId.startsWith('temp-')) {
      console.log('🔄 Processando ID temporário:', conversationId)
      const businessId = conversationId.replace('temp-', '')
      console.log('🏢 Business ID extraído:', businessId)
      
      // Buscar o usuário da empresa
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { user: true }
      })

      console.log('🏢 Business encontrado:', business ? 'Sim' : 'Não')
      if (business) {
        console.log('👤 Business user ID:', business.user.id)
      }

      if (!business) {
        console.log('❌ Empresa não encontrada')
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
        console.log('✅ Conversa existente encontrada:', existingConversation.id)
        conversation = existingConversation
      } else {
        console.log('🆕 Criando nova conversa entre usuários:', user.id, 'e', business.user.id)
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
        console.log('✅ Nova conversa criada:', conversation.id)
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
          include: {
            business: true
          }
        },
        user_message_receiverIdTouser: {
          include: {
            business: true
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

    // Transformar dados para o formato esperado pelo componente
    const formattedMessage = {
      id: message.id,
      conversationId: conversation.id, // Adicionar ID da conversa
      content: message.content,
      sender: {
        id: message.user_message_senderIdTouser.id,
        name: message.user_message_senderIdTouser.name || message.user_message_senderIdTouser.email,
        business: message.user_message_senderIdTouser.business ? {
          id: message.user_message_senderIdTouser.business.id,
          name: message.user_message_senderIdTouser.business.name,
          profileImage: message.user_message_senderIdTouser.business.profileImage
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