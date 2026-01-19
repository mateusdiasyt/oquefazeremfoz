import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '../../../../../lib/auth'

// Função para obter estatísticas de uso de espaço
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.roles.includes('ADMIN')) {
      return NextResponse.json({ message: 'Apenas administradores podem ver estatísticas' }, { status: 401 })
    }

    const uploadDirs = ['images', 'videos']
    let totalSize = 0
    let totalFiles = 0
    const stats = {
      images: { count: 0, size: 0 },
      videos: { count: 0, size: 0 }
    }

    for (const dir of uploadDirs) {
      const uploadPath = join(process.cwd(), 'public', 'uploads', dir)
      
      try {
        const files = await readdir(uploadPath)
        
        for (const file of files) {
          const filePath = join(uploadPath, file)
          const fileStats = await stat(filePath)
          
          totalSize += fileStats.size
          totalFiles++
          stats[dir as keyof typeof stats].count++
          stats[dir as keyof typeof stats].size += fileStats.size
        }
      } catch (error) {
        console.error(`Erro ao ler diretório ${dir}:`, error)
      }
    }

    // Converter bytes para MB
    const formatBytes = (bytes: number) => {
      return (bytes / (1024 * 1024)).toFixed(2)
    }

    return NextResponse.json({
      totalFiles,
      totalSize: totalSize,
      totalSizeMB: formatBytes(totalSize),
      breakdown: {
        images: {
          count: stats.images.count,
          size: stats.images.size,
          sizeMB: formatBytes(stats.images.size)
        },
        videos: {
          count: stats.videos.count,
          size: stats.videos.size,
          sizeMB: formatBytes(stats.videos.size)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

