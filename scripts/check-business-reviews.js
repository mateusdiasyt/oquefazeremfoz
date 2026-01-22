const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBusinessReviews() {
  try {
    console.log('🔍 Verificando avaliações de empresas (BusinessReview)...\n')

    // Buscar todas as avaliações de empresas
    const reviews = await prisma.businessReview.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📝 Total de avaliações de empresas: ${reviews.length}\n`)

    if (reviews.length > 0) {
      console.log('📋 Detalhes das avaliações:')
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.user.name || review.user.email}`)
        console.log(`   Empresa: ${review.business.name} (${review.business.slug})`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhuma avaliação de empresa encontrada no banco de dados')
    }

    // Verificar especificamente o usuário turista
    const users = await prisma.user.findMany({
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

    const touristUser = users.find(user => user.userRoles.some(ur => ur.role === 'TOURIST'))
    if (touristUser) {
      console.log(`\n🔍 Verificando avaliações do usuário turista (${touristUser.name || touristUser.email}):`)
      
      const touristReviews = await prisma.businessReview.findMany({
        where: {
          userId: touristUser.id
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

      console.log(`📝 Avaliações do turista: ${touristReviews.length}`)
      
      if (touristReviews.length > 0) {
        touristReviews.forEach((review, index) => {
          console.log(`${index + 1}. ${review.business.name} - ${review.rating} estrelas`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBusinessReviews()





