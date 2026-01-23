import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isGuide, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

// GET - Listar posts do guia
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const guideId = searchParams.get('guideId')

    if (!guideId) {
      return NextResponse.json({ message: 'ID do guia é obrigatório' }, { status: 400 })
    }

    try {
      const posts = await prisma.guidepost.findMany({
        where: { guideId },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ posts }, { status: 200 })
    } catch (dbError: any) {
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        return NextResponse.json({ posts: [] }, { status: 200 })
      }
      throw dbError
    }

  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const guideId = formData.get('guideId') as string
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    const imageFile = formData.get('image') as File
    const videoFile = formData.get('video') as File

    if (!guideId || !title) {
      return NextResponse.json({ message: 'ID do guia e título são obrigatórios' }, { status: 400 })
    }

    // Verificar se o usuário é dono do guia
    const guide = await prisma.guide.findFirst({
      where: {
        id: guideId,
        userId: user.id
      }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado ou acesso negado' }, { status: 403 })
    }

    let imageUrl = null
    let videoUrl = null

    // Upload de imagem
    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      const bytes = await imageFile.arrayBuffer()
      const fileExtension = imageFile.name.split('.').pop() || 'jpg'
      const fileName = `guides/${guideId}/posts/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      const blob = await put(fileName, bytes, {
        access: 'public',
        contentType: imageFile.type,
      })

      imageUrl = blob.url
    }

    // Upload de vídeo
    if (videoFile && videoFile.size > 0) {
      if (!videoFile.type.startsWith('video/')) {
        return NextResponse.json({ message: 'Apenas vídeos são permitidos' }, { status: 400 })
      }

      if (videoFile.size > 50 * 1024 * 1024) {
        return NextResponse.json({ message: 'Vídeo muito grande. Máximo 50MB' }, { status: 400 })
      }

      const bytes = await videoFile.arrayBuffer()
      const fileExtension = videoFile.name.split('.').pop() || 'mp4'
      const fileName = `guides/${guideId}/posts/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      const blob = await put(fileName, bytes, {
        access: 'public',
        contentType: videoFile.type,
      })

      videoUrl = blob.url
    }

    const post = await prisma.guidepost.create({
      data: {
        id: `guidepost_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        guideId,
        title,
        body: body || null,
        imageUrl,
        videoUrl,
        likes: 0
      }
    })

    return NextResponse.json({
      message: 'Post criado com sucesso',
      post
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar post:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar post
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ message: 'ID do post é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário é dono do guia
    const post = await prisma.guidepost.findUnique({
      where: { id: postId },
      include: { guide: true }
    })

    if (!post) {
      return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 })
    }

    if (post.guide.userId !== user.id && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    await prisma.guidepost.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      message: 'Post deletado com sucesso'
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar post:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
