const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkReviewWithCorrectBusinessId() {
  try {
    console.log('🔍 Verificando avaliação com ID correto da empresa...\n')

    // 1. Buscar o usuário "Turista"
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

    console.log(`👤 Usuário "Turista": ${touristUser.name} (ID: ${touristUser.id})`)

    // 2. Buscar todas as avaliações do usuário "Turista"
    const allReviews = await prisma.businessReview.findMany({
      where: {
        userId: touristUser.id
      },
      include: {
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

    console.log(`\n📝 Total de avaliações do usuário "Turista": ${allReviews.length}`)
    
    if (allReviews.length > 0) {
      allReviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.business.name} (${review.business.slug})`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log('')
      })
    }

    // 3. Buscar todas as empresas com nome similar
    const businesses = await prisma.business.findMany({
      where: {
        name: {
          contains: 'Republica'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    console.log(`\n🏢 Empresas com "Republica" no nome: ${businesses.length}`)
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.slug}) - ID: ${business.id}`)
    })

    // 4. Verificar se há avaliação para qualquer uma dessas empresas
    for (const business of businesses) {
      const review = await prisma.businessReview.findFirst({
        where: {
          userId: touristUser.id,
          businessId: business.id
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true
        }
      })

      if (review) {
        console.log(`\n⭐ Avaliação encontrada para ${business.name}:`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkReviewWithCorrectBusinessId()





