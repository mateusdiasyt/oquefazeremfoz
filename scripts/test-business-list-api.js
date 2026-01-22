const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBusinessListAPI() {
  try {
    console.log('🧪 Testando API de lista de empresas...\n')

    // 1. Buscar usuário "Turista"
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

    console.log(`👤 Usuário: ${touristUser.name} (ID: ${touristUser.id})`)

    // 2. Simular a API de lista de empresas
    const businesses = await prisma.business.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        profileImage: true,
        description: true,
        category: true,
        address: true,
        phone: true,
        website: true,
        instagram: true,
        facebook: true,
        whatsapp: true,
        likesCount: true,
        followersCount: true,
        isVerified: true,
        userId: true,
        createdAt: true
      },
      orderBy: {
        likesCount: 'desc'
      }
    })

    console.log(`\n🏢 Empresas encontradas: ${businesses.length}`)

    // 3. Verificar BusinessLikes do usuário
    const userBusinessLikes = await prisma.businessLike.findMany({
      where: {
        userId: touristUser.id,
        businessId: {
          in: businesses.map(b => b.id)
        }
      },
      select: {
        businessId: true
      }
    })

    console.log(`❤️ BusinessLikes do usuário: ${userBusinessLikes.length}`)

    const followingBusinessIds = new Set(userBusinessLikes.map(like => like.businessId))

    // 4. Adicionar status de follow
    const businessesWithFollowStatus = businesses.map(business => ({
      ...business,
      isFollowing: followingBusinessIds.has(business.id)
    }))

    console.log('\n📋 Status de follow para cada empresa:')
    businessesWithFollowStatus.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`)
      console.log(`   Seguindo: ${business.isFollowing ? 'Sim' : 'Não'}`)
      console.log(`   Seguidores: ${business.followersCount}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBusinessListAPI()





