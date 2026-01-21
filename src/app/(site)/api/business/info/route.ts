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

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id
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
    if (presentationVideo !== undefined) updateData.presentationVideo = presentationVideo?.trim() || null

    // Atualizar as informações
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: updateData
    })

    return NextResponse.json({ 
      message: 'Informações atualizadas com sucesso',
      business: updatedBusiness 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar informações da empresa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
