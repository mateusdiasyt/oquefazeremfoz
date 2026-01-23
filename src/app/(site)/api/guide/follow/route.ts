import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// POST - Seguir/Deixar de seguir guia
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { guideId } = body

    if (!guideId) {
      return NextResponse.json({ message: 'ID do guia é obrigatório' }, { status: 400 })
    }

    // Verificar se o guia existe
    const guide = await prisma.guide.findUnique({
      where: { id: guideId }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
    }

    // Verificar se já está seguindo
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingGuideId: guideId
      }
    })

    if (existingFollow) {
      // Deixar de seguir
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })

      // Decrementar contador de seguidores
      await prisma.guide.update({
        where: { id: guideId },
        data: {
          followersCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Você deixou de seguir este guia',
        isFollowing: false
      }, { status: 200 })
    } else {
      // Seguir
      await prisma.follow.create({
        data: {
          id: `follow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          followerId: user.id,
          followingId: guide.userId, // ID do usuário dono do guia
          followingGuideId: guideId
        }
      })

      // Incrementar contador de seguidores
      await prisma.guide.update({
        where: { id: guideId },
        data: {
          followersCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Você está seguindo este guia',
        isFollowing: true
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Erro ao seguir/deixar de seguir guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se está seguindo
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const guideId = searchParams.get('guideId')

    if (!guideId) {
      return NextResponse.json({ message: 'ID do guia é obrigatório' }, { status: 400 })
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingGuideId: guideId
      }
    })

    return NextResponse.json({ 
      isFollowing: !!existingFollow
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao verificar follow:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
