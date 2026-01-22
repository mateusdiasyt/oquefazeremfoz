import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { hashPassword, createSession } from '../../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'TOURIST' } = await request.json()

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar role
    if (!['TOURIST', 'COMPANY', 'ADMIN', 'GUIDE'].includes(role)) {
      return NextResponse.json(
        { error: 'Tipo de conta inválido' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Criar usuário
    const hashedPassword = await hashPassword(password)
    
    // Mapear role para o enum correto
    let userRole: 'TOURIST' | 'COMPANY' | 'ADMIN' | 'GUIDE' = 'TOURIST'
    if (role === 'COMPANY') {
      userRole = 'COMPANY'
    } else if (role === 'ADMIN') {
      userRole = 'ADMIN'
    } else if (role === 'GUIDE') {
      userRole = 'GUIDE'
    }
    
    // Gerar ID único para o usuário
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const roleId = 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name: name || null,
        updatedAt: new Date(),
        userrole: {
          create: {
            id: roleId,
            role: userRole
          }
        }
      },
      include: {
        userrole: true
      }
    })

    // Criar sessão e token
    const token = await createSession(user.id)

    // Configurar cookie
    const response = NextResponse.json(
      { 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          roles: user.userrole.map(ur => ur.role)
        } 
      },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
