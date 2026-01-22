import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { put } from '@vercel/blob'

// POST - Upload da capa do perfil
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!user.roles.includes('COMPANY') && !user.roles.includes('ADMIN')) {
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
        userId: user.id
      }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    // Obter o FormData
    const formData = await request.formData()
    const file = formData.get('cover') as File

    if (!file) {
      return NextResponse.json({ message: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Converter File para ArrayBuffer
    const bytes = await file.arrayBuffer()

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `businesses/${business.id}/cover-${timestamp}.${fileExtension}`

    // Fazer upload para Vercel Blob Storage
    console.log('🔍 Fazendo upload de capa para Vercel Blob Storage...')
    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: file.type
    })

    console.log('✅ Capa enviada com sucesso:', blob.url)

    // Atualizar a empresa com a nova capa
    await prisma.business.update({
      where: { id: business.id },
      data: { coverImage: blob.url }
    })

    return NextResponse.json({
      message: 'Capa atualizada com sucesso',
      coverImage: blob.url
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao fazer upload da capa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Buscar capa atual
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!user.roles.includes('COMPANY') && !user.roles.includes('ADMIN')) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    // Buscar empresa ativa do usuário
    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Nenhuma empresa ativa encontrada' }, { status: 404 })
    }

    // Buscar a empresa do usuário
    const business = await prisma.business.findFirst({
      where: { 
        id: activeBusinessId,
        userId: user.id
      },
      select: { coverImage: true }
    })

    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      coverImage: business.coverImage
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar capa:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
