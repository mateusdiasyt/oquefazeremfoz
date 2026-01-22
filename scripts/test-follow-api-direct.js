const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFollowAPIDirect() {
  try {
    console.log('🧪 Testando API de follow diretamente...\n')

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

    // 2. Buscar empresa "Republica Arcade"
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

    console.log(`🏢 Empresa: ${republicaArcade.name} (ID: ${republicaArcade.id})`)
    console.log(`📊 Seguidores atuais: ${republicaArcade.followersCount}`)

    // 3. Verificar se já está seguindo
    const existingLike = await prisma.businessLike.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      }
    })

    console.log(`\n❤️ Já está seguindo: ${existingLike ? 'Sim' : 'Não'}`)

    if (existingLike) {
      console.log('🗑️ Simulando desseguir...')
      
      // Desseguir
      await prisma.businessLike.delete({
        where: { id: existingLike.id }
      })

      // Atualizar contador
      const updatedBusiness = await prisma.business.update({
        where: { id: republicaArcade.id },
        data: {
          followersCount: {
            decrement: 1
          }
        }
      })

      console.log(`✅ Desseguido! Seguidores: ${updatedBusiness.followersCount}`)
    } else {
      console.log('➕ Simulando seguir...')
      
      // Seguir
      await prisma.businessLike.create({
        data: {
          userId: touristUser.id,
          businessId: republicaArcade.id
        }
      })

      // Atualizar contador
      const updatedBusiness = await prisma.business.update({
        where: { id: republicaArcade.id },
        data: {
          followersCount: {
            increment: 1
          }
        }
      })

      console.log(`✅ Seguido! Seguidores: ${updatedBusiness.followersCount}`)
    }

    // 4. Verificar estado final
    const finalLike = await prisma.businessLike.findFirst({
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
    console.log(`   Seguindo: ${finalLike ? 'Sim' : 'Não'}`)
    console.log(`   Seguidores: ${finalBusiness?.followersCount}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFollowAPIDirect()





