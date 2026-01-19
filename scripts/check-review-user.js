const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkReviewUser() {
  try {
    console.log('🔍 Verificando quem fez a avaliação...\n')

    // Buscar a avaliação específica
    const review = await prisma.businessReview.findFirst({
      where: {
        business: {
          name: 'Republica Arcade'
        }
      },
      include: {
        user: {
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
        },
        business: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (review) {
      console.log('📝 Avaliação encontrada:')
      console.log(`   Usuário: ${review.user.name || review.user.email} (ID: ${review.user.id})`)
      console.log(`   Roles: ${review.user.userRoles.map(ur => ur.role).join(', ')}`)
      console.log(`   Empresa: ${review.business.name}`)
      console.log(`   Nota: ${review.rating} estrelas`)
      console.log(`   Comentário: ${review.comment}`)
    } else {
      console.log('❌ Avaliação não encontrada')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkReviewUser()





