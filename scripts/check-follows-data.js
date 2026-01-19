const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkFollowsData() {
  try {
    console.log('🔍 Verificando dados de follows...\n')

    // 1. Verificar se existem follows no banco
    const allFollows = await prisma.follow.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📝 Total de follows no banco: ${allFollows.length}\n`)

    if (allFollows.length > 0) {
      console.log('📋 Detalhes dos follows:')
      allFollows.forEach((follow, index) => {
        console.log(`${index + 1}. ${follow.user.name || follow.user.email} segue ${follow.business.name}`)
        console.log(`   Data: ${follow.createdAt}`)
        console.log('')
      })
    }

    // 2. Verificar especificamente o usuário "Turista"
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

    if (touristUser) {
      console.log(`\n👤 Usuário "Turista" encontrado:`)
      console.log(`   ID: ${touristUser.id}`)
      console.log(`   Email: ${touristUser.email}`)

      // 3. Verificar follows do usuário "Turista"
      const touristFollows = await prisma.follow.findMany({
        where: {
          userId: touristUser.id
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              profileImage: true,
              isVerified: true,
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log(`\n❤️ Follows do usuário "Turista": ${touristFollows.length}`)
      
      if (touristFollows.length > 0) {
        touristFollows.forEach((follow, index) => {
          console.log(`${index + 1}. ${follow.business.name}`)
          console.log(`   Slug: ${follow.business.slug}`)
          console.log(`   Categoria: ${follow.business.category}`)
          console.log(`   Verificada: ${follow.business.isVerified ? 'Sim' : 'Não'}`)
          console.log(`   Data: ${follow.createdAt}`)
          console.log('')
        })
      } else {
        console.log('❌ Nenhum follow encontrado para o usuário "Turista"')
      }

      // 4. Verificar se existe a empresa "Republica Arcade"
      const republicaArcade = await prisma.business.findFirst({
        where: {
          name: 'Republica Arcade'
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      })

      if (republicaArcade) {
        console.log(`\n🏢 Empresa "Republica Arcade" encontrada:`)
        console.log(`   ID: ${republicaArcade.id}`)
        console.log(`   Slug: ${republicaArcade.slug}`)

        // 5. Verificar se existe follow entre o usuário e a empresa
        const specificFollow = await prisma.follow.findFirst({
          where: {
            userId: touristUser.id,
            businessId: republicaArcade.id
          }
        })

        if (specificFollow) {
          console.log(`✅ Follow encontrado entre "Turista" e "Republica Arcade"`)
          console.log(`   Data: ${specificFollow.createdAt}`)
        } else {
          console.log(`❌ Nenhum follow encontrado entre "Turista" e "Republica Arcade"`)
        }
      } else {
        console.log(`❌ Empresa "Republica Arcade" não encontrada`)
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFollowsData()





