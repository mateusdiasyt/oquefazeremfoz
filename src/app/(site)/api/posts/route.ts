import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { getCurrentUser } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const businessId = searchParams.get('businessId')
    const skip = (page - 1) * limit

    // Construir filtros condicionalmente
    const whereClause: any = {}
    if (businessId) {
      whereClause.businessId = businessId
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            slug: true
          }
        },
        _count: {
          select: {
            comment: true,
            postlike: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Transformar os dados para incluir contadores
    const transformedPosts = posts.map(post => ({
      ...post,
      comments: [],
      postLikes: [],
      commentsCount: post._count.comment,
      likesCount: post._count.postlike
    }))

    return NextResponse.json({ posts: transformedPosts }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/posts - Iniciando criação de post')
    
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem uma empresa
    if (!user.businessId) {
      console.log('❌ Usuário não possui empresa')
      return NextResponse.json({ message: 'Apenas empresas podem criar posts' }, { status: 403 })
    }

    const { title, body, imageUrl, videoUrl } = await request.json()
    console.log('📝 Dados recebidos:', { title, body: body?.substring(0, 50), imageUrl: !!imageUrl, videoUrl: !!videoUrl })

    // Validações
    if (!title || title.trim() === '') {
      console.log('❌ Título é obrigatório')
      return NextResponse.json({ message: 'Título é obrigatório' }, { status: 400 })
    }

    if (!body && !imageUrl && !videoUrl) {
      console.log('❌ Conteúdo, imagem ou vídeo é obrigatório')
      return NextResponse.json({ message: 'Conteúdo, imagem ou vídeo é obrigatório' }, { status: 400 })
    }

    // Gerar ID único para o post
    const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    console.log('🆔 ID do post gerado:', postId)

    // Criar o post
    console.log('➕ Criando post no banco de dados...')
    const post = await prisma.post.create({
      data: {
        id: postId,
        businessId: user.businessId,
        title: title.trim(),
        body: body?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            slug: true
          }
        },
        _count: {
          select: {
            comment: true,
            postlike: true
          }
        }
      }
    })

    console.log('✅ Post criado com sucesso:', post.id)

    // Transformar os dados para incluir contadores
    const transformedPost = {
      ...post,
      comments: [],
      postLikes: [],
      commentsCount: post._count.comment,
      likesCount: post._count.postlike
    }

    return NextResponse.json({ 
      message: 'Post criado com sucesso',
      post: transformedPost 
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
