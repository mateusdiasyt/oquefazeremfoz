import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export async function GET(request: NextRequest) {
  try {
    // Verificar se JWT_SECRET está configurado
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET não está definido')
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token não encontrado' },
        { status: 401 }
      )
    }

    // Verificar token JWT
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string, sessionId: string }
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar se a sessão existe no banco
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Sessão expirada' },
        { status: 401 }
      )
    }

    // Buscar usuário no banco
    // Primeiro tentar buscar com activeBusinessId, se falhar, buscar sem
    let user: any = null
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
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
    } catch (error) {
      // Se falhar (campo não existe), buscar sem activeBusinessId
      console.log('⚠️ Campo activeBusinessId não existe, buscando sem ele...')
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
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
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Determinar businessId ativo (usa activeBusinessId ou primeira empresa)
    const activeBusinessId = (user.activeBusinessId || (user.business && user.business.length > 0 ? user.business[0]?.id : undefined) || undefined) as string | undefined

    // Buscar profileImage: da empresa ativa ou do guia
    let profileImage: string | null = null
    if (activeBusinessId) {
      const business = await prisma.business.findFirst({
        where: { id: activeBusinessId, userId: session.userId },
        select: { profileImage: true }
      })
      profileImage = business?.profileImage ?? null
    }
    if (!profileImage) {
      const guide = await prisma.guide.findFirst({
        where: { userId: session.userId },
        select: { profileImage: true }
      })
      profileImage = guide?.profileImage ?? null
    }

    // Retornar dados do usuário
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage,
      roles: user.userrole.map((ur: any) => ur.role),
      businessId: activeBusinessId, // Mantém compatibilidade
      activeBusinessId: activeBusinessId,
      businesses: (user.business || []).map((b: any) => ({ id: b.id }))
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
