import { NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'

// Upload pelo cliente: o arquivo vai direto do navegador para o Vercel Blob,
// sem passar pelo serverless – permite vídeos grandes (até 5 TB com multipart).
// Esta rota só recebe JSON (token) e devolve a resposta; o arquivo NÃO é enviado aqui.

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-msvideo',
]
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES],
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Erro no upload FozTV (handleUpload):', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar token de upload' },
      { status: 400 }
    )
  }
}
