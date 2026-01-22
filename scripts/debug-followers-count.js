const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugFollowersCount() {
  try {
    console.log('🔍 Investigando contador de seguidores...\n')

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

    console.log(`🏢 Empresa: ${republicaArcade.name}`)
    console.log(`📊 Contador atual: ${republicaArcade.followersCount}`)

    // 2. Contar BusinessLikes reais para esta empresa
    const businessLikes = await prisma.businessLike.findMany({
      where: {
        businessId: republicaArcade.id
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

    console.log(`👥 BusinessLikes encontrados: ${businessLikes.length}`)
    
    if (businessLikes.length > 0) {
      console.log('\n📋 Detalhes dos seguidores:')
      businessLikes.forEach((like, index) => {
        console.log(`${index + 1}. ${like.user.name || like.user.email} (ID: ${like.user.id})`)
      })
    }

    // 3. Verificar se há Follows (modelo antigo) para esta empresa
    const business = await prisma.business.findUnique({
      where: { id: republicaArcade.id },
      include: { user: true }
    })

    let follows = []
    if (business) {
      follows = await prisma.follow.findMany({
        where: {
          followingId: business.userId
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      console.log(`\n👥 Follows encontrados: ${follows.length}`)
      
      if (follows.length > 0) {
        console.log('\n📋 Detalhes dos follows:')
        follows.forEach((follow, index) => {
          console.log(`${index + 1}. ${follow.follower.name || follow.follower.email} (ID: ${follow.follower.id})`)
        })
      }
    }

    // 4. Verificar se há duplicatas entre BusinessLike e Follow
    if (business) {
      const businessLikeUserIds = businessLikes.map(like => like.userId)
      const followUserIds = follows.map(follow => follow.followerId)
      
      const duplicates = businessLikeUserIds.filter(id => followUserIds.includes(id))
      
      if (duplicates.length > 0) {
        console.log(`\n⚠️ Usuários duplicados (em ambos os modelos): ${duplicates.length}`)
        duplicates.forEach((userId, index) => {
          const user = businessLikes.find(like => like.userId === userId)?.user
          console.log(`${index + 1}. ${user?.name || user?.email} (ID: ${userId})`)
        })
      }
    }

    // 5. Calcular total real de seguidores únicos
    const allFollowerIds = new Set()
    
    businessLikes.forEach(like => allFollowerIds.add(like.userId))
    if (business) {
      follows.forEach(follow => allFollowerIds.add(follow.followerId))
    }
    
    console.log(`\n📊 Total de seguidores únicos: ${allFollowerIds.size}`)
    console.log(`📊 BusinessLikes: ${businessLikes.length}`)
    console.log(`📊 Follows: ${follows.length}`)
    console.log(`📊 Contador atual: ${republicaArcade.followersCount}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugFollowersCount()
