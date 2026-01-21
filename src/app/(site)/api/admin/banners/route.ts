import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar banners
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ banners }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo banner
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { imageUrl, link, isActive, order } = await request.json()

    const banner = await prisma.banner.create({
      data: {
        id: `banner_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: '',
        subtitle: '',
        link: link || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ banner }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar banner:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
