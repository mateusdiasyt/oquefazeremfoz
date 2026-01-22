const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminPassword() {
  try {
    console.log('🔧 Corrigindo senhas e roles dos usuários admin...')

    // Gerar hash correto da senha "admin123"
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Hash gerado:', hashedPassword)

    // Lista de emails dos usuários admin
    const adminEmails = ['admin@oqfoz.com.br', 'admin@oqfoz.com']

    for (const email of adminEmails) {
      console.log(`\n🔍 Processando usuário: ${email}`)

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userrole: true
        }
      })

      if (!user) {
        console.log(`❌ Usuário ${email} não encontrado`)
        continue
      }

      console.log(`✅ Usuário encontrado: ${user.name || email}`)

      // Atualizar senha
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      })
      console.log(`✅ Senha atualizada para: ${password}`)

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
        console.log(`✅ Role ADMIN adicionada`)
      } else {
        console.log(`✅ Role ADMIN já existe`)
      }

      // Verificar senha
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

      const isValid = await bcrypt.compare(password, testUser.password)
      console.log(`🔐 Teste de senha: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`)
      console.log(`🎭 Roles: ${testUser.userrole.map(r => r.role).join(', ') || 'Nenhuma'}`)
    }

    console.log('\n✅ Processo concluído!')
    console.log('\n📋 Credenciais:')
    console.log('   Email: admin@oqfoz.com.br (ou admin@oqfoz.com)')
    console.log(`   Senha: ${password}`)

  } catch (error) {
    console.error('❌ Erro:', error)
    if (error.message) {
      console.error('   Mensagem:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminPassword()
