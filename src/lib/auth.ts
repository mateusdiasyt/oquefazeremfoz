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
    // Tentar inserir com updatedAt (se a coluna existir)
    await prisma.$executeRaw`
      INSERT INTO session (id, "userId", token, "expiresAt", "createdAt", "updatedAt")
      VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET token = ${token}, "expiresAt" = ${expiresAt}, "updatedAt" = NOW()
    `
  } catch (error: any) {
    // Se falhar por causa de updatedAt, tentar sem updatedAt
    if (error?.meta?.message?.includes('updatedAt') || error?.message?.includes('updatedAt')) {
      console.log('⚠️ Coluna updatedAt não existe, criando sessão sem ela...')
      try {
        await prisma.$executeRaw`
          INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
          VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW())
          ON CONFLICT (id) DO UPDATE
          SET token = ${token}, "expiresAt" = ${expiresAt}
        `
      } catch (retryError) {
        // Se ainda falhar, tentar sem ON CONFLICT
        console.error('❌ Erro ao criar sessão, tentando novamente sem ON CONFLICT...', retryError)
        await prisma.$executeRaw`
          INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
          VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW())
        `
      }
    } else {
      // Se ainda der erro, tentar novamente sem ON CONFLICT
      console.error('❌ Erro ao criar sessão, tentando novamente...', error)
      await prisma.$executeRaw`
        INSERT INTO session (id, "userId", token, "expiresAt", "createdAt")
        VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt}, NOW())
      `
    }
  }

  return token
}

export async function getCurrentUser(): Promise<{ id: string; email: string; name: string | null; profileImage: string | null; roles: string[]; businessId?: string; activeBusinessId?: string; businesses?: Array<{ id: string }>; createdAt?: string } | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
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
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  profileImage: true,
                  coverImage: true,
                  description: true,
                  category: true,
                  address: true,
                  phone: true,
                  website: true,
                  instagram: true,
                  facebook: true,
                  whatsapp: true,
                  isApproved: true,
                  isVerified: true,
                  likesCount: true,
                  createdAt: true,
                  updatedAt: true,
                  userId: true
                  // presentationVideo não incluído até migração ser executada
                },
                orderBy: { createdAt: 'desc' }
              },
              guide: {
                select: {
                  id: true,
                  profileImage: true
                }
              },
              userrole: true
            }
          }
        }
      })
    } catch (error: any) {
      // Se falhar, tentar buscar sem incluir activeBusinessId
      if (error.message && (error.message.includes('Unknown column') || error.message.includes('does not exist'))) {
        // Buscar usuário diretamente sem tentar incluir activeBusinessId
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                coverImage: true,
                description: true,
                category: true,
                address: true,
                phone: true,
                website: true,
                instagram: true,
                facebook: true,
                whatsapp: true,
                isApproved: true,
                isVerified: true,
                likesCount: true,
                createdAt: true,
                updatedAt: true,
                userId: true
                // presentationVideo não incluído até migração ser executada
              },
              orderBy: { createdAt: 'desc' }
            },
            guide: {
              select: {
                id: true,
                profileImage: true
              }
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

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    // Determinar empresa ativa (usa activeBusinessId ou primeira empresa)
    // Tentar acessar activeBusinessId de forma segura (pode não existir ainda no banco)
    const activeBusinessId = (session.user as any).activeBusinessId || null
    const activeBusiness = activeBusinessId 
      ? (session.user.business || []).find((b: any) => b.id === activeBusinessId) 
      : (session.user.business && session.user.business.length > 0 ? session.user.business[0] : null)

    // Foto de perfil: priorizar user.profileImage (aba Perfil), depois empresa/guia (fallback)
    const userRoles = session.user.userrole.map((ur: any) => ur.role)
    const guide = (session.user as any).guide?.[0] || null
    const profileImage = (session.user as any).profileImage ?? activeBusiness?.profileImage ?? guide?.profileImage ?? null

    const userData = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      profileImage,
      roles: userRoles,
      businessId: activeBusiness?.id, // Mantém compatibilidade
      activeBusinessId: activeBusinessId || activeBusiness?.id || undefined,
      businesses: (session.user.business || []).map((b: any) => ({ id: b.id })),
      createdAt: session.user.createdAt.toISOString()
    }
    
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

export function isGuide(userRoles: string[]): boolean {
  return hasRole(userRoles, 'GUIDE')
}
