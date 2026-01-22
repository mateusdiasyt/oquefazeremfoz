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
    // Usar select para evitar erro quando businessId não existe no banco
    existingLike = await prisma.postlike.findFirst({
      where: {
        userId: user.id,
        postId: postId
      },
      select: {
        id: true,
        userId: true,
        postId: true
        // businessId não incluído até migração ser executada
      }
    })

    if (existingLike) {
      // Descurtir - remover o like usando SQL raw para evitar erro com businessId
      try {
        await prisma.$executeRaw`
          DELETE FROM "postlike" 
          WHERE id = ${existingLike.id}
        `
      } catch (rawError: any) {
        // Se der erro, tentar com Prisma normal (caso a coluna já exista)
        if (rawError.code === 'P2022' || rawError.message?.includes('businessId')) {
          await prisma.postlike.delete({
            where: {
              id: existingLike.id
            }
          })
        } else {
          throw rawError
        }
      }

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
      // Por enquanto, sempre usar userId até a migração ser executada
      // Após a migração, poderemos usar businessId também
      // Usar $queryRaw para evitar erro quando businessId não existe no banco
      const likeId = `postlike_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Verificar se a coluna businessId existe antes de tentar inserir
      try {
        // Tentar inserir usando SQL raw para evitar o Prisma tentar usar businessId
        await prisma.$executeRaw`
          INSERT INTO "postlike" (id, "postId", "userId")
          VALUES (${likeId}, ${postId}, ${user.id})
        `
      } catch (rawError: any) {
        // Se der erro, tentar com Prisma normal (caso a coluna já exista)
        if (rawError.code === 'P2022' || rawError.message?.includes('businessId')) {
          // Se o erro for sobre businessId, usar Prisma mas sem passar businessId
          await prisma.postlike.create({
            data: {
              id: likeId,
              postId: postId,
              userId: user.id
            }
          })
        } else {
          throw rawError
        }
      }

      // Buscar informações do post e do usuário para notificação
      const [updatedPost, postData, likerUser] = await Promise.all([
        prisma.post.update({
          where: { id: postId },
          data: {
            likes: {
              increment: 1
            }
          }
        }),
        prisma.post.findUnique({
          where: { id: postId },
          select: { businessId: true }
        }),
        prisma.user.findUnique({
          where: { id: user.id },
          select: { name: true, email: true }
        })
      ])

      // Criar notificação se o post pertence a uma empresa
      if (postData?.businessId) {
        const likerName = likerUser?.name || likerUser?.email || 'Alguém'
        notifyPostLike(postId, likerName, postData.businessId).catch(err => 
          console.error('Erro ao criar notificação de like:', err)
        )
      }

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
    // Usar select para evitar erro quando businessId não existe no banco
    const existingLike = await prisma.postlike.findFirst({
      where: {
        userId: user.id,
        postId: postId
      },
      select: {
        id: true,
        userId: true,
        postId: true
        // businessId não incluído até migração ser executada
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
