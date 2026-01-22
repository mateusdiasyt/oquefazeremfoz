const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentSession() {
  try {
    console.log('🔍 Verificando sessão atual...\n')

    // Buscar a sessão mais recente do usuário "Turista"
    const touristSession = await prisma.session.findFirst({
      where: {
        user: {
          name: 'Turista'
        },
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

    if (touristSession) {
      console.log('👤 Sessão do usuário "Turista" encontrada:')
      console.log(`   Nome: ${touristSession.user.name}`)
      console.log(`   Email: ${touristSession.user.email}`)
      console.log(`   ID: ${touristSession.user.id}`)
      console.log(`   Roles: ${touristSession.user.userRoles.map(ur => ur.role).join(', ')}`)
      console.log(`   Token: ${touristSession.token}`)
      console.log(`   Expira em: ${touristSession.expiresAt}`)
      console.log('')
      
      // Verificar avaliações deste usuário
      const reviews = await prisma.businessReview.findMany({
        where: {
          userId: touristSession.user.id
        },
        include: {
          business: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      })

      console.log(`📝 Avaliações do usuário "Turista": ${reviews.length}`)
      if (reviews.length > 0) {
        reviews.forEach((review, index) => {
          console.log(`${index + 1}. ${review.business.name} - ${review.rating} estrelas`)
        })
      }
    } else {
      console.log('❌ Nenhuma sessão ativa do usuário "Turista" encontrada')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentSession()





