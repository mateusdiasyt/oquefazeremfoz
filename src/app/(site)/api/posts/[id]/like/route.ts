import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'

// POST - Curtir/descurtir post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 POST /api/posts/[id]/like - Iniciando')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não')
    
    if (!user) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id
    console.log('📝 Post ID:', postId)

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })
    console.log('📝 Post encontrado:', post ? 'Sim' : 'Não')

    if (!post) {
      console.log('❌ Post não encontrado')
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    // Determinar se é empresa e qual empresa usar para curtir
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId
    
    let existingLike = null
    
    if (isCompanyUser && activeBusinessId) {
      // Se for empresa, verificar se a empresa já curtiu
      existingLike = await prisma.postlike.findFirst({
        where: {
          businessId: activeBusinessId,
          postId: postId
        }
      })
      console.log('❤️ Like existente (como empresa):', existingLike ? 'Sim' : 'Não')
    } else {
      // Se for usuário normal, verificar se o usuário curtiu
      existingLike = await prisma.postlike.findFirst({
        where: {
          userId: user.id,
          postId: postId
        }
      })
      console.log('❤️ Like existente (como usuário):', existingLike ? 'Sim' : 'Não')
    }

    if (existingLike) {
      console.log('🗑️ Descurtindo post...')
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

      console.log('✅ Post descurtido, likes:', updatedPost.likes)
      return NextResponse.json({ 
        message: 'Post descurtido',
        liked: false,
        likesCount: updatedPost.likes
      })
    } else {
      console.log('➕ Curtindo post...')
      // Curtir - adicionar o like como empresa ou usuário
      const likeData: any = {
        id: `postlike_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        postId: postId
      }
      
      if (isCompanyUser && activeBusinessId) {
        likeData.businessId = activeBusinessId
        console.log('👍 Curtindo como empresa:', activeBusinessId)
      } else {
        likeData.userId = user.id
        console.log('👍 Curtindo como usuário:', user.id)
      }
      
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

      console.log('✅ Post curtido, likes:', updatedPost.likes)
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
    const isCompanyUser = user.roles?.includes('COMPANY')
    const activeBusinessId = user.activeBusinessId || user.businessId
    
    let existingLike = null
    
    if (isCompanyUser && activeBusinessId) {
      // Verificar se a empresa curtiu
      existingLike = await prisma.postlike.findFirst({
        where: {
          businessId: activeBusinessId,
          postId: postId
        }
      })
    } else {
      // Verificar se o usuário curtiu
      existingLike = await prisma.postlike.findFirst({
        where: {
          userId: user.id,
          postId: postId
        }
      })
    }

    return NextResponse.json({ 
      liked: !!existingLike,
      likedAsBusiness: isCompanyUser && !!activeBusinessId
    })

  } catch (error) {
    console.error('Erro ao verificar like:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
