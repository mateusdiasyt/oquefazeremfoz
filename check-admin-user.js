require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@oqfoz.com' },
      include: { userrole: true }
    })

    if (user) {
      console.log('✅ Usuário admin encontrado:')
      console.log('ID:', user.id)
      console.log('Email:', user.email)
      console.log('Nome:', user.name)
      console.log('Senha:', user.password)
      console.log('Roles:', user.userrole.map(ur => ur.role))
    } else {
      console.log('❌ Usuário admin não encontrado')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Erro ao verificar usuário admin:', error)
    await prisma.$disconnect()
  }
}

checkAdminUser()