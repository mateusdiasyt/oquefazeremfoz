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

    // Verificar se o usuário já tem uma empresa cadastrada
    const existingBusiness = await prisma.business.findUnique({
      where: { userId: user.id }
    })

    if (existingBusiness) {
      return NextResponse.json({ message: 'Você já possui uma empresa cadastrada' }, { status: 400 })
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

    return NextResponse.json({ 
      message: 'Empresa cadastrada com sucesso',
      business 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
