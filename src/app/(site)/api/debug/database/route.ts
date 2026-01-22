import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verificar qual DATABASE_URL está sendo usada (sem mostrar senha)
    const dbUrl = process.env.DATABASE_URL || ''
    const dbInfo = dbUrl ? {
      host: dbUrl.includes('neon.tech') ? 'Neon.tech' : dbUrl.includes('hostinger') ? 'Hostinger' : 'Desconhecido',
      isNeon: dbUrl.includes('neon.tech'),
      isHostinger: dbUrl.includes('hostinger'),
      urlLength: dbUrl.length,
      // Mostrar apenas hostname, sem senha
      urlSafe: dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
    } : { error: 'DATABASE_URL não configurada' }

    // Testar conexão com o banco
    let connectionTest = {
      connected: false,
      error: null as string | null,
      tableCount: 0,
      userCount: 0
    }

    try {
      // Contar tabelas (teste simples)
      const tableCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      ` as [{ count: bigint }]

      // Contar usuários
      const userCount = await prisma.user.count()

      connectionTest = {
        connected: true,
        error: null,
        tableCount: Number(tableCount[0]?.count || 0),
        userCount
      }
    } catch (error) {
      connectionTest = {
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        tableCount: 0,
        userCount: 0
      }
    }

    return NextResponse.json({
      success: true,
      database: dbInfo,
      connection: connectionTest,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
