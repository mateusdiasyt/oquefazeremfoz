const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllReviews() {
  try {
    console.log('🔍 Verificando todas as avaliações no banco...\n')

    // 1. Buscar todas as avaliações
    const allReviews = await prisma.businessReview.findMany({
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

    console.log(`📝 Total de avaliações no banco: ${allReviews.length}\n`)

    if (allReviews.length > 0) {
      console.log('📋 Detalhes de todas as avaliações:')
      allReviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.user.name || review.user.email}`)
        console.log(`   Empresa: ${review.business.name} (${review.business.slug})`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log('')
      })
    }

    // 2. Verificar se há avaliação para República Arcade
    const republicaReviews = await prisma.businessReview.findMany({
      where: {
        business: {
          name: 'Republica Arcade'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`\n🏢 Avaliações para "Republica Arcade": ${republicaReviews.length}`)
    
    if (republicaReviews.length > 0) {
      republicaReviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.user.name || review.user.email}`)
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

checkAllReviews()





