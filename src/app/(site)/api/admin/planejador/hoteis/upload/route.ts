import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../../lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }
    const bytes = await file.arrayBuffer()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `planejador/hoteis/hotel-${Date.now()}.${fileExtension}`
    const blob = await put(fileName, bytes, { access: 'public', contentType: file.type })
    return NextResponse.json({ imageUrl: blob.url }, { status: 200 })
  } catch (error) {
    console.error('Erro ao fazer upload da imagem do hotel:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
