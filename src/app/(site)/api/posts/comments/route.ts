import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Buscar comentários de um post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ message: 'ID do post é obrigatório' }, { status: 400 })
    }

    const user = await getCurrentUser()
    
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, // Apenas comentários principais (sem parentId)
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            commentlike: true,
            replies: true
          }
        },
        commentlike: user ? {
          where: { userId: user.id },
          select: { id: true }
        } : false,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                commentlike: true
              }
            },
            commentlike: user ? {
              where: { userId: user.id },
              select: { id: true }
            } : false
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar comentário em um post
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/posts/comments - Iniciando')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não')
    
    if (!user) {
      console.log('❌ Usuário não autorizado')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { postId, content, parentId } = await request.json()
    console.log('📝 Dados recebidos:', { postId, parentId, content: content?.substring(0, 50) + '...' })

    if (!postId || !content?.trim()) {
      console.log('❌ Dados obrigatórios faltando:', { postId: !!postId, content: !!content?.trim() })
      return NextResponse.json({ message: 'ID do post e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Se parentId for fornecido, verificar se o comentário pai existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      })
      if (!parentComment) {
        return NextResponse.json({ message: 'Comentário pai não encontrado' }, { status: 404 })
      }
      // Se o comentário pai for uma resposta, usar o mesmo parentId para manter a estrutura
      const actualParentId = parentComment.parentId || parentId
      
      // Formatar o conteúdo com @ mencionando o usuário respondido
      const repliedUser = await prisma.user.findUnique({
        where: { id: parentComment.userId || '' },
        select: { name: true, email: true }
      })
      
      const mention = repliedUser?.name || repliedUser?.email?.split('@')[0] || 'usuário'
      const formattedContent = content.trim().startsWith('@') 
        ? content.trim() 
        : `@${mention} ${content.trim()}`
      
      const comment = await prisma.comment.create({
        data: {
          id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          postId,
          userId: user.id,
          parentId: actualParentId,
          body: formattedContent
        },
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

      return NextResponse.json({ 
        message: 'Resposta criada com sucesso!', 
        comment 
      }, { status: 201 })
    }

    // Verificar se o post existe
    console.log('🔍 Verificando se post existe:', postId)
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })
    console.log('📝 Post encontrado:', post ? 'Sim' : 'Não')

    if (!post) {
      console.log('❌ Post não encontrado')
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    // Criar comentário principal
    console.log('➕ Criando comentário...')
    const comment = await prisma.comment.create({
      data: {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        postId,
        userId: user.id,
        body: content.trim()
      },
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
    console.log('✅ Comentário criado:', comment.id)

    return NextResponse.json({ 
      message: 'Comentário criado com sucesso!', 
      comment 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Editar comentário (apenas dentro de 24h)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { commentId, content } = await request.json()

    if (!commentId || !content?.trim()) {
      return NextResponse.json({ message: 'ID do comentário e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Buscar o comentário
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ message: 'Comentário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é o dono do comentário
    if (comment.userId !== user.id) {
      return NextResponse.json({ message: 'Você só pode editar seus próprios comentários' }, { status: 403 })
    }

    // Verificar se passou de 24 horas
    const commentAge = Date.now() - new Date(comment.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

    if (commentAge > twentyFourHours) {
      return NextResponse.json({ 
        message: 'Você só pode editar comentários dentro de 24 horas após a criação' 
      }, { status: 403 })
    }

    // Atualizar comentário
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        body: content.trim()
      },
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

    return NextResponse.json({ 
      message: 'Comentário atualizado com sucesso!', 
      comment: updatedComment 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao editar comentário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar comentário (apenas dentro de 24h)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json({ message: 'ID do comentário é obrigatório' }, { status: 400 })
    }

    // Buscar o comentário
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ message: 'Comentário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é o dono do comentário
    if (comment.userId !== user.id) {
      return NextResponse.json({ message: 'Você só pode deletar seus próprios comentários' }, { status: 403 })
    }

    // Verificar se passou de 24 horas
    const commentAge = Date.now() - new Date(comment.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

    if (commentAge > twentyFourHours) {
      return NextResponse.json({ 
        message: 'Você só pode deletar comentários dentro de 24 horas após a criação' 
      }, { status: 403 })
    }

    // Deletar comentário
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ 
      message: 'Comentário deletado com sucesso!' 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
