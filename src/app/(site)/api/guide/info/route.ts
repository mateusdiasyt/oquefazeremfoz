import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isGuide, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// PATCH - Atualizar informações do guia
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const guideId = searchParams.get('id')

    if (!guideId) {
      return NextResponse.json({ message: 'ID do guia é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário é dono do guia
    const guide = await prisma.guide.findFirst({
      where: {
        id: guideId,
        userId: user.id
      }
    })

    if (!guide) {
      return NextResponse.json({ message: 'Guia não encontrado ou acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { description, whatsapp, website, phone, email, instagram, facebook, specialties, languages } = body

    // Limpar e formatar número do WhatsApp (remover caracteres não numéricos)
    const cleanWhatsapp = whatsapp ? whatsapp.replace(/\D/g, '') : null

    // Atualizar informações
    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: {
        description: description !== undefined ? description : guide.description,
        whatsapp: cleanWhatsapp || guide.whatsapp,
        website: website !== undefined ? website : guide.website,
        phone: phone !== undefined ? phone : guide.phone,
        email: email !== undefined ? email : guide.email,
        instagram: instagram !== undefined ? instagram : guide.instagram,
        facebook: facebook !== undefined ? facebook : guide.facebook,
        specialties: specialties !== undefined ? specialties : guide.specialties,
        languages: languages !== undefined ? languages : guide.languages,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Informações atualizadas com sucesso',
      guide: updatedGuide 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar informações do guia:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
