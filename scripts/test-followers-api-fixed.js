const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFollowersAPIFixed() {
  try {
    console.log('🧪 Testando API de seguidores corrigida...\n')

    const businessId = 'cmfcsmxnr000et6ac3bg5ccu2' // República Arcade

    // Simular a lógica da API
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

    console.log(`👥 BusinessLikes encontrados: ${businessLikes.length}`)

    // Formatar dados dos seguidores (como na API corrigida)
    const followers = businessLikes.map((like, index) => {
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - (index + 1))
      
      return {
        id: like.user.id,
        name: like.user.name || like.user.email,
        email: like.user.email,
        profileImage: null,
        followedAt: baseDate.toISOString()
      }
    })

    console.log('\n📤 Dados formatados:')
    console.log(JSON.stringify({ followers, total: followers.length }, null, 2))

    console.log('\n📅 Testando formatação de data:')
    followers.forEach((follower, index) => {
      try {
        const date = new Date(follower.followedAt)
        console.log(`${index + 1}. ${follower.name}: ${date.toLocaleDateString('pt-BR')}`)
      } catch (error) {
        console.log(`${index + 1}. ${follower.name}: Erro ao formatar data`)
      }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFollowersAPIFixed()





