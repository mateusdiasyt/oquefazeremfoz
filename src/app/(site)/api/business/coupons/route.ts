import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Buscar cupons da empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ message: 'ID da empresa é obrigatório' }, { status: 400 })
    }

    const coupons = await prisma.businesscoupon.findMany({
      where: { 
        businessId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ coupons }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar cupons:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo cupom
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id // Verificar se pertence ao usuário
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    const { title, code, description, link, discount, validUntil } = await request.json()

    if (!title || !code) {
      return NextResponse.json({ message: 'Título e código são obrigatórios' }, { status: 400 })
    }

    // Verificar limite de cupons: apenas 1 a cada 24 horas
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const recentCoupons = await prisma.businesscoupon.findMany({
      where: { 
        businessId: business.id,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (recentCoupons.length > 0) {
      const lastCouponDate = recentCoupons[0].createdAt
      const hoursSinceLastCoupon = Math.floor((Date.now() - lastCouponDate.getTime()) / (1000 * 60 * 60))
      const remainingHours = 24 - hoursSinceLastCoupon
      
      if (remainingHours > 0) {
        const hoursText = remainingHours === 1 ? 'hora' : 'horas'
        return NextResponse.json({ 
          message: `Você só pode criar um cupom a cada 24 horas. Tente novamente em ${remainingHours} ${hoursText}.`,
          remainingHours 
        }, { status: 429 })
      }
    }

    // Verificar se já existe um cupom com o mesmo código
    const existingCoupon = await prisma.businesscoupon.findFirst({
      where: { 
        businessId: business.id,
        code: code,
        isActive: true
      }
    })

    if (existingCoupon) {
      return NextResponse.json({ message: 'Já existe um cupom com este código' }, { status: 400 })
    }

    const coupon = await prisma.businesscoupon.create({
      data: {
        id: `businesscoupon_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        businessId: business.id,
        title,
        code,
        description: description || null,
        link: link || null,
        discount: discount || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Cupom criado com sucesso!', 
      coupon 
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar cupom:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar cupom
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id // Verificar se pertence ao usuário
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    const { id, title, code, description, link, discount, validUntil } = await request.json()

    if (!id || !title || !code) {
      return NextResponse.json({ message: 'ID, título e código são obrigatórios' }, { status: 400 })
    }

    // Verificar se o cupom pertence à empresa
    const existingCoupon = await prisma.businesscoupon.findFirst({
      where: { 
        id,
        businessId: business.id
      }
    })

    if (!existingCoupon) {
      return NextResponse.json({ message: 'Cupom não encontrado' }, { status: 404 })
    }

    // Verificar se já existe outro cupom com o mesmo código
    const duplicateCoupon = await prisma.businesscoupon.findFirst({
      where: { 
        businessId: business.id,
        code: code,
        isActive: true,
        id: { not: id }
      }
    })

    if (duplicateCoupon) {
      return NextResponse.json({ message: 'Já existe outro cupom com este código' }, { status: 400 })
    }

    const coupon = await prisma.businesscoupon.update({
      where: { id },
      data: {
        title,
        code,
        description: description || null,
        link: link || null,
        discount: discount || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Cupom atualizado com sucesso!', 
      coupon 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar cupom:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar cupom
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id // Verificar se pertence ao usuário
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID do cupom é obrigatório' }, { status: 400 })
    }

    // Verificar se o cupom pertence à empresa
    const existingCoupon = await prisma.businesscoupon.findFirst({
      where: { 
        id,
        businessId: business.id
      }
    })

    if (!existingCoupon) {
      return NextResponse.json({ message: 'Cupom não encontrado' }, { status: 404 })
    }

    await prisma.businesscoupon.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cupom deletado com sucesso!' }, { status: 200 })

  } catch (error) {
    console.error('Erro ao deletar cupom:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
