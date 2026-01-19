import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

// GET - Buscar produtos da empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ error: 'Apenas empresas podem cadastrar produtos' }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const priceCents = parseInt(formData.get('priceCents') as string)
    const productUrl = formData.get('productUrl') as string
    const businessId = formData.get('businessId') as string
    const imageFile = formData.get('image') as File

    // Validar se a empresa pertence ao usuário
    if (user.businessId !== businessId) {
      return NextResponse.json({ error: 'Você não tem permissão para cadastrar produtos nesta empresa' }, { status: 403 })
    }

    // Validações
    if (!name || !priceCents) {
      return NextResponse.json({ error: 'Nome e preço são obrigatórios' }, { status: 400 })
    }

    if (priceCents <= 0) {
      return NextResponse.json({ error: 'Preço deve ser maior que zero' }, { status: 400 })
    }

    // Processar upload da imagem
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024
      if (imageFile.size > maxSize) {
        return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      // Criar diretório se não existir
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
      await mkdir(uploadDir, { recursive: true })

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `product-${timestamp}.${fileExtension}`
      const filePath = join(uploadDir, fileName)

      // Converter para buffer e salvar
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Caminho relativo para salvar no banco
      imageUrl = `/uploads/products/${fileName}`
    }

    const product = await prisma.product.create({
      data: {
        businessId,
        name,
        description: description || null,
        priceCents,
        productUrl: productUrl || null,
        imageUrl: imageUrl,
        isActive: true
      }
    })

    return NextResponse.json({ 
      message: 'Produto cadastrado com sucesso!',
      product 
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ error: 'Apenas empresas podem editar produtos' }, { status: 403 })
    }

    const formData = await request.formData()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const priceCents = parseInt(formData.get('priceCents') as string)
    const productUrl = formData.get('productUrl') as string
    const imageFile = formData.get('image') as File

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    // Buscar o produto e verificar se pertence à empresa do usuário
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { business: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (existingProduct.business.userId !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este produto' }, { status: 403 })
    }

    // Validações
    if (!name || !priceCents) {
      return NextResponse.json({ error: 'Nome e preço são obrigatórios' }, { status: 400 })
    }

    if (priceCents <= 0) {
      return NextResponse.json({ error: 'Preço deve ser maior que zero' }, { status: 400 })
    }

    // Processar upload da imagem (se fornecida)
    let imageUrl = existingProduct.imageUrl
    if (imageFile && imageFile.size > 0) {
      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024
      if (imageFile.size > maxSize) {
        return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      // Criar diretório se não existir
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
      await mkdir(uploadDir, { recursive: true })

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `product-${timestamp}.${fileExtension}`
      const filePath = join(uploadDir, fileName)

      // Converter para buffer e salvar
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Caminho relativo para salvar no banco
      imageUrl = `/uploads/products/${fileName}`
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        priceCents,
        productUrl: productUrl || null,
        imageUrl: imageUrl
      }
    })

    return NextResponse.json({ 
      message: 'Produto atualizado com sucesso!',
      product 
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar produto (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ error: 'Apenas empresas podem deletar produtos' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    // Buscar o produto e verificar se pertence à empresa do usuário
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { business: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (existingProduct.business.userId !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para deletar este produto' }, { status: 403 })
    }

    // Soft delete - marcar como inativo
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    })

    return NextResponse.json({ 
      message: 'Produto removido com sucesso!' 
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
