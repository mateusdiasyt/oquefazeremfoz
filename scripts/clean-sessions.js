const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanSessions() {
  try {
    console.log('🧹 Limpando sessões antigas...\n')

    // Deletar todas as sessões expiradas
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`🗑️ Sessões expiradas removidas: ${expiredSessions.count}`)

    // Deletar todas as sessões do usuário "Administrador" (exceto a mais recente)
    const adminSessions = await prisma.session.findMany({
      where: {
        user: {
          name: 'Administrador'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (adminSessions.length > 1) {
      const sessionsToDelete = adminSessions.slice(1) // Manter apenas a mais recente
      for (const session of sessionsToDelete) {
        await prisma.session.delete({
          where: { id: session.id }
        })
      }
      console.log(`🗑️ Sessões antigas do Administrador removidas: ${sessionsToDelete.length}`)
    }

    // Verificar sessões ativas restantes
    const activeSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n📝 Sessões ativas restantes: ${activeSessions.length}`)
    activeSessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.user.name || session.user.email} - Expira em: ${session.expiresAt}`)
    })

    console.log('\n✅ Limpeza concluída!')
    console.log('💡 Agora faça logout e login novamente com a conta "Turista"')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanSessions()





