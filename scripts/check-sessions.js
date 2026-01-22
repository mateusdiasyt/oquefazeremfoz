const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSessions() {
  try {
    const sessions = await prisma.session.findMany({
      include: { user: true }
    })
    
    console.log('Sessions encontradas:', sessions.length)
    sessions.forEach(session => {
      console.log('Session:', {
        id: session.id,
        userId: session.userId,
        token: session.token.substring(0, 20) + '...',
        expiresAt: session.expiresAt,
        user: {
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        }
      })
    })
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSessions()






