import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

// Fix: Clear Prisma connection cache after schema change

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('⚠️ JWT_SECRET não está definido nas variáveis de ambiente!')
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se JWT_SECRET está configurado
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET não está definido')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Log de debug: verificar qual banco está sendo usado
    const dbUrl = process.env.DATABASE_URL || ''
    const isNeon = dbUrl.includes('neon.tech')
    console.log('🔍 DEBUG LOGIN:', {
      email,
      database: isNeon ? 'Neon.tech' : dbUrl.includes('hostinger') ? 'Hostinger' : 'Desconhecido',
      dbUrlLength: dbUrl.length
    })

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        activeBusinessId: true,
        userrole: {
          select: {
            role: true
          }
        },
        business: {
          select: {
            id: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    console.log('🔍 DEBUG USER:', {
      found: !!user,
      email: user?.email,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length || 0,
      passwordHash: user?.password?.substring(0, 10) + '...',
      rolesCount: user?.userrole?.length || 0
    })

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔍 DEBUG PASSWORD:', {
      isValid: isValidPassword,
      passwordProvided: password.substring(0, 3) + '...',
      hashInDb: user.password.substring(0, 20) + '...'
    })

    if (!isValidPassword) {
      console.log('❌ Senha inválida')
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Processar roles
    const roles = user.userrole?.map(ur => ur.role) || []
    console.log('🔍 DEBUG ROLES:', { roles, rolesCount: roles.length })

    // Gerar token JWT
    const sessionId = randomUUID()
    console.log('🔍 DEBUG SESSION:', { sessionId })
    
    let token
    try {
      token = jwt.sign(
        { userId: user.id, sessionId },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      console.log('✅ Token JWT gerado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao gerar token JWT:', error)
      throw error
    }

    // Criar sessão no banco usando query raw para evitar problemas de cache
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    
    try {
      console.log('🔍 Tentando criar sessão no banco...')
      
      // Usar query raw para evitar problemas com cache do Prisma após alteração de schema
      await prisma.$executeRaw`
        INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
        VALUES (${sessionId}, ${user.id}, ${token}, ${expiresAt}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET token = ${token}, "expiresAt" = ${expiresAt}, "updatedAt" = NOW()
      `
      console.log('✅ Sessão criada no banco com sucesso')
    } catch (error) {
      console.error('❌ Erro ao criar sessão no banco:', error)
      // Se ainda der erro, tentar novamente (pode ser problema temporário de cache)
      try {
        console.log('🔄 Tentando criar sessão novamente...')
        await prisma.$executeRaw`
          INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
          VALUES (${sessionId}, ${user.id}, ${token}, ${expiresAt}, NOW())
        `
        console.log('✅ Sessão criada na segunda tentativa')
      } catch (retryError) {
        console.error('❌ Erro ao criar sessão mesmo na segunda tentativa:', retryError)
        throw retryError
      }
    }

    // Determinar empresa ativa (usa activeBusinessId ou primeira empresa)
    const activeBusinessId = user.activeBusinessId || (user.business && user.business.length > 0 ? user.business[0]?.id : undefined) || undefined

    // Configurar cookie
    const response = NextResponse.json({
      success: true,
      token, // Retornar token no corpo da resposta
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        businessId: activeBusinessId, // Mantém compatibilidade
        activeBusinessId: activeBusinessId,
        businesses: (user.business || []).map(b => ({ id: b.id }))
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response

  } catch (error) {
    console.error('❌ Erro no login:', error)
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'Sem stack trace')
    console.error('❌ Tipo do erro:', typeof error)
    console.error('❌ Erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Fornecer mais detalhes do erro em desenvolvimento
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorDetails = process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : errorMessage
    
    return NextResponse.json(
      { 
        error: errorDetails,
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: errorStack,
          message: errorMessage 
        })
      },
      { status: 500 }
    )
  }
}
