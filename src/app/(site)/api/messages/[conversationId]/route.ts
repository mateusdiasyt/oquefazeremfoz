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
        participants: {
          some: {
            id: user.id
          }
        }
      },
      include: {
        participants: true
      }
    })

    console.log('💬 Conversa encontrada:', conversation ? 'Sim' : 'Não')
    if (conversation) {
      console.log('👥 Participantes da conversa:', conversation.participants?.length || 0)
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
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      sender: {
        id: message.sender.id,
        name: message.sender.name || message.sender.email,
        business: message.sender.business ? {
          id: message.sender.business.id,
          name: message.sender.business.name,
          profileImage: message.sender.business.profileImage
        } : undefined
      },
      receiver: {
        id: message.receiver?.id,
        name: message.receiver?.name || message.receiver?.email,
        business: message.receiver?.business ? {
          id: message.receiver?.business.id,
          name: message.receiver?.business.name,
          profileImage: message.receiver?.business.profileImage
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
          participants: {
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
            participants: {
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
          participants: {
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
        conversationId: conversation.id,
        senderId: user.id,
        receiverId,
        content
      },
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
        id: message.sender.id,
        name: message.sender.name || message.sender.email,
        business: message.sender.business ? {
          id: message.sender.business.id,
          name: message.sender.business.name,
          profileImage: message.sender.business.profileImage
        } : undefined
      },
      receiver: {
        id: message.receiver?.id,
        name: message.receiver?.name || message.receiver?.email,
        business: message.receiver?.business ? {
          id: message.receiver?.business.id,
          name: message.receiver?.business.name,
          profileImage: message.receiver?.business.profileImage
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