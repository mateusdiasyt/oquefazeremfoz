const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIWithCorrectUser() {
  try {
    console.log('🔍 Testando API com o usuário correto...\n')

    // Buscar o usuário "Turista" que fez a avaliação
    const touristUser = await prisma.user.findFirst({
      where: {
        name: 'Turista'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!touristUser) {
      console.log('❌ Usuário "Turista" não encontrado')
      return
    }

    console.log(`👤 Usuário encontrado: ${touristUser.name} (ID: ${touristUser.id})`)

    // Simular a busca que a API faz com o ID correto
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

testAPIWithCorrectUser()





