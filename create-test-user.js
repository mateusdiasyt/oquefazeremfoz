const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/oquefazeremfoz"
    }
  }
})

async function createTestUser() {
  try {
    console.log('🔍 Criando usuário de teste...\n')
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Gerar ID único
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: 'test@test.com',
        name: 'Usuário Teste',
        password: hashedPassword,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Usuário criado com sucesso!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nome: ${user.name}`)
    
    // Criar role de admin para o usuário
    const roleId = 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    await prisma.userrole.create({
      data: {
        id: roleId,
        userId: user.id,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Role admin adicionada!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()