const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUserReviewsAPI() {
  try {
    console.log('🔍 Testando API de avaliações do usuário...\n')

    // Buscar o usuário turista
    const touristUser = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            role: 'TOURIST'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!touristUser) {
      console.log('❌ Usuário turista não encontrado')
      return
    }

    console.log(`👤 Usuário turista encontrado: ${touristUser.name || touristUser.email} (ID: ${touristUser.id})`)

    // Simular a busca que a API faz
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

    console.log(`\n📝 Avaliações encontradas: ${reviews.length}`)
    
    if (reviews.length > 0) {
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.business.name}`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserReviewsAPI()





