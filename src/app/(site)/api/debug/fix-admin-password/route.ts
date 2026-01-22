import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando correção de senhas admin...')

    // Gerar hash correto da senha "admin123"
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Hash gerado:', hashedPassword)

    const adminEmails = ['admin@oqfoz.com.br', 'admin@oqfoz.com']
    const results = []

    for (const email of adminEmails) {
      console.log(`\n🔍 Processando: ${email}`)

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userrole: true
        }
      })

      if (!user) {
        results.push({ email, status: 'not_found', error: 'Usuário não encontrado' })
        continue
      }

      // Atualizar senha
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      // Verificar se já tem role ADMIN
      const hasAdminRole = user.userrole.some(ur => ur.role === 'ADMIN')

      if (!hasAdminRole) {
        // Adicionar role ADMIN
        await prisma.userrole.create({
          data: {
            id: `admin-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            role: 'ADMIN'
          }
        })
      }

      // Testar senha
      const testUser = await prisma.user.findUnique({
        where: { email },
        select: {
          password: true,
          userrole: {
            select: {
              role: true
            }
          }
        }
      })

      const isValid = await bcrypt.compare(password, testUser!.password)

      results.push({
        email,
        status: 'success',
        name: user.name,
        passwordUpdated: true,
        roleAdded: !hasAdminRole,
        passwordTest: isValid,
        roles: testUser!.userrole.map(r => r.role),
        passwordHash: hashedPassword.substring(0, 20) + '...'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Senhas e roles corrigidos com sucesso!',
      password: password,
      hash: hashedPassword,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
