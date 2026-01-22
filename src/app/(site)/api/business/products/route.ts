import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { put } from '@vercel/blob'

// GET - Buscar produtos da empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    const products = await prisma.businessproduct.findMany({
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
    console.log('🔍 POST /api/business/products: Iniciando...')
    
    const user = await getCurrentUser()
    console.log('🔍 Usuário obtido:', { 
      found: !!user, 
      id: user?.id, 
      email: user?.email, 
      businessId: user?.businessId,
      roles: user?.roles 
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      console.log('❌ Usuário não é empresa:', user.roles)
      return NextResponse.json({ error: 'Apenas empresas podem cadastrar produtos' }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const priceCentsStr = formData.get('priceCents') as string
    const priceCents = parseInt(priceCentsStr)
    const productUrl = formData.get('productUrl') as string
    const businessId = formData.get('businessId') as string
    const imageFile = formData.get('image') as File | null

    console.log('🔍 Dados recebidos:', {
      name,
      description: description?.substring(0, 50),
      priceCents,
      priceCentsStr,
      productUrl,
      businessId,
      imageFile: imageFile ? { name: imageFile.name, size: imageFile.size } : null
    })

    // Validar se a empresa pertence ao usuário e verificar aprovação
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (activeBusinessId !== businessId) {
      console.log('❌ businessId não corresponde:', { userBusinessId: activeBusinessId, requestBusinessId: businessId })
      return NextResponse.json({ error: 'Você não tem permissão para cadastrar produtos nesta empresa' }, { status: 403 })
    }

    // Verificar se a empresa está aprovada
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      },
      select: {
        id: true,
        isApproved: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    if (!business.isApproved) {
      return NextResponse.json({ 
        error: 'Sua empresa está aguardando aprovação da administração. Você não pode cadastrar produtos até que sua empresa seja aprovada.' 
      }, { status: 403 })
    }

    // Validações
    if (!name || !priceCents || isNaN(priceCents)) {
      console.log('❌ Validação falhou:', { name: !!name, priceCents, isNaN: isNaN(priceCents) })
      return NextResponse.json({ error: 'Nome e preço são obrigatórios' }, { status: 400 })
    }

    if (priceCents <= 0) {
      console.log('❌ Preço inválido:', priceCents)
      return NextResponse.json({ error: 'Preço deve ser maior que zero' }, { status: 400 })
    }

    // Processar upload da imagem usando Vercel Blob Storage
    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      console.log('🔍 Processando upload de imagem via Vercel Blob Storage...')
      
      // Validar tipo de arquivo
      if (!imageFile.type.startsWith('image/')) {
        console.log('❌ Tipo de arquivo inválido:', imageFile.type)
        return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024
      if (imageFile.size > maxSize) {
        console.log('❌ Arquivo muito grande:', imageFile.size)
        return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
      }

      try {
        // Converter File para ArrayBuffer
        const bytes = await imageFile.arrayBuffer()

        // Gerar nome único para o arquivo
        const timestamp = Date.now()
        const fileExtension = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `products/${businessId}/${timestamp}.${fileExtension}`

        // Fazer upload para Vercel Blob Storage
        // O put aceita ArrayBuffer, Uint8Array, ou Blob
        console.log('🔍 Fazendo upload para Vercel Blob Storage...')
        const blob = await put(fileName, bytes, {
          access: 'public',
          contentType: imageFile.type
        })

        imageUrl = blob.url
        console.log('✅ Imagem enviada com sucesso para Vercel Blob Storage:', imageUrl)
      } catch (uploadError) {
        console.error('❌ Erro ao fazer upload para Vercel Blob Storage:', uploadError)
        
        // Se o upload falhar, continuar sem imagem (não crítico)
        // Isso pode acontecer se BLOB_READ_WRITE_TOKEN não estiver configurado
        console.log('⚠️ Produto será criado sem imagem devido ao erro no upload')
        imageUrl = null
      }
    }

    console.log('🔍 Tentando criar produto no banco...')
    const productId = `businessproduct_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    try {
      const product = await prisma.businessproduct.create({
        data: {
          id: productId,
          businessId,
          name,
          description: description || null,
          priceCents,
          currency: 'BRL', // Campo obrigatório no schema
          productUrl: productUrl || null,
          imageUrl: imageUrl || null,
          isActive: true,
          updatedAt: new Date()
        }
      })

      console.log('✅ Produto criado com sucesso:', product.id)
      return NextResponse.json({ 
        message: 'Produto cadastrado com sucesso!',
        product 
      }, { status: 201 })
    } catch (createError) {
      console.error('❌ Erro ao criar produto no Prisma:', createError)
      throw createError
    }
  } catch (error) {
    console.error('❌ Erro completo ao criar produto:', error)
    console.error('❌ Tipo do erro:', typeof error)
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'Sem stack trace')
    
    // Fornecer mais detalhes do erro para debug
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorDetails = process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : errorMessage
    
    return NextResponse.json({ 
      error: errorDetails,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: error instanceof Error ? error.stack : undefined,
        message: errorMessage,
        errorType: typeof error,
        errorString: String(error)
      })
    }, { status: 500 })
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
    const existingProduct = await prisma.businessproduct.findUnique({
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

    // Processar upload da imagem usando Vercel Blob Storage (se fornecida)
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

      try {
        // Converter File para ArrayBuffer
        const bytes = await imageFile.arrayBuffer()

        // Gerar nome único para o arquivo
        const timestamp = Date.now()
        const fileExtension = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `products/${existingProduct.businessId}/${timestamp}.${fileExtension}`

        // Fazer upload para Vercel Blob Storage
        console.log('🔍 Fazendo upload para Vercel Blob Storage (PUT)...')
        const blob = await put(fileName, bytes, {
          access: 'public',
          contentType: imageFile.type
        })

        imageUrl = blob.url
        console.log('✅ Imagem enviada com sucesso para Vercel Blob Storage:', imageUrl)
      } catch (uploadError) {
        console.error('❌ Erro ao fazer upload para Vercel Blob Storage:', uploadError)
        // Se o upload falhar, manter a imagem existente
        console.log('⚠️ Upload falhou, mantendo imagem existente')
      }
    }

    const product = await prisma.businessproduct.update({
      where: { id },
      data: {
        name,
        description: description || null,
        priceCents,
        productUrl: productUrl || null,
        imageUrl: imageUrl,
        updatedAt: new Date()
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
    const existingProduct = await prisma.businessproduct.findUnique({
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
    await prisma.businessproduct.update({
      where: { id: productId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Produto removido com sucesso!' 
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
