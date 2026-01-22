import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// Função para gerar slug a partir do nome
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
    .trim()
}

// Função para gerar slug único
async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName)
  let counter = 1
  
  while (true) {
    const existingGuide = await prisma.guide.findUnique({
      where: { slug }
    })
    
    if (!existingGuide) {
      return slug
    }
    
    slug = `${generateSlug(baseName)}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Iniciando registro de guia...')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário encontrado:', user ? user.email : 'null')
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Dados recebidos:', { guideName: body.guideName })
    
    const { guideName, description, specialties, languages, phone, whatsapp, email, instagram, facebook, website } = body

    // Validar campos obrigatórios
    if (!guideName) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json({ 
        message: 'Nome do guia é obrigatório' 
      }, { status: 400 })
    }

    // Verificar se o usuário já possui um guia cadastrado
    console.log('🔍 Verificando guias existentes do usuário...')
    const userGuides = await prisma.guide.findMany({
      where: { userId: user.id }
    })
    console.log(`📊 Guias encontrados: ${userGuides.length}`)

    if (userGuides.length >= 1) {
      return NextResponse.json({ 
        message: 'Você já possui um guia cadastrado' 
      }, { status: 400 })
    }

    // Gerar slug único
    console.log('🔤 Gerando slug único...')
    const finalSlug = await generateUniqueSlug(guideName)
    console.log(`✅ Slug gerado: ${finalSlug}`)

    // Gerar ID único para o guia
    const guideId = 'guide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    console.log(`🆔 Guide ID gerado: ${guideId}`)

    // Criar o guia
    console.log('💾 Criando guia no banco de dados...')
    const guide = await prisma.guide.create({
      data: {
        id: guideId,
        userId: user.id,
        name: guideName,
        slug: finalSlug,
        description,
        specialties,
        languages,
        phone,
        whatsapp,
        email,
        instagram,
        facebook,
        website,
        isApproved: false,
        updatedAt: new Date()
      }
    })
    console.log('✅ Guia criado com sucesso:', guide.id)

    return NextResponse.json({ 
      message: 'Guia cadastrado com sucesso',
      guide
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ ERRO ao cadastrar guia:', error)
    console.error('📋 Detalhes do erro:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    })
    
    // Retornar mensagem de erro mais específica
    let errorMessage = 'Erro interno do servidor'
    if (error.code === 'P2002') {
      errorMessage = 'Já existe um guia com este slug ou nome'
    } else if (error.code === 'P2003') {
      errorMessage = 'Usuário não encontrado'
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    }, { status: 500 })
  }
}
