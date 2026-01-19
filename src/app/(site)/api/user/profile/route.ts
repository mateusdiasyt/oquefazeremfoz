import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'

// PUT - Atualizar perfil do usuário
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name && !email) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (name) {
      updateData.name = name.trim()
    }
    
    if (email) {
      // Verificar se o email já existe
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim(),
          id: { not: user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ message: 'Este email já está em uso' }, { status: 400 })
      }
      
      updateData.email = email.trim()
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
