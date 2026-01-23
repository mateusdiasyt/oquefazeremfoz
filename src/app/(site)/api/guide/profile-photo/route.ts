import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isGuide, isAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isGuide(user.roles) && !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const guideId = formData.get('guideId') as string
    const file = formData.get('profilePhoto') as File

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

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Converter para ArrayBuffer
    const bytes = await file.arrayBuffer()

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `guides/${guideId}/profile-${timestamp}.${fileExtension}`

    // Fazer upload para Vercel Blob Storage
    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: file.type
    })

    // Atualizar no banco de dados
    await prisma.guide.update({
      where: { id: guideId },
      data: { profileImage: blob.url }
    })

    return NextResponse.json({ 
      message: 'Foto de perfil atualizada com sucesso',
      profileImage: blob.url 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
