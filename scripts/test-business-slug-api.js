const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBusinessSlugAPI() {
  try {
    console.log('🧪 Testando API de empresa por slug...\n')

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

    // 2. Buscar empresa "Republica Arcade" por slug
    const business = await prisma.business.findUnique({
      where: { slug: 'republica-arcade' },
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

    if (!business) {
      console.log('❌ Empresa "Republica Arcade" não encontrada')
      return
    }

    console.log(`🏢 Empresa: ${business.name} (ID: ${business.id})`)
    console.log(`📊 Seguidores: ${business.followersCount}`)

    // 3. Verificar like (BusinessLike)
    const existingLike = await prisma.businessLike.findUnique({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: touristUser.id
        }
      }
    })
    const isLiked = !!existingLike

    // 4. Verificar follow (BusinessLike)
    const existingFollow = await prisma.businessLike.findFirst({
      where: {
        userId: touristUser.id,
        businessId: business.id
      }
    })
    const isFollowing = !!existingFollow

    console.log(`\n❤️ Curtida: ${isLiked ? 'Sim' : 'Não'}`)
    console.log(`👥 Seguindo: ${isFollowing ? 'Sim' : 'Não'}`)

    // 5. Simular resposta da API
    const apiResponse = {
      ...business,
      isLiked,
      isFollowing,
      likesCount: business.likesCount || 0,
      followersCount: business.followersCount || 0,
      followingCount: business.followingCount || 0
    }

    console.log('\n📤 Resposta da API:')
    console.log(`   Nome: ${apiResponse.name}`)
    console.log(`   Seguidores: ${apiResponse.followersCount}`)
    console.log(`   Seguindo: ${apiResponse.isFollowing}`)
    console.log(`   Curtida: ${apiResponse.isLiked}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBusinessSlugAPI()





