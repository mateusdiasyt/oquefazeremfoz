const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkToken() {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZjbjN3cnowMDA1dDZvb3U4aWhjOGl0IiwiaWF0IjoxNzU3NDI4NjA2LCJleHAiOjE3NTgwMzM0MDZ9.0_KUnUt8Klvac9rxi6i-mxFZUK5g8FjIoScZKhRfx5k"
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (session) {
      console.log('Sessão encontrada:', {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        user: {
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        }
      })
    } else {
      console.log('Sessão não encontrada para o token')
    }
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkToken()






