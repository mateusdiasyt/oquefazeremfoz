import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

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

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        userrole: {
          select: {
            role: true
          }
        },
        business: {
          select: {
            id: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Processar roles
    const roles = user.userrole.map(ur => ur.role)

    // Gerar token JWT
    const sessionId = randomUUID()
    const token = jwt.sign(
      { userId: user.id, sessionId },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Criar sessão no banco
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    })

    // Configurar cookie
    const response = NextResponse.json({
      success: true,
      token, // Retornar token no corpo da resposta
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        businessId: user.business?.id || undefined
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
    console.error('Erro no login:', error)
    
    // Fornecer mais detalhes do erro em desenvolvimento
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? errorMessage 
      : 'Erro interno do servidor'
    
    return NextResponse.json(
      { error: errorDetails },
      { status: 500 }
    )
  }
}
