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
            participants: {
              some: { id: user.id }
            }
          },
          {
            participants: {
              some: { id: receiverId }
            }
          }
        ]
      },
      include: {
        participants: true
      }
    })

    // Se não existe conversa, criar uma nova
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: user.id },
              { id: receiverId }
            ]
          }
        },
        include: {
          participants: true
        }
      })
    }

    // Criar a mensagem
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        receiverId: receiverId,
        content: content.trim()
      },
      include: {
        sender: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                isVerified: true
              }
            }
          }
        },
        receiver: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                isVerified: true
              }
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

    // Formatar mensagem
    const formattedMessage = {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.business?.name || message.sender.name || 'Usuário',
        profileImage: message.sender.business?.profileImage,
        isVerified: message.sender.business?.isVerified || false
      },
      receiver: {
        id: message.receiver?.id,
        name: message.receiver?.business?.name || message.receiver?.name || 'Usuário',
        profileImage: message.receiver?.business?.profileImage,
        isVerified: message.receiver?.business?.isVerified || false
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





