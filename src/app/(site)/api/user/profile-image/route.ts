import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { getCurrentUser } from '../../../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST - Upload da foto de perfil do usuário
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ message: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Verificar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'users')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Atualizar banco de dados
    const profileImageUrl = `/uploads/users/${fileName}`
    
    // Atualizar profileImage da empresa do usuário
    if (user.businessId) {
      await prisma.business.update({
        where: { id: user.businessId },
        data: { profileImage: profileImageUrl }
      })
    } else {
      return NextResponse.json({ message: 'Usuário não possui empresa' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Foto de perfil atualizada com sucesso',
      profileImage: profileImageUrl
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
