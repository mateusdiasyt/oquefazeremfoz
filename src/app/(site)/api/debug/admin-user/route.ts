import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários admin usando queryRaw para evitar problemas com enum
    const adminUsersRaw = await prisma.$queryRaw<Array<{
      id: string
      email: string
      name: string | null
      password: string
      role: string
      createdAt: Date
      updatedAt: Date
    }>>`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.password,
        ur.role::text as role,
        u."createdAt",
        u."updatedAt"
      FROM "user" u
      INNER JOIN userrole ur ON ur."userId" = u.id
      WHERE ur.role = 'ADMIN'::text OR ur.role::text = 'ADMIN'
      GROUP BY u.id, u.email, u.name, u.password, ur.role, u."createdAt", u."updatedAt"
    `

    const adminUsers = adminUsersRaw.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      password: u.password,
      userrole: [{ role: u.role }],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))

    // Buscar também por emails específicos
    const emailVariants = ['admin@oqfoz.com.br', 'admin@oqfoz.com']
    const usersByEmail = await Promise.all(
      emailVariants.map(async (email) => {
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            userrole: {
              select: {
                role: true
              }
            }
          }
        })

        if (!user) return { email, exists: false }

        // Testar senha "admin123"
        const testPassword = 'admin123'
        const isValid = await bcrypt.compare(testPassword, user.password)

        return {
          email,
          exists: true,
          id: user.id,
          name: user.name,
          passwordHashLength: user.password.length,
          passwordHashPrefix: user.password.substring(0, 20) + '...',
          roles: user.userrole.map(r => r.role),
          passwordTest: {
            testPassword,
            isValid,
            error: isValid ? null : 'Senha não corresponde'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      adminUsers: adminUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        passwordHashLength: u.password.length,
        passwordHashPrefix: u.password.substring(0, 20) + '...',
        roles: u.userrole.map(r => r.role),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })),
      usersByEmail: usersByEmail,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
