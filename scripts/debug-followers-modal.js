const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugFollowersModal() {
  try {
    console.log('🔍 Debugando modal de seguidores...\n')

    const businessId = 'cmfcsmxnr000et6ac3bg5ccu2' // República Arcade

    // 1. Verificar se a empresa existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, followersCount: true }
    })

    if (!business) {
      console.log('❌ Empresa não encontrada')
      return
    }

    console.log(`🏢 Empresa: ${business.name}`)
    console.log(`📊 Contador: ${business.followersCount}`)

    // 2. Buscar BusinessLikes
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

    console.log(`\n👥 BusinessLikes encontrados: ${businessLikes.length}`)

    if (businessLikes.length > 0) {
      console.log('\n📋 Detalhes dos seguidores:')
      businessLikes.forEach((like, index) => {
        console.log(`${index + 1}. ${like.user.name || like.user.email}`)
        console.log(`   ID: ${like.user.id}`)
        console.log(`   Email: ${like.user.email}`)
        console.log(`   BusinessLike ID: ${like.id}`)
        console.log('')
      })
    }

    // 3. Simular formatação da API
    const followers = businessLikes.map(like => ({
      id: like.user.id,
      name: like.user.name || like.user.email,
      email: like.user.email,
      profileImage: null,
      followedAt: like.id
    }))

    console.log('📤 Dados que a API deveria retornar:')
    console.log(JSON.stringify({ followers, total: followers.length }, null, 2))

    // 4. Verificar se há algum problema com o formato de data
    console.log('\n📅 Testando formatação de data:')
    followers.forEach((follower, index) => {
      try {
        const date = new Date(follower.followedAt)
        console.log(`${index + 1}. ${follower.name}: ${date.toLocaleDateString('pt-BR')}`)
      } catch (error) {
        console.log(`${index + 1}. ${follower.name}: Erro ao formatar data - ${follower.followedAt}`)
      }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugFollowersModal()





