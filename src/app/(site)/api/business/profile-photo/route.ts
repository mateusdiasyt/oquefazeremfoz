import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!isCompany(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar a empresa do usuário
    const business = await prisma.business.findUnique({
      where: { userId: user.id }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Parsear o FormData
    const formData = await request.formData()
    const file = formData.get('profilePhoto') as File

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Converter para ArrayBuffer
    const bytes = await file.arrayBuffer()

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `businesses/${business.id}/profile-${timestamp}.${fileExtension}`

    // Fazer upload para Vercel Blob Storage
    console.log('🔍 Fazendo upload de foto de perfil para Vercel Blob Storage...')
    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: file.type
    })

    console.log('✅ Foto de perfil enviada com sucesso:', blob.url)

    // Atualizar no banco de dados
    await prisma.business.update({
      where: { id: business.id },
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
