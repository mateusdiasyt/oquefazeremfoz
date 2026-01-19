const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndCreateFollow() {
  try {
    console.log('🔍 Verificando e criando follow do usuário "Turista"...\n')

    // 1. Buscar o usuário "Turista"
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

    console.log(`👤 Usuário "Turista" encontrado: ${touristUser.name} (ID: ${touristUser.id})`)

    // 2. Buscar a empresa "Republica Arcade"
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

    if (!republicaArcade) {
      console.log('❌ Empresa "Republica Arcade" não encontrada')
      return
    }

    console.log(`🏢 Empresa "Republica Arcade" encontrada: ${republicaArcade.name} (ID: ${republicaArcade.id})`)
    console.log(`   Seguidores atuais: ${republicaArcade.followersCount}`)

    // 3. Verificar se já existe BusinessLike entre eles
    const existingLike = await prisma.businessLike.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      }
    })

    if (existingLike) {
      console.log('✅ BusinessLike já existe entre "Turista" e "Republica Arcade"')
    } else {
      console.log('❌ BusinessLike não existe. Criando...')
      
      // 4. Criar BusinessLike (follow)
      const newLike = await prisma.businessLike.create({
        data: {
          userId: touristUser.id,
          businessId: republicaArcade.id
        }
      })

      console.log('✅ BusinessLike criado com sucesso!')

      // 5. Atualizar contador de seguidores
      await prisma.business.update({
        where: { id: republicaArcade.id },
        data: {
          followersCount: republicaArcade.followersCount + 1
        }
      })

      console.log('✅ Contador de seguidores atualizado!')
    }

    // 6. Verificar avaliação
    const review = await prisma.businessReview.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    })

    if (review) {
      console.log(`\n⭐ Avaliação encontrada:`)
      console.log(`   Nota: ${review.rating} estrelas`)
      console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
      console.log(`   Data: ${review.createdAt}`)
    } else {
      console.log('\n❌ Nenhuma avaliação encontrada')
    }

    // 7. Verificar estado final
    const finalBusinessLike = await prisma.businessLike.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      }
    })

    const finalBusiness = await prisma.business.findFirst({
      where: { id: republicaArcade.id },
      select: { followersCount: true }
    })

    console.log(`\n📊 Estado final:`)
    console.log(`   BusinessLike existe: ${finalBusinessLike ? 'Sim' : 'Não'}`)
    console.log(`   Seguidores da empresa: ${finalBusiness?.followersCount}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateFollow()





