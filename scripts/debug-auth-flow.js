const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugAuthFlow() {
  try {
    console.log('🔍 Debugando fluxo de autenticação...\n')

    // 1. Verificar todas as sessões ativas
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

    console.log(`📝 Sessões ativas: ${activeSessions.length}`)
    activeSessions.forEach((session, index) => {
      const roles = session.user.userRoles.map(ur => ur.role).join(', ')
      console.log(`${index + 1}. ${session.user.name || session.user.email}`)
      console.log(`   ID: ${session.user.id}`)
      console.log(`   Roles: ${roles}`)
      console.log(`   Token: ${session.token.substring(0, 20)}...`)
      console.log(`   Expira em: ${session.expiresAt}`)
      console.log('')
    })

    // 2. Verificar especificamente o usuário "Turista"
    const touristUser = await prisma.user.findFirst({
      where: {
        name: 'Turista'
      },
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
    })

    if (touristUser) {
      console.log(`\n👤 Usuário "Turista" encontrado:`)
      console.log(`   ID: ${touristUser.id}`)
      console.log(`   Email: ${touristUser.email}`)
      console.log(`   Roles: ${touristUser.userRoles.map(ur => ur.role).join(', ')}`)

      // 3. Verificar avaliações deste usuário
      const reviews = await prisma.businessReview.findMany({
        where: {
          userId: touristUser.id
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              profileImage: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log(`\n📝 Avaliações do usuário "Turista": ${reviews.length}`)
      if (reviews.length > 0) {
        reviews.forEach((review, index) => {
          console.log(`${index + 1}. ${review.business.name}`)
          console.log(`   Nota: ${review.rating} estrelas`)
          console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
          console.log(`   Data: ${review.createdAt}`)
          console.log(`   Empresa verificada: ${review.business.isVerified ? 'Sim' : 'Não'}`)
          console.log('')
        })
      }

      // 4. Verificar se há sessão ativa para este usuário
      const touristSession = await prisma.session.findFirst({
        where: {
          userId: touristUser.id,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (touristSession) {
        console.log(`\n🔑 Sessão ativa do usuário "Turista":`)
        console.log(`   Token: ${touristSession.token}`)
        console.log(`   Expira em: ${touristSession.expiresAt}`)
      } else {
        console.log(`\n❌ Nenhuma sessão ativa para o usuário "Turista"`)
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuthFlow()





