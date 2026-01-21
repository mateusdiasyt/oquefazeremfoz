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
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, description, category, address, phone, website, instagram, facebook, whatsapp, customSlug } = body

    // Validar campos obrigatórios
    if (!businessName || !category || !address) {
      return NextResponse.json({ 
        message: 'Campos obrigatórios: nome, categoria e endereço' 
      }, { status: 400 })
    }

    // Verificar quantas empresas o usuário já possui (limite de 3)
    const userBusinesses = await prisma.business.findMany({
      where: { userId: user.id }
    })

    if (userBusinesses.length >= 3) {
      return NextResponse.json({ 
        message: 'Você já possui o número máximo de empresas cadastradas (3 empresas)' 
      }, { status: 400 })
    }

    // Gerar slug único
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

    // Gerar ID único para a empresa
    const businessId = 'business_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // Se for a primeira empresa, definir como ativa
    const isFirstBusiness = userBusinesses.length === 0
    const shouldSetAsActive = isFirstBusiness || !user.activeBusinessId

    // Criar a empresa
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
        isApproved: false,
        updatedAt: new Date()
      }
    })

    // Se for a primeira empresa ou não tiver empresa ativa, definir como ativa
    if (shouldSetAsActive) {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeBusinessId: businessId }
      })
    }

    return NextResponse.json({ 
      message: 'Empresa cadastrada com sucesso',
      business,
      setAsActive: shouldSetAsActive
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
