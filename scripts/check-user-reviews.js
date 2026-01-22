const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserReviews() {
  try {
    console.log('🔍 Verificando avaliações de usuários...\n')

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userRoles: {
          select: {
            role: true
          }
        }
      }
    })

    console.log('👥 Usuários encontrados:')
    users.forEach(user => {
      const roles = user.userRoles.map(ur => ur.role).join(', ')
      console.log(`- ${user.name || 'Sem nome'} (${user.email}) - ${roles || 'Sem role'}`)
    })

    console.log('\n📊 Verificando avaliações...\n')

    // Buscar todas as avaliações
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
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

    console.log(`📝 Total de avaliações: ${reviews.length}\n`)

    if (reviews.length > 0) {
      console.log('📋 Detalhes das avaliações:')
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. ${review.user.name || review.user.email}`)
        console.log(`   Empresa: ${review.company.name} (${review.company.slug})`)
        console.log(`   Nota: ${review.rating} estrelas`)
        console.log(`   Comentário: ${review.comment || 'Sem comentário'}`)
        console.log(`   Data: ${review.createdAt}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhuma avaliação encontrada no banco de dados')
    }

    // Verificar especificamente o usuário turista
    const touristUser = users.find(user => user.userRoles.some(ur => ur.role === 'USER'))
    if (touristUser) {
      console.log(`\n🔍 Verificando avaliações do usuário turista (${touristUser.name || touristUser.email}):`)
      
      const touristReviews = await prisma.review.findMany({
        where: {
          userId: touristUser.id
        },
        include: {
          company: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      })

      console.log(`📝 Avaliações do turista: ${touristReviews.length}`)
      
      if (touristReviews.length > 0) {
        touristReviews.forEach((review, index) => {
          console.log(`${index + 1}. ${review.company.name} - ${review.rating} estrelas`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserReviews()
