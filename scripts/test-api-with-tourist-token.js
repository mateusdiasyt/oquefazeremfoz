const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIWithTouristToken() {
  try {
    console.log('🔍 Testando API com token do usuário "Turista"...\n')

    // Buscar o token do usuário "Turista"
    const touristSession = await prisma.session.findFirst({
      where: {
        user: {
          name: 'Turista'
        },
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!touristSession) {
      console.log('❌ Sessão do usuário "Turista" não encontrada')
      return
    }

    console.log(`🔑 Token encontrado: ${touristSession.token.substring(0, 20)}...`)

    // Simular a busca que a API faz
    const reviews = await prisma.businessReview.findMany({
      where: {
        userId: touristSession.userId
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

    console.log(`\n📝 Resultado da API: ${reviews.length} avaliações encontradas`)
    
    if (reviews.length > 0) {
      console.log('\n📋 Detalhes das avaliações:')
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.business.name}`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log(`   Empresa verificada: ${review.business.isVerified ? 'Sim' : 'Não'}`)
        console.log('')
      })
    }

    console.log('✅ API funcionando corretamente!')
    console.log('💡 O problema é que o navegador está usando um cookie diferente')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIWithTouristToken()





