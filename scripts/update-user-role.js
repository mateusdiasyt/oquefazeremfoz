const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateUserRole() {
  try {
    // Atualizar o usuário para role ADMIN
    const user = await prisma.user.update({
      where: { email: 'mateusdiasyt@hotmail.com' },
      data: { role: 'ADMIN' }
    })
    
    console.log('Usuário atualizado:', user)
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole()






