import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!['TOURIST', 'COMPANY', 'ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Role inválido' }, { status: 400 })
    }

    // Remover roles existentes e adicionar o novo
    await prisma.userrole.deleteMany({
      where: { userId: user.id }
    })

    await prisma.userrole.create({
      data: {
        id: `userrole_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: user.id,
        role: role as 'TOURIST' | 'COMPANY' | 'ADMIN'
      }
    })

    // Buscar usuário atualizado
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userrole: true
      }
    })

    return NextResponse.json({ 
      message: 'Role atualizado com sucesso',
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        roles: updatedUser?.userrole.map(ur => ur.role) || []
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar role:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
