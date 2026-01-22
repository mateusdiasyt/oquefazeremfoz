const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/oquefazeremfoz"
    }
  }
})

async function testPasswords() {
  try {
    console.log('🔍 Verificando usuários no banco...\n')
    
    // 1. Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    })
    
    console.log(`📝 Usuários encontrados: ${users.length}\n`)
    
    for (const user of users) {
      console.log(`👤 Usuário: ${user.email}`)
      console.log(`   Nome: ${user.name}`)
      console.log(`   Hash da senha: ${user.password}`)
      console.log('')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPasswords()