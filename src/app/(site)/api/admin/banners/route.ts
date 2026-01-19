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

    const { title, subtitle, imageUrl, isActive, order } = await request.json()

    if (!title || !subtitle) {
      return NextResponse.json({ message: 'Título e subtítulo são obrigatórios' }, { status: 400 })
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0
      }
    })

    return NextResponse.json({ banner }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar banner:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
