import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Erro ao buscar contagem de mensagens não lidas:', error)
    return NextResponse.json({ unreadCount: 0 })
  }
}
