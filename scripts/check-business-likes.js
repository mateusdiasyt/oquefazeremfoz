const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBusinessLikes() {
  try {
    console.log('🔍 Verificando BusinessLikes (seguir empresas)...\n')

    // 1. Verificar se existem BusinessLikes no banco
    const allBusinessLikes = await prisma.businessLike.findMany({
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
        id: 'desc'
      }
    })

    console.log(`📝 Total de BusinessLikes no banco: ${allBusinessLikes.length}\n`)

    if (allBusinessLikes.length > 0) {
      console.log('📋 Detalhes dos BusinessLikes:')
      allBusinessLikes.forEach((like, index) => {
        console.log(`${index + 1}. ${like.user.name || like.user.email} curte ${like.business.name}`)
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

      // 3. Verificar BusinessLikes do usuário "Turista"
      const touristLikes = await prisma.businessLike.findMany({
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
          id: 'desc'
        }
      })

      console.log(`\n❤️ BusinessLikes do usuário "Turista": ${touristLikes.length}`)
      
      if (touristLikes.length > 0) {
        touristLikes.forEach((like, index) => {
          console.log(`${index + 1}. ${like.business.name}`)
          console.log(`   Slug: ${like.business.slug}`)
          console.log(`   Categoria: ${like.business.category}`)
          console.log(`   Verificada: ${like.business.isVerified ? 'Sim' : 'Não'}`)
          console.log('')
        })
      } else {
        console.log('❌ Nenhum BusinessLike encontrado para o usuário "Turista"')
      }

      // 4. Verificar se existe a empresa "Republica Arcade"
      const republicaArcade = await prisma.business.findFirst({
        where: {
          name: 'Republica Arcade'
        },
        select: {
          id: true,
          name: true,
          slug: true,
          followersCount: true
        }
      })

      if (republicaArcade) {
        console.log(`\n🏢 Empresa "Republica Arcade" encontrada:`)
        console.log(`   ID: ${republicaArcade.id}`)
        console.log(`   Slug: ${republicaArcade.slug}`)
        console.log(`   Seguidores: ${republicaArcade.followersCount}`)

        // 5. Verificar se existe BusinessLike entre o usuário e a empresa
        const specificLike = await prisma.businessLike.findFirst({
          where: {
            userId: touristUser.id,
            businessId: republicaArcade.id
          }
        })

        if (specificLike) {
          console.log(`✅ BusinessLike encontrado entre "Turista" e "Republica Arcade"`)
        } else {
          console.log(`❌ Nenhum BusinessLike encontrado entre "Turista" e "Republica Arcade"`)
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

checkBusinessLikes()
