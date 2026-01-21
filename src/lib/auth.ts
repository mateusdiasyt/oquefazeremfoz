import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, sessionId?: string): string {
  if (sessionId) {
    return jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: '7d' })
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  // Gerar ID único para a sessão
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Gerar token incluindo sessionId
  const token = generateToken(userId, sessionId)
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

  // Usar query raw para evitar problemas com cache do Prisma após alteração de schema
  try {
    await prisma.$executeRaw`
      INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
      VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET token = ${token}, "expiresAt" = ${expiresAt}, "updatedAt" = NOW()
    `
  } catch (error) {
    // Se ainda der erro, tentar novamente sem ON CONFLICT
    console.error('❌ Erro ao criar sessão, tentando novamente...', error)
    await prisma.$executeRaw`
      INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
      VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW())
    `
  }

  return token
}

export async function getCurrentUser(): Promise<{ id: string; email: string; name: string | null; profileImage: string | null; roles: string[]; businessId?: string; activeBusinessId?: string; businesses?: Array<{ id: string }>; createdAt?: string } | null> {
  try {
    console.log('🔍 getCurrentUser: Iniciando verificação')
    
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    console.log('🔑 Token encontrado:', !!token)

    if (!token) {
      console.log('❌ Nenhum token encontrado')
      return null
    }

    const payload = verifyToken(token)
    console.log('🔓 Token válido:', !!payload, payload ? `userId: ${payload.userId}` : '')
    if (!payload) {
      console.log('❌ Token inválido')
      return null
    }

    console.log('🔍 Buscando sessão no banco de dados...')
    
    // Buscar sessão sem activeBusinessId primeiro (campo pode não existir)
    let session: any = null
    try {
      session = await prisma.session.findFirst({
        where: { 
          userId: payload.userId,
          expiresAt: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        include: { 
          user: {
            include: {
              business: {
                orderBy: { createdAt: 'desc' }
              },
              userrole: true
            }
          }
        }
      })
    } catch (error: any) {
      // Se falhar, tentar buscar sem incluir activeBusinessId
      if (error.message && (error.message.includes('Unknown column') || error.message.includes('does not exist'))) {
        console.log('⚠️ Campo activeBusinessId não existe, buscando sem ele...')
        // Buscar usuário diretamente sem tentar incluir activeBusinessId
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            business: {
              orderBy: { createdAt: 'desc' }
            },
            userrole: true
          }
        })
        
        if (!user) {
          return null
        }
        
        const sessionWithoutUser = await prisma.session.findFirst({
          where: { 
            userId: payload.userId,
            expiresAt: { gte: new Date() }
          },
          orderBy: { createdAt: 'desc' }
        })
        
        if (!sessionWithoutUser) {
          return null
        }
        
        session = {
          ...sessionWithoutUser,
          user
        }
      } else {
        throw error
      }
    }

    console.log('📊 Sessão encontrada:', !!session)
    if (session) {
      console.log('📅 Sessão expira em:', session.expiresAt)
      console.log('⏰ Data atual:', new Date())
      console.log('✅ Sessão válida:', session.expiresAt >= new Date())
      console.log('👤 Usuário da sessão:', { id: session.user.id, email: session.user.email })
      console.log('🎭 Roles do usuário:', session.user.userrole.map((ur: any) => ur.role))
      console.log('🏢 Empresas do usuário:', session.user.business?.length || 0)
    }

    if (!session || session.expiresAt < new Date()) {
      console.log('❌ Sessão não encontrada ou expirada')
      return null
    }

    // Determinar empresa ativa (usa activeBusinessId ou primeira empresa)
    // Tentar acessar activeBusinessId de forma segura (pode não existir ainda no banco)
    const activeBusinessId = (session.user as any).activeBusinessId || null
    const activeBusiness = activeBusinessId 
      ? (session.user.business || []).find((b: any) => b.id === activeBusinessId) 
      : (session.user.business && session.user.business.length > 0 ? session.user.business[0] : null)

    const userData = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      profileImage: activeBusiness?.profileImage || null,
      roles: session.user.userrole.map((ur: any) => ur.role),
      businessId: activeBusiness?.id, // Mantém compatibilidade
      activeBusinessId: activeBusinessId || activeBusiness?.id || undefined,
      businesses: (session.user.business || []).map((b: any) => ({ id: b.id })),
      createdAt: session.user.createdAt.toISOString()
    }
    
    console.log('✅ Retornando dados do usuário:', userData)
    return userData
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      })
    }
  } catch {
    // Ignore errors
  }
}

// Funções auxiliares para verificar roles
export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role)
}

export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  return roles.some(role => userRoles.includes(role))
}

export function isAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, 'ADMIN')
}

export function isCompany(userRoles: string[]): boolean {
  return hasRole(userRoles, 'COMPANY')
}

export function isTourist(userRoles: string[]): boolean {
  return hasRole(userRoles, 'TOURIST')
}
