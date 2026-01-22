const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentUser() {
  try {
    console.log('🔍 Verificando usuário atual logado...\n')

    // Buscar todas as sessões ativas
    const activeSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userRoles: {
              select: {
                role: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📝 Sessões ativas: ${activeSessions.length}\n`)

    if (activeSessions.length > 0) {
      console.log('👥 Usuários logados:')
      activeSessions.forEach((session, index) => {
        const roles = session.user.userRoles.map(ur => ur.role).join(', ')
        console.log(`${index + 1}. ${session.user.name || session.user.email}`)
        console.log(`   ID: ${session.user.id}`)
        console.log(`   Roles: ${roles}`)
        console.log(`   Token: ${session.token.substring(0, 20)}...`)
        console.log(`   Expira em: ${session.expiresAt}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhuma sessão ativa encontrada')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()





