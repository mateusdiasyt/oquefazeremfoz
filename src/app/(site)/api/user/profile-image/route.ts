import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'
import { put } from '@vercel/blob'

// POST - Upload da foto de perfil do usuário (empresa ativa)
// Usa Vercel Blob Storage (compatível com serverless/Vercel)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const activeBusinessId = user.activeBusinessId || user.businessId
    if (!activeBusinessId) {
      return NextResponse.json({ message: 'Usuário não possui empresa' }, { status: 400 })
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

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ message: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `users/${user.id}/profile-${timestamp}.${fileExtension}`

    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: file.type
    })

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
