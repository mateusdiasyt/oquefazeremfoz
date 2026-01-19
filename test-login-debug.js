require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Testando conexão e login...\n')
    
    // 1. Testar conexão
    console.log('1. Testando conexão com banco...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida\n')
    
    // 2. Verificar se existe algum usuário
    console.log('2. Verificando usuários existentes...')
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        userrole: true
      }
    })
    console.log(`📝 Usuários encontrados: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.userrole.map(ur => ur.role).join(', ')})`)
    })
    console.log('')
    
    // 3. Testar busca específica
    console.log('3. Testando busca por email específico...')
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' },
      include: {
        userrole: true
      }
    })
    
    if (testUser) {
      console.log('✅ Usuário test@test.com encontrado')
      console.log(`   Nome: ${testUser.name}`)
      console.log(`   Roles: ${testUser.userrole.map(ur => ur.role).join(', ')}`)
    } else {
      console.log('❌ Usuário test@test.com não encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()