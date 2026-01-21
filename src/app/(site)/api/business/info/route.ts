import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const { address, phone, website, instagram, facebook, whatsapp, presentationVideo } = await request.json()

    // Verificar se foi fornecido um ID específico na query string
    const { searchParams } = new URL(request.url)
    const requestedBusinessId = searchParams.get('id')

    // Determinar qual empresa atualizar
    let businessId: string | null = null
    if (requestedBusinessId) {
      // Verificar se a empresa solicitada pertence ao usuário
      const requestedBusiness = await prisma.business.findFirst({
        where: { 
          id: requestedBusinessId,
          userId: user.id
        },
        select: { id: true }
      })
      if (requestedBusiness) {
        businessId = requestedBusinessId
      }
    }
    
    // Se não foi fornecido ou não pertence ao usuário, usar empresa ativa
    if (!businessId) {
      businessId = user.activeBusinessId || user.businessId
      if (!businessId) {
        return NextResponse.json({ message: 'Nenhuma empresa encontrada' }, { status: 404 })
      }
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: businessId,
        userId: user.id
      },
      select: {
        id: true
        // Apenas precisamos do ID para verificar se existe
        // presentationVideo não incluído até migração ser executada
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Validar URL do website se fornecida
    if (website && website.trim() !== '') {
      try {
        new URL(website)
      } catch {
        return NextResponse.json({ message: 'URL do website inválida' }, { status: 400 })
      }
    }

    // Validar URL do vídeo de apresentação se fornecida
    if (presentationVideo && presentationVideo.trim() !== '') {
      // Verificar se é uma URL válida do YouTube
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/
      if (!youtubePattern.test(presentationVideo.trim())) {
        return NextResponse.json({ message: 'URL do vídeo deve ser do YouTube' }, { status: 400 })
      }
    }

    // Preparar dados para atualização (apenas os campos fornecidos)
    const updateData: any = {}
    if (address !== undefined) updateData.address = address?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (website !== undefined) updateData.website = website?.trim() || null
    if (instagram !== undefined) updateData.instagram = instagram?.trim() || null
    if (facebook !== undefined) updateData.facebook = facebook?.trim() || null
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp?.trim() || null
    
    // Separar presentationVideo para tratamento especial
    const presentationVideoValue = presentationVideo !== undefined ? presentationVideo?.trim() || null : undefined
    if (presentationVideoValue !== undefined) {
      updateData.presentationVideo = presentationVideoValue
    }

    // Atualizar as informações
    // Tentar atualizar com presentationVideo usando SQL raw se necessário
    let updatedBusiness: any = null
    
    // Primeiro, atualizar todos os campos exceto presentationVideo
    const { presentationVideo: _, ...updateDataWithoutVideo } = updateData
    
    // Atualizar campos normais
    updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: updateDataWithoutVideo,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        address: true,
        phone: true,
        website: true,
        instagram: true,
        facebook: true,
        whatsapp: true,
        profileImage: true,
        coverImage: true,
        isApproved: true,
        isVerified: true,
        likesCount: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      }
    })
    
    // Se presentationVideo foi fornecido, tentar atualizar usando SQL raw
    if (presentationVideoValue !== undefined) {
      try {
        // Primeiro, verificar se a coluna existe e criá-la se necessário
        await prisma.$executeRaw`
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'business' AND column_name = 'presentationVideo'
            ) THEN
              ALTER TABLE "business" ADD COLUMN "presentationVideo" TEXT;
            END IF;
          END $$;
        `
        
        // Agora atualizar o valor
        await prisma.$executeRaw`
          UPDATE "business" 
          SET "presentationVideo" = ${presentationVideoValue || null}
          WHERE id = ${business.id}
        `
        
        // Buscar o valor atualizado
        const videoResult = await prisma.$queryRaw<Array<{ presentationVideo: string | null }>>`
          SELECT "presentationVideo" FROM "business" WHERE id = ${business.id}
        `
        updatedBusiness.presentationVideo = videoResult[0]?.presentationVideo || null
      } catch (error: any) {
        // Se ainda der erro, definir como null
        updatedBusiness.presentationVideo = null
      }
    } else {
      // Se não foi fornecido, tentar buscar o valor atual
      try {
        const videoResult = await prisma.$queryRaw<Array<{ presentationVideo: string | null }>>`
          SELECT "presentationVideo" FROM "business" WHERE id = ${business.id}
        `
        updatedBusiness.presentationVideo = videoResult[0]?.presentationVideo || null
      } catch {
        updatedBusiness.presentationVideo = null
      }
    }

    return NextResponse.json({ 
      message: 'Informações atualizadas com sucesso',
      business: updatedBusiness 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar informações da empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
