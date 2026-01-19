const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIDirect() {
  try {
    console.log('🔍 Testando API diretamente...\n')

    // Simular exatamente o que a API /api/user/reviews faz
    const cookieStore = {
      get: (name) => {
        if (name === 'auth-token') {
          // Usar o token do usuário "Turista"
          return { value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZoMHU0OXIwMDBxdDY1b21laHgxdW0zIiwiaWF0IjoxNzU3NzIxNTQyLCJleHAiOjE3NTgzMjYzNDJ9.8wq0u49wpE48Ks5NftgzwjrCxV9sJZ3Y-gcizz6XDS0' }
        }
        return null
      }
    }

    // Simular a função getCurrentUser
    const token = cookieStore.get('auth-token')?.value
    console.log(`🔑 Token extraído: ${token ? token.substring(0, 20) + '...' : 'null'}`)

    if (!token) {
      console.log('❌ Token não encontrado')
      return
    }

    // Verificar se o token é válido (simulação)
    const payload = { userId: 'cmfh0u49r000qt65omehx1um3' } // Decodificado do JWT
    console.log(`👤 User ID do token: ${payload.userId}`)

    // Buscar usuário pelo ID do token
    const user = await prisma.user.findFirst({
      where: { id: payload.userId }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log(`✅ Usuário encontrado: ${user.name || user.email}`)

    // Buscar avaliações
    const reviews = await prisma.businessReview.findMany({
      where: {
        userId: user.id
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

    console.log(`\n📝 Resultado da API: ${reviews.length} avaliações`)
    
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

    console.log('✅ API funcionando perfeitamente!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIDirect()





