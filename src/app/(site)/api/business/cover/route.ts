import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import fs from 'fs'
import path from 'path'

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

    // Buscar a empresa do usuário
    const business = await prisma.business.findFirst({
      where: { userId: user.id }
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

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.name)
    const fileName = `${business.id}-${Date.now()}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Converter File para Buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    // URL da imagem
    const imageUrl = `/uploads/covers/${fileName}`

    // Atualizar a empresa com a nova capa
    await prisma.business.update({
      where: { id: business.id },
      data: { coverImage: imageUrl }
    })

    return NextResponse.json({
      message: 'Capa atualizada com sucesso',
      coverImage: imageUrl
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

    // Buscar a empresa do usuário
    const business = await prisma.business.findFirst({
      where: { userId: user.id },
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
