import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

// GET - Listar fotos da galeria
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    try {
      const gallery = await prisma.businessgallery.findMany({
        where: { businessId },
        orderBy: { order: 'asc' }
      })

      return NextResponse.json({ gallery }, { status: 200 })
    } catch (dbError: any) {
      // Se a tabela não existir ainda, retornar lista vazia
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist') || dbError?.message?.includes('Unknown table')) {
        console.log('Tabela businessgallery ainda não existe, retornando lista vazia')
        return NextResponse.json({ gallery: [] }, { status: 200 })
      }
      throw dbError
    }

  } catch (error) {
    console.error('Erro ao buscar galeria:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Adicionar foto à galeria
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const businessId = formData.get('businessId') as string
    const file = formData.get('image') as File

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário é dono da empresa (usando empresa ativa se fornecido, senão verificar se pertence ao usuário)
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id // Verificar se pertence ao usuário
      }
    })

    if (!business || business.id !== businessId) {
      return NextResponse.json({ message: 'Empresa não encontrada ou acesso negado' }, { status: 403 })
    }

    if (!file) {
      return NextResponse.json({ message: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Contar quantas fotos já existem para definir a ordem
    let existingCount = 0
    try {
      existingCount = await prisma.businessgallery.count({
        where: { businessId }
      })
    } catch (dbError: any) {
      // Se a tabela não existir ainda, começar do zero
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist') || dbError?.message?.includes('Unknown table')) {
        console.log('Tabela businessgallery ainda não existe, começando do zero')
        existingCount = 0
      } else {
        throw dbError
      }
    }

    // Upload para Vercel Blob Storage
    const bytes = await file.arrayBuffer()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `gallery/${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: file.type,
    })

    const imageUrl = blob.url

    // Salvar no banco
    const galleryItem = await prisma.businessgallery.create({
      data: {
        id: `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId,
        imageUrl,
        order: existingCount,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Foto adicionada à galeria com sucesso',
      galleryItem
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao adicionar foto à galeria:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover foto da galeria
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const galleryId = searchParams.get('id')

    if (!galleryId) {
      return NextResponse.json({ message: 'ID da foto é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário é dono da empresa
    const galleryItem = await prisma.businessgallery.findUnique({
      where: { id: galleryId },
      include: { business: true }
    })

    if (!galleryItem) {
      return NextResponse.json({ message: 'Foto não encontrada' }, { status: 404 })
    }

    if (galleryItem.business.userId !== user.id && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Remover do banco
    await prisma.businessgallery.delete({
      where: { id: galleryId }
    })

    return NextResponse.json({
      message: 'Foto removida da galeria com sucesso'
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao remover foto da galeria:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
