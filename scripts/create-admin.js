const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

function generateId() {
  return crypto.randomUUID()
}

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔍 Verificando se já existe um usuário admin...')
    
    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        userrole: {
          some: {
            role: 'ADMIN'
          }
        }
      },
      include: {
        userrole: true
      }
    })

    if (existingAdmin) {
      console.log('✅ Usuário admin já existe:', existingAdmin.email)
      return
    }

    // Criar novo usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const userId = generateId()
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: "admin@oqfoz.com",
        password: hashedPassword,
        name: "Administrador",
        updatedAt: new Date()
      }
    })

    // Criar role de admin
    await prisma.userrole.create({
      data: {
        id: generateId(),
        userId: userId,
        role: 'ADMIN'
      }
    })

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Senha: admin123')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()






