import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// POST - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { receiverId, content } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    }

    if (receiverId === user.id) {
      return NextResponse.json({ message: 'Você não pode enviar mensagem para si mesmo' }, { status: 400 })
    }

    // Verificar se o destinatário existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ message: 'Destinatário não encontrado' }, { status: 404 })
    }

    // Buscar ou criar conversa entre os usuários
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            user: {
              some: { id: user.id }
            }
          },
          {
            user: {
              some: { id: receiverId }
            }
          }
        ]
      },
      include: {
        user: true
      }
    })

    // Se não existe conversa, criar uma nova
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: `conversation_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          updatedAt: new Date(),
          user: {
            connect: [
              { id: user.id },
              { id: receiverId }
            ]
          }
        },
        include: {
          user: true
        }
      })
    }

    // Criar a mensagem
    const message = await prisma.message.create({
      data: {
        id: `message_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        conversationId: conversation.id,
        senderId: user.id,
        receiverId: receiverId,
        content: content.trim()
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
                profileImage: true,
                isVerified: true
              },
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
              select: {
                id: true,
                name: true,
                profileImage: true,
                isVerified: true
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

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

    // Formatar mensagem
    const formattedMessage = {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: {
        id: message.user_message_senderIdTouser.id,
        name: senderActiveBusiness?.name || message.user_message_senderIdTouser.name || 'Usuário',
        profileImage: senderActiveBusiness?.profileImage,
        isVerified: senderActiveBusiness?.isVerified || false
      },
      receiver: {
        id: message.user_message_receiverIdTouser?.id,
        name: receiverActiveBusiness?.name || message.user_message_receiverIdTouser?.name || 'Usuário',
        profileImage: receiverActiveBusiness?.profileImage,
        isVerified: receiverActiveBusiness?.isVerified || false
      }
    }

    return NextResponse.json({ 
      message: 'Mensagem enviada com sucesso!',
      data: formattedMessage
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}





