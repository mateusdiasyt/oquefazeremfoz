import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '../../../../../lib/auth'

// Função para limpar arquivos antigos (mais de 30 dias)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.roles.includes('ADMIN')) {
      return NextResponse.json({ message: 'Apenas administradores podem executar limpeza' }, { status: 401 })
    }

    const uploadDirs = ['images', 'videos']
    let totalDeleted = 0
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 dias em ms

    for (const dir of uploadDirs) {
      const uploadPath = join(process.cwd(), 'public', 'uploads', dir)
      
      try {
        const files = await readdir(uploadPath)
        
        for (const file of files) {
          const filePath = join(uploadPath, file)
          const stats = await stat(filePath)
          
          // Se o arquivo for mais antigo que 30 dias, deletar
          if (stats.mtime.getTime() < thirtyDaysAgo) {
            await unlink(filePath)
            totalDeleted++
          }
        }
      } catch (error) {
        console.error(`Erro ao limpar diretório ${dir}:`, error)
      }
    }

    return NextResponse.json({ 
      message: `Limpeza concluída. ${totalDeleted} arquivos removidos.`,
      deletedFiles: totalDeleted
    })

  } catch (error) {
    console.error('Erro na limpeza:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

