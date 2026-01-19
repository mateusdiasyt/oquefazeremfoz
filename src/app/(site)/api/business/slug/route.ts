import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'

const prisma = new PrismaClient()

// PUT - Atualizar slug da empresa
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ error: 'Apenas empresas podem editar o slug' }, { status: 403 })
    }

    const body = await request.json()
    const { slug } = body

    if (!slug || slug.trim() === '') {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    // Validar formato do slug
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ 
        error: 'Slug deve conter apenas letras minúsculas, números e hífens' 
      }, { status: 400 })
    }

    // Verificar se o slug já existe
    const existingBusiness = await prisma.business.findFirst({
      where: { 
        slug: slug,
        NOT: { userId: user.id } // Excluir a própria empresa
      }
    })

    if (existingBusiness) {
      return NextResponse.json({ 
        error: 'Este slug já está sendo usado por outra empresa' 
      }, { status: 400 })
    }

    // Buscar a empresa do usuário
    const business = await prisma.business.findUnique({
      where: { userId: user.id }
    })

    if (!business) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Atualizar o slug
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: { slug: slug.trim() }
    })

    return NextResponse.json({ 
      message: 'Slug atualizado com sucesso!',
      business: updatedBusiness
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar slug:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Verificar se slug está disponível
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    // Verificar se o slug já existe
    const existingBusiness = await prisma.business.findFirst({
      where: { slug: slug }
    })

    return NextResponse.json({ 
      available: !existingBusiness 
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao verificar slug:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
