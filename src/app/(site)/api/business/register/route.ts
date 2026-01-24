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
    const existingBusiness = await prisma.business.findUnique({
      where: { slug }
    })
    
    if (!existingBusiness) {
      return slug
    }
    
    slug = `${generateSlug(baseName)}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Iniciando registro de empresa...')
    
    const user = await getCurrentUser()
    console.log('👤 Usuário encontrado:', user ? user.email : 'null')
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Dados recebidos:', { businessName: body.businessName, category: body.category })
    
    const { businessName, description, category, address, phone, website, instagram, facebook, whatsapp, customSlug } = body

    // Validar campos obrigatórios
    if (!businessName || !category || !address) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json({ 
        message: 'Campos obrigatórios: nome, categoria e endereço' 
      }, { status: 400 })
    }

    // Verificar quantas empresas o usuário já possui (limite de 3)
    console.log('🔍 Verificando empresas existentes do usuário...')
    const userBusinesses = await prisma.business.findMany({
      where: { userId: user.id }
    })
    console.log(`📊 Empresas encontradas: ${userBusinesses.length}`)

    if (userBusinesses.length >= 3) {
      return NextResponse.json({ 
        message: 'Você já possui o número máximo de empresas cadastradas (3 empresas)' 
      }, { status: 400 })
    }

    // Gerar slug único
    console.log('🔤 Gerando slug único...')
    let finalSlug: string
    if (customSlug && customSlug.trim() !== '') {
      // Validar slug personalizado
      const customSlugFormatted = generateSlug(customSlug)
      if (customSlugFormatted !== customSlug) {
        return NextResponse.json({ 
          message: 'Slug personalizado contém caracteres inválidos. Use apenas letras, números e hífens.' 
        }, { status: 400 })
      }
      
      // Verificar se o slug personalizado está disponível
      const existingSlug = await prisma.business.findUnique({
        where: { slug: customSlugFormatted }
      })
      
      if (existingSlug) {
        return NextResponse.json({ 
          message: 'Este slug já está em uso. Escolha outro.' 
        }, { status: 400 })
      }
      
      finalSlug = customSlugFormatted
    } else {
      // Gerar slug automaticamente
      finalSlug = await generateUniqueSlug(businessName)
    }
    console.log(`✅ Slug gerado: ${finalSlug}`)

    // Gerar ID único para a empresa
    const businessId = 'business_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    console.log(`🆔 Business ID gerado: ${businessId}`)

    // Se for a primeira empresa, definir como ativa
    const isFirstBusiness = userBusinesses.length === 0
    const shouldSetAsActive = isFirstBusiness || !user.activeBusinessId
    console.log(`🏢 Primeira empresa: ${isFirstBusiness}, Deve definir como ativa: ${shouldSetAsActive}`)

    // Criar a empresa
    console.log('💾 Criando empresa no banco de dados...')
    const business = await prisma.business.create({
      data: {
        id: businessId,
        userId: user.id,
        name: businessName,
        slug: finalSlug,
        description,
        category,
        address,
        phone,
        website,
        instagram,
        facebook,
        whatsapp,
        isApproved: true,
        approvedAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('✅ Empresa criada com sucesso:', business.id)

    // Se for a primeira empresa ou não tiver empresa ativa, definir como ativa
    if (shouldSetAsActive) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { activeBusinessId: businessId }
        })
      } catch (updateError: any) {
        // Se a coluna activeBusinessId não existir ainda, logar e continuar
        console.error('⚠️ Erro ao definir empresa ativa (pode ser que a coluna não existe ainda):', updateError.message)
        // Continuar mesmo se falhar - a empresa foi criada com sucesso
      }
    }

    return NextResponse.json({ 
      message: 'Empresa cadastrada com sucesso',
      business,
      setAsActive: shouldSetAsActive
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ ERRO ao cadastrar empresa:', error)
    console.error('📋 Detalhes do erro:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    })
    
    // Retornar mensagem de erro mais específica
    let errorMessage = 'Erro interno do servidor'
    if (error.code === 'P2002') {
      errorMessage = 'Já existe uma empresa com este slug ou nome'
    } else if (error.code === 'P2003') {
      errorMessage = 'Usuário não encontrado'
    } else if (error.message?.includes('Unknown column')) {
      errorMessage = 'Erro de configuração do banco de dados. Verifique se a coluna activeBusinessId existe.'
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    }, { status: 500 })
  }
}
