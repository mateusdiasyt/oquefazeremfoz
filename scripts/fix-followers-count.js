const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFollowersCount() {
  try {
    console.log('🔧 Corrigindo contador de seguidores...\n')

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
    const realFollowersCount = await prisma.businessLike.count({
      where: {
        businessId: republicaArcade.id
      }
    })

    console.log(`👥 Seguidores reais: ${realFollowersCount}`)

    // 3. Atualizar o contador para o valor correto
    const updatedBusiness = await prisma.business.update({
      where: { id: republicaArcade.id },
      data: {
        followersCount: realFollowersCount
      }
    })

    console.log(`✅ Contador corrigido para: ${updatedBusiness.followersCount}`)

    // 4. Verificar todas as empresas e corrigir seus contadores
    console.log('\n🔧 Corrigindo contadores de todas as empresas...')
    
    const allBusinesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        followersCount: true
      }
    })

    for (const business of allBusinesses) {
      const realCount = await prisma.businessLike.count({
        where: {
          businessId: business.id
        }
      })

      if (business.followersCount !== realCount) {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            followersCount: realCount
          }
        })
        
        console.log(`✅ ${business.name}: ${business.followersCount} → ${realCount}`)
      } else {
        console.log(`✅ ${business.name}: ${realCount} (já correto)`)
      }
    }

    console.log('\n🎉 Todos os contadores foram corrigidos!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFollowersCount()





