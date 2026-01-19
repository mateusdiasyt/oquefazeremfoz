const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestReview() {
  try {
    console.log('🔍 Criando avaliação de teste...\n')

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

    console.log(`👤 Usuário "Turista": ${touristUser.name} (ID: ${touristUser.id})`)

    // 2. Buscar a empresa "Republica Arcade"
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

    if (!republicaArcade) {
      console.log('❌ Empresa "Republica Arcade" não encontrada')
      return
    }

    console.log(`🏢 Empresa "Republica Arcade": ${republicaArcade.name} (ID: ${republicaArcade.id})`)

    // 3. Verificar se já existe avaliação
    const existingReview = await prisma.businessReview.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      }
    })

    if (existingReview) {
      console.log('✅ Avaliação já existe')
      console.log(`   Nota: ${existingReview.rating} estrelas`)
      console.log(`   Comentário: ${existingReview.comment || 'Sem comentário'}`)
    } else {
      console.log('❌ Avaliação não existe. Criando...')
      
      // 4. Criar avaliação de teste
      const newReview = await prisma.businessReview.create({
        data: {
          userId: touristUser.id,
          businessId: republicaArcade.id,
          rating: 5,
          comment: 'Excelente empresa! Atendimento top e produtos de qualidade.',
          isVerified: true
        }
      })

      console.log('✅ Avaliação criada com sucesso!')
      console.log(`   Nota: ${newReview.rating} estrelas`)
      console.log(`   Comentário: ${newReview.comment}`)
      console.log(`   Verificada: ${newReview.isVerified ? 'Sim' : 'Não'}`)
    }

    // 5. Verificar estado final
    const finalReview = await prisma.businessReview.findFirst({
      where: {
        userId: touristUser.id,
        businessId: republicaArcade.id
      },
      include: {
        business: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (finalReview) {
      console.log(`\n📊 Estado final:`)
      console.log(`   Avaliação existe: Sim`)
      console.log(`   Empresa: ${finalReview.business.name}`)
      console.log(`   Nota: ${finalReview.rating} estrelas`)
      console.log(`   Comentário: ${finalReview.comment}`)
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestReview()





