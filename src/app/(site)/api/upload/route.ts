import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || (!user.roles.includes('COMPANY') && !user.roles.includes('ADMIN'))) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar tipo de arquivo
    const fileType = file.type
    const isImage = fileType.startsWith('image/')
    const isVideo = fileType.startsWith('video/')

    if (!isImage && !isVideo) {
      return NextResponse.json({ message: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    // Verificar tamanho do arquivo (5MB para imagens, 64MB para vídeos)
    const maxSize = isImage ? 5 * 1024 * 1024 : 64 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        message: `Arquivo muito grande. Máximo: ${isImage ? '5MB' : '64MB'}` 
      }, { status: 400 })
    }

    // Verificar tipos de arquivo específicos
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
    
    if (isImage && !allowedImageTypes.includes(fileType)) {
      return NextResponse.json({ 
        message: 'Tipo de imagem não suportado. Use: JPG, PNG, GIF ou WebP' 
      }, { status: 400 })
    }
    
    if (isVideo && !allowedVideoTypes.includes(fileType)) {
      return NextResponse.json({ 
        message: 'Tipo de vídeo não suportado. Use: MP4, AVI, MOV, WMV ou WebM' 
      }, { status: 400 })
    }

    // Converter File para ArrayBuffer
    const bytes = await file.arrayBuffer()

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
    
    // Determinar pasta de destino
    const uploadDir = isImage ? 'images' : 'videos'
    const fileName = `posts/${user.businessId || 'temp'}/${uploadDir}/${timestamp}_${randomString}.${fileExtension}`

    // Fazer upload para Vercel Blob Storage
    console.log('🔍 Fazendo upload de arquivo para Vercel Blob Storage...')
    const blob = await put(fileName, bytes, {
      access: 'public',
      contentType: fileType
    })

    console.log('✅ Arquivo enviado com sucesso:', blob.url)

    return NextResponse.json({ 
      message: 'Arquivo enviado com sucesso',
      url: blob.url,
      type: isImage ? 'image' : 'video'
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
