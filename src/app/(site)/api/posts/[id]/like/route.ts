import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

// POST - Curtir/descurtir post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    // Determinar se é empresa e qual empresa usar para curtir
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId
    
    let existingLike = null
    
    // Por enquanto, sempre verificar por userId até a migração ser executada
    // Após a migração, poderemos verificar por businessId também
    existingLike = await prisma.postlike.findFirst({
      where: {
        userId: user.id,
        postId: postId
      }
    })

    if (existingLike) {
      // Descurtir - remover o like
      await prisma.postlike.delete({
        where: {
          id: existingLike.id
        }
      })

      // Atualizar contador de likes
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Post descurtido',
        liked: false,
        likesCount: updatedPost.likes
      })
    } else {
      // Curtir - adicionar o like como empresa ou usuário
      const likeData: any = {
        id: `postlike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        postId: postId
      }
      
      // Por enquanto, sempre usar userId até a migração ser executada
      // Após a migração, poderemos usar businessId também
      likeData.userId = user.id
      await prisma.postlike.create({
        data: likeData
      })

      // Atualizar contador de likes
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Post curtido',
        liked: true,
        likesCount: updatedPost.likes,
        likedAsBusiness: isCompanyUser && !!activeBusinessId
      })
    }

  } catch (error) {
    console.error('Erro ao curtir/descurtir post:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se o usuário curtiu o post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id

    // Verificar se curtiu (como empresa ou usuário)
    // Por enquanto, sempre verificar por userId até a migração ser executada
    // Após a migração, poderemos verificar por businessId também
    const existingLike = await prisma.postlike.findFirst({
      where: {
        userId: user.id,
        postId: postId
      }
    })

    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId

    return NextResponse.json({ 
      liked: !!existingLike,
      likedAsBusiness: false // Sempre false até migração ser executada
    })

  } catch (error) {
    console.error('Erro ao verificar like:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
