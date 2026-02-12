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

    const user = await getCurrentUser()
    const isCompanyUser = user?.roles?.includes('COMPANY')
    const activeBusinessId = user?.activeBusinessId || user?.businessId

    // Se não está filtrando por businessId específico, filtrar apenas empresas aprovadas
    // E garantir que são posts de empresas (não de guias)
    let whereClauseWithApproval: any = {}
    if (businessId) {
      // Filtrar por businessId específico e garantir que não é post de guia
      whereClauseWithApproval.businessId = businessId
      whereClauseWithApproval.guideId = null
    } else {
      // Buscar IDs das empresas aprovadas
      const approvedBusinesses = await prisma.business.findMany({
        where: { isApproved: true },
        select: { id: true }
      })
      const approvedBusinessIds = approvedBusinesses.map(b => b.id)
      
      if (approvedBusinessIds.length > 0) {
        whereClauseWithApproval.businessId = {
          in: approvedBusinessIds
        }
        // Garantir que não são posts de guias
        whereClauseWithApproval.guideId = null
      } else {
        // Sem empresas aprovadas: ainda retornar posts de guias na página 1
        if (page === 1) {
          const guidePostsRaw = await prisma.guidepost.findMany({
            where: { guide: { isApproved: true } },
            include: {
              guide: { select: { id: true, name: true, profileImage: true, isVerified: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
          })
          const guidePosts = guidePostsRaw.map((gp) => ({
            id: gp.id,
            title: gp.title,
            body: gp.body,
            imageUrl: gp.imageUrl,
            videoUrl: gp.videoUrl,
            likes: gp.likes,
            createdAt: gp.createdAt.toISOString(),
            guide: gp.guide,
            business: null,
            comments: [],
            postLikes: [],
            commentsCount: 0,
            likesCount: gp.likes,
            isLiked: false,
            isGuidePost: true
          }))
          return NextResponse.json({ posts: [], guidePosts }, { status: 200 })
        }
        return NextResponse.json({ posts: [], guidePosts: [] }, { status: 200 })
      }
    }

    const [posts, guidePostsRaw] = await Promise.all([
      prisma.post.findMany({
        where: whereClauseWithApproval,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              isVerified: true,
              slug: true,
              isApproved: true
            }
          },
          guide: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              isVerified: true,
              slug: true,
              isApproved: true
            }
          },
          postlike: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              comment: true,
              postlike: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      // Posts de guias aprovados (apenas primeira página do feed, sem release)
      page === 1
        ? prisma.guidepost.findMany({
            where: {
              guide: { isApproved: true }
            },
            include: {
              guide: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                  isVerified: true,
                  slug: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
          })
        : []
    ])

    // Transformar os dados para incluir contadores e verificar se curtiu
    const transformedPosts = posts.map(post => {
      // Verificar se o usuário atual curtiu
      let isLiked = false
      if (user) {
        // Por enquanto, verificar apenas por userId até a migração ser executada
        // Após a migração, poderemos verificar por businessId também
        isLiked = post.postlike.some(like => like.userId === user.id)
        // TODO: Após migração, adicionar verificação por businessId:
        // if (isCompanyUser && activeBusinessId) {
        //   isLiked = post.postlike.some(like => (like as any).businessId === activeBusinessId)
        // }
      }

      // Listar empresas que curtiram (será implementado após migração)
      const businessesLiked: any[] = []
      // TODO: Após migração, descomentar:
      // const businessesLiked = post.postlike
      //   .filter(like => (like as any).businessId && (like as any).business)
      //   .map(like => (like as any).business)
      //   .filter((b: any) => b !== null)

      return {
        ...post,
        comments: [],
        postLikes: [],
        commentsCount: post._count.comment,
        likesCount: post._count.postlike,
        isLiked,
        businessesLiked: businessesLiked
      }
    })

    // Formato para timeline: post de guia (sem comentários/curtir da tabela post)
    const guidePosts = guidePostsRaw.map((gp) => ({
      id: gp.id,
      title: gp.title,
      body: gp.body,
      imageUrl: gp.imageUrl,
      videoUrl: gp.videoUrl,
      likes: gp.likes,
      createdAt: gp.createdAt.toISOString(),
      guide: gp.guide,
      business: null,
      comments: [],
      postLikes: [],
      commentsCount: 0,
      likesCount: gp.likes,
      isLiked: false,
      isGuidePost: true
    }))

    return NextResponse.json({ posts: transformedPosts, guidePosts: guidePosts || [] }, { status: 200 })
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
    const activeBusinessId = user.activeBusinessId || user.businessId || user.businesses?.[0]?.id
    
    if (!activeBusinessId && !user.businesses?.length) {
      console.log('❌ Usuário não possui empresa')
      return NextResponse.json({ message: 'Apenas empresas podem criar posts' }, { status: 403 })
    }

    const { title, body, imageUrl, videoUrl, businessId: requestedBusinessId } = await request.json()
    console.log('📝 Dados recebidos:', { title, body: body?.substring(0, 50), imageUrl: !!imageUrl, videoUrl: !!videoUrl, requestedBusinessId })

    // Determinar qual empresa usar
    let finalBusinessId = requestedBusinessId || activeBusinessId
    
    // Se forneceu um businessId, verificar se pertence ao usuário
    if (requestedBusinessId) {
      const requestedBusiness = await prisma.business.findFirst({
        where: {
          id: requestedBusinessId,
          userId: user.id
        }
      })
      
      if (!requestedBusiness) {
        return NextResponse.json({ message: 'Empresa não encontrada ou não pertence a você' }, { status: 403 })
      }
      
      finalBusinessId = requestedBusinessId
    }

    if (!finalBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa selecionada' }, { status: 400 })
    }

    // Verificar se a empresa está aprovada
    const finalBusiness = await prisma.business.findFirst({
      where: {
        id: finalBusinessId,
        userId: user.id
      },
      select: {
        id: true,
        isApproved: true
      }
    })

    if (!finalBusiness) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    if (!finalBusiness.isApproved) {
      return NextResponse.json({ 
        message: 'Sua empresa está aguardando aprovação da administração. Você não pode publicar posts até que sua empresa seja aprovada.' 
      }, { status: 403 })
    }

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
        businessId: finalBusinessId,
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
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
