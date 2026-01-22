import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Buscar empresas do usuário
    const userBusinesses = await prisma.business.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    const businessIds = userBusinesses.map(b => b.id)

    if (businessIds.length === 0) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    // Buscar notificações
    const where: any = {
      businessId: { in: businessIds }
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    // Contar não lidas
    const unreadCount = await prisma.notification.count({
      where: {
        businessId: { in: businessIds },
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Marcar notificações como lidas
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { notificationIds, markAllAsRead } = await request.json()

    // Buscar empresas do usuário
    const userBusinesses = await prisma.business.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    const businessIds = userBusinesses.map(b => b.id)

    if (businessIds.length === 0) {
      return NextResponse.json({ message: 'Nenhuma empresa encontrada' })
    }

    if (markAllAsRead) {
      // Marcar todas como lidas
      await prisma.notification.updateMany({
        where: {
          businessId: { in: businessIds },
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar notificações específicas como lidas
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          businessId: { in: businessIds } // Segurança: só marcar notificações das empresas do usuário
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ message: 'Notificações marcadas como lidas' })

  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
