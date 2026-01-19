import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isCompany } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profile-photos')
    await mkdir(uploadDir, { recursive: true })

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${business.id}-${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Converter para buffer e salvar
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Caminho relativo para salvar no banco
    const relativePath = `/uploads/profile-photos/${fileName}`

    // Atualizar no banco de dados
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: { profileImage: relativePath }
    })

    return NextResponse.json({ 
      message: 'Foto de perfil atualizada com sucesso',
      profileImage: relativePath 
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
