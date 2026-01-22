const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateFollowsToBusinessLikes() {
  try {
    console.log('🔄 Migrando Follows para BusinessLikes...\n')

    // 1. Buscar todas as empresas
    const businesses = await prisma.business.findMany({
      include: { user: true }
    })

    console.log(`🏢 Empresas encontradas: ${businesses.length}`)

    for (const business of businesses) {
      console.log(`\n📋 Processando: ${business.name}`)

      // 2. Buscar todos os Follows para esta empresa
      const follows = await prisma.follow.findMany({
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

      console.log(`   👥 Follows encontrados: ${follows.length}`)

      if (follows.length > 0) {
        // 3. Para cada follow, criar BusinessLike se não existir
        for (const follow of follows) {
          const existingBusinessLike = await prisma.businessLike.findFirst({
            where: {
              userId: follow.followerId,
              businessId: business.id
            }
          })

          if (!existingBusinessLike) {
            await prisma.businessLike.create({
              data: {
                userId: follow.followerId,
                businessId: business.id
              }
            })
            console.log(`   ✅ BusinessLike criado para: ${follow.follower.name || follow.follower.email}`)
          } else {
            console.log(`   ⚠️ BusinessLike já existe para: ${follow.follower.name || follow.follower.email}`)
          }
        }

        // 4. Deletar os Follows antigos
        await prisma.follow.deleteMany({
          where: {
            followingId: business.userId
          }
        })
        console.log(`   🗑️ Follows antigos removidos`)
      }
    }

    // 5. Corrigir contadores de todas as empresas
    console.log('\n🔧 Corrigindo contadores...')
    
    for (const business of businesses) {
      const realCount = await prisma.businessLike.count({
        where: {
          businessId: business.id
        }
      })

      await prisma.business.update({
        where: { id: business.id },
        data: {
          followersCount: realCount
        }
      })
      
      console.log(`✅ ${business.name}: ${business.followersCount} → ${realCount}`)
    }

    console.log('\n🎉 Migração concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateFollowsToBusinessLikes()





