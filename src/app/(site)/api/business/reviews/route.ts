import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isTourist } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Buscar avaliações de uma empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    const reviews = await prisma.businessReview.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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
      return NextResponse.json({ message: 'Apenas turistas podem avaliar empresas' }, { status: 403 })
    }

    const formData = await request.formData()
    const businessId = formData.get('businessId') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const imageFile = formData.get('image') as File

    if (!businessId || !rating) {
      return NextResponse.json({ message: 'ID da empresa e avaliação são obrigatórios' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 })
    }

    // Verificar se a empresa existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { user: true }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário está seguindo a empresa
    const isFollowing = await prisma.businessLike.findFirst({
      where: {
        userId: user.id,
        businessId: business.id
      }
    })

    if (!isFollowing) {
      return NextResponse.json({ 
        message: 'Você precisa seguir esta empresa para poder avaliá-la' 
      }, { status: 403 })
    }

    // Verificar se o usuário já avaliou esta empresa
    const existingReview = await prisma.businessReview.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id
        }
      }
    })

    if (existingReview) {
      return NextResponse.json({ message: 'Você já avaliou esta empresa' }, { status: 400 })
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

      // Salvar imagem
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
      await mkdir(uploadDir, { recursive: true })
      
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `review-${timestamp}.${fileExtension}`
      const filePath = join(uploadDir, fileName)
      
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      
      imageUrl = `/uploads/reviews/${fileName}`
    }

    const review = await prisma.businessReview.create({
      data: {
        businessId,
        userId: user.id,
        rating,
        comment: comment || null,
        imageUrl,
        isVerified: false
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

    // Atualizar média de avaliações da empresa
    await updateBusinessRating(businessId)

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
    const reviewId = formData.get('id') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const imageFile = formData.get('image') as File

    if (!reviewId || !rating) {
      return NextResponse.json({ message: 'ID da avaliação e avaliação são obrigatórios' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 })
    }

    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await prisma.businessReview.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ message: 'Você só pode editar suas próprias avaliações' }, { status: 403 })
    }

    // Verificar se passou de 24 horas
    const reviewAge = Date.now() - new Date(existingReview.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

    if (reviewAge > twentyFourHours) {
      return NextResponse.json({ 
        message: 'Você só pode editar avaliações dentro de 24 horas após a criação' 
      }, { status: 403 })
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

      // Salvar nova imagem
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
      await mkdir(uploadDir, { recursive: true })
      
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `review-${timestamp}.${fileExtension}`
      const filePath = join(uploadDir, fileName)
      
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      
      imageUrl = `/uploads/reviews/${fileName}`
    }

    const review = await prisma.businessReview.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment || null,
        imageUrl
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

    // Atualizar média de avaliações da empresa
    await updateBusinessRating(existingReview.businessId)

    return NextResponse.json({ 
      message: 'Avaliação atualizada com sucesso!', 
      review 
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

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ message: 'ID da avaliação é obrigatório' }, { status: 400 })
    }

    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await prisma.businessReview.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json({ message: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ message: 'Você só pode deletar suas próprias avaliações' }, { status: 403 })
    }

    // Verificar se passou de 24 horas
    const reviewAge = Date.now() - new Date(existingReview.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000 // 24 horas em milissegundos

    if (reviewAge > twentyFourHours) {
      return NextResponse.json({ 
        message: 'Você só pode deletar avaliações dentro de 24 horas após a criação' 
      }, { status: 403 })
    }

    await prisma.businessReview.delete({
      where: { id: reviewId }
    })

    // Atualizar média de avaliações da empresa
    await updateBusinessRating(existingReview.businessId)

    return NextResponse.json({ 
      message: 'Avaliação deletada com sucesso!' 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar avaliação:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Função auxiliar para atualizar a média de avaliações da empresa
async function updateBusinessRating(businessId: string) {
  try {
    const reviews = await prisma.businessReview.findMany({
      where: { businessId },
      select: { rating: true }
    })

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      
      await prisma.business.update({
        where: { id: businessId },
        data: {
          // Adicionar campos de rating se necessário no modelo Business
        }
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar rating da empresa:', error)
  }
}
