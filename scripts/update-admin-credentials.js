const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateAdminCredentials() {
  try {
    // Atualizar o usuário com as credenciais corretas
    const hashedPassword = await bcrypt.hash('Vanguarda@2021', 12)
    
    const user = await prisma.user.update({
      where: { email: 'mateusdiasyt@hotmail.com' },
      data: { 
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Mateus Admin'
      }
    })
    
    console.log('Usuário admin atualizado com sucesso:')
    console.log('Email:', user.email)
    console.log('Nome:', user.name)
    console.log('Role:', user.role)
    console.log('Senha atualizada para: Vanguarda@2021')
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminCredentials()






