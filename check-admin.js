const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    // Buscar o usuário admin@oqfoz.com
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@oqfoz.com'
      },
      include: {
        userrole: true
      }
    })

    if (!user) {
      console.log('❌ Usuário admin@oqfoz.com não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Nome:', user.name)
    console.log('Roles:', user.userrole.map(r => r.role))

    const isAdmin = user.userrole.some(r => r.role === 'ADMIN')
    console.log('É Admin?', isAdmin ? '✅ SIM' : '❌ NÃO')

    if (!isAdmin) {
      console.log('\n🔧 Adicionando role ADMIN...')
      await prisma.userrole.create({
        data: {
          id: `admin-role-${Date.now()}`,
          userId: user.id,
          role: 'ADMIN'
        }
      })
      console.log('✅ Role ADMIN adicionada com sucesso!')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()