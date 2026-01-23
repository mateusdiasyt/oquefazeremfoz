import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isTourist } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

// Função auxiliar para atualizar a média de avaliações do guia
async function updateGuideRating(guideId: string) {
  const reviews = await prisma.guidereview.findMany({
    where: { guideId }
  })

  if (reviews.length === 0) {
    await prisma.guide.update({
      where: { id: guideId },
      data: { ratingAvg: 0, ratingCount: 0 }
    })
    return
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const avgRating = totalRating / reviews.length

  await prisma.guide.update({
    where: { id: guideId },
    data: { 
      ratingAvg: avgRating,
      ratingCount: reviews.length
    }
  })
}

// GET - Listar avaliações do guia
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const guideId = searchParams.get('guideId')

    if (!guideId) {
      return NextResponse.json({ message: 'ID do guia é obrigatório' }, { status: 400 })
    }

    const reviews = await prisma.guidereview.findMany({
      where: { guideId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ reviews }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova avaliação
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isTourist(user.roles)) {
      return NextResponse.json({ message: 'Apenas turistas podem avaliar guias' }, { status: 403 })
    }

    const formData = await request.formData()
    const guideId = formData.get('guideId') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const imageFile = formData.get('image') as File

    if (!guideId || !rating) {
      return NextResponse.json({ message: 'ID do guia e avaliação são obrigatórios' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 })
    }

    // Verificar se o guia existe
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      include: { user: true }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário já avaliou este guia
    const existingReview = await prisma.guidereview.findFirst({
      where: {
        guideId,
        userId: user.id
      }
    })

    if (existingReview) {
      return NextResponse.json({ message: 'Você já avaliou este guia' }, { status: 400 })
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024
      if (imageFile.size > maxSize) {
        return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      // Upload para Vercel Blob Storage
      const bytes = await imageFile.arrayBuffer()
      const fileExtension = imageFile.name.split('.').pop() || 'jpg'
      const fileName = `guides/${guideId}/reviews/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      const blob = await put(fileName, bytes, {
        access: 'public',
        contentType: imageFile.type,
      })

      imageUrl = blob.url
    }

    const review = await prisma.guidereview.create({
      data: {
        id: `guidereview_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        guideId,
        userId: user.id,
        rating,
        comment: comment || null,
        imageUrl,
        isVerified: false,
        updatedAt: new Date()
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

    // Atualizar média de avaliações do guia
    await updateGuideRating(guideId)

    return NextResponse.json({ 
      message: 'Avaliação criada com sucesso!', 
      review 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar avaliação
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const reviewId = formData.get('reviewId') as string
    const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null
    const comment = formData.get('comment') as string
    const imageFile = formData.get('image') as File

    if (!reviewId) {
      return NextResponse.json({ message: 'ID da avaliação é obrigatório' }, { status: 400 })
    }

    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await prisma.guidereview.findUnique({
      where: { id: reviewId },
      include: { guide: true }
    })

    if (!existingReview) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ message: 'Você não tem permissão para editar esta avaliação' }, { status: 403 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ message: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 })
    }

    let imageUrl = existingReview.imageUrl
    if (imageFile && imageFile.size > 0) {
      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024
      if (imageFile.size > maxSize) {
        return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      // Upload para Vercel Blob Storage
      const bytes = await imageFile.arrayBuffer()
      const fileExtension = imageFile.name.split('.').pop() || 'jpg'
      const fileName = `guides/${existingReview.guideId}/reviews/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      const blob = await put(fileName, bytes, {
        access: 'public',
        contentType: imageFile.type,
      })

      imageUrl = blob.url
    }

    const updatedReview = await prisma.guidereview.update({
      where: { id: reviewId },
      data: {
        rating: rating || existingReview.rating,
        comment: comment !== null ? comment : existingReview.comment,
        imageUrl,
        updatedAt: new Date()
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

    // Atualizar média de avaliações do guia
    await updateGuideRating(existingReview.guideId)

    return NextResponse.json({ 
      message: 'Avaliação atualizada com sucesso!', 
      review: updatedReview 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar avaliação
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json({ message: 'ID da avaliação é obrigatório' }, { status: 400 })
    }

    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await prisma.guidereview.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ message: 'Você não tem permissão para deletar esta avaliação' }, { status: 403 })
    }

    const guideId = existingReview.guideId

    // Deletar avaliação
    await prisma.guidereview.delete({
      where: { id: reviewId }
    })

    // Atualizar média de avaliações do guia
    await updateGuideRating(guideId)

    return NextResponse.json({ 
      message: 'Avaliação deletada com sucesso!' 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar avaliação:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
