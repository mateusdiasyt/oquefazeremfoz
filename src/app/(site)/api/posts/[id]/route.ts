import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE - Deletar post (foto da galeria)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id

    // Buscar o post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { business: true }
    })

    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é dono da empresa ou admin
    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se é dono da empresa (se não for admin)
    if (!isAdmin(user.roles) && post.business.userId !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Deletar arquivos físicos se existirem
    if (post.imageUrl) {
      try {
        const imagePath = join(process.cwd(), 'public', post.imageUrl)
        await unlink(imagePath)
      } catch (error) {
        console.error('Erro ao deletar arquivo de imagem:', error)
        // Continuar mesmo se não conseguir deletar o arquivo
      }
    }

    if (post.videoUrl) {
      try {
        const videoPath = join(process.cwd(), 'public', post.videoUrl)
        await unlink(videoPath)
      } catch (error) {
        console.error('Erro ao deletar arquivo de vídeo:', error)
        // Continuar mesmo se não conseguir deletar o arquivo
      }
    }

    // Deletar o post do banco
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Post deletado com sucesso' })

  } catch (error) {
    console.error('Erro ao deletar post:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar post (foto da galeria)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const postId = params.id
    const { title, body, imageUrl, videoUrl } = await request.json()

    // Buscar o post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { business: true }
    })

    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é dono da empresa ou admin
    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se é dono da empresa (se não for admin)
    if (!isAdmin(user.roles) && post.business.userId !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Validações
    if (!title || title.trim() === '') {
      return NextResponse.json({ message: 'Título é obrigatório' }, { status: 400 })
    }

    // Atualizar o post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        body: body?.trim() || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Post atualizado com sucesso',
      post: updatedPost
    })

  } catch (error) {
    console.error('Erro ao atualizar post:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
