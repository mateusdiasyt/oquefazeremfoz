import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

// PUT - Atualizar banner
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const bannerId = params.id
    const { title, subtitle, imageUrl, isActive, order } = await request.json()

    if (!title || !subtitle) {
      return NextResponse.json({ message: 'Título e subtítulo são obrigatórios' }, { status: 400 })
    }

    const banner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        title,
        subtitle,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ banner }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar banner:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar banner
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const bannerId = params.id

    await prisma.banner.delete({
      where: { id: bannerId }
    })

    return NextResponse.json({ message: 'Banner deletado com sucesso' }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar banner:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
