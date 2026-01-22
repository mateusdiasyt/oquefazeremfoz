const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFollowersAPI() {
  try {
    console.log('🧪 Testando API de seguidores...\n')

    // 1. Buscar a empresa "Republica Arcade"
    const republicaArcade = await prisma.business.findFirst({
      where: {
        name: 'Republica Arcade'
      },
      select: {
        id: true,
        name: true,
        followersCount: true
      }
    })

    if (!republicaArcade) {
      console.log('❌ Empresa "Republica Arcade" não encontrada')
      return
    }

    console.log(`🏢 Empresa: ${republicaArcade.name} (ID: ${republicaArcade.id})`)
    console.log(`📊 Contador: ${republicaArcade.followersCount}`)

    // 2. Simular a chamada da API
    const businessId = republicaArcade.id
    
    // Buscar seguidores usando BusinessLike (como na API)
    const businessLikes = await prisma.businessLike.findMany({
      where: {
        businessId: businessId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    console.log(`\n👥 Seguidores encontrados: ${businessLikes.length}`)
    
    if (businessLikes.length > 0) {
      console.log('\n📋 Detalhes dos seguidores:')
      businessLikes.forEach((like, index) => {
        console.log(`${index + 1}. ${like.user.name || like.user.email}`)
        console.log(`   Email: ${like.user.email}`)
        console.log(`   ID: ${like.user.id}`)
        console.log('')
      })
    }

    // 3. Formatar como a API faria
    const followers = businessLikes.map(like => ({
      id: like.user.id,
      name: like.user.name || like.user.email,
      email: like.user.email,
      profileImage: null, // User não tem profileImage no schema
      followedAt: like.id // Usando ID como referência temporal
    }))

    console.log('📤 Dados que a API retornaria:')
    console.log(JSON.stringify({ followers, total: followers.length }, null, 2))

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFollowersAPI()
