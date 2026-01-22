import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const user = await getCurrentUser()

    const guide = await prisma.guide.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
    }

    // Verificar se está aprovado
    if (!guide.isApproved) {
      // Apenas o dono pode ver se não estiver aprovado
      if (!user || guide.userId !== user.id) {
        return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
      }
    }

    // Verificar se o usuário está seguindo o guia (se estiver logado)
    let isFollowing = false
    if (user && guide.id) {
      // TODO: Implementar sistema de follow para guias
      // Por enquanto, retornar false
    }

    return NextResponse.json({
      ...guide,
      isFollowing
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
