const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/oquefazeremfoz"
    }
  }
})

async function testRoutes() {
  try {
    console.log('🔍 Testando conexão com o banco...')
    
    // Teste 1: Buscar posts
    console.log('\n📝 Testando busca de posts...')
    const posts = await prisma.post.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            slug: true
          }
        },
        _count: {
          select: {
            comment: true,
            postlike: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 2
    })
    
    console.log(`✅ Posts encontrados: ${posts.length}`)
    if (posts.length > 0) {
      console.log('Primeiro post:', {
        id: posts[0].id,
        title: posts[0].title,
        business: posts[0].business?.name,
        comments: posts[0]._count.comment,
        likes: posts[0]._count.postlike
      })
    }
    
    // Teste 2: Buscar cupons
    console.log('\n🎫 Testando busca de cupons...')
    const coupons = await prisma.businesscoupon.findMany({
      where: {
        isActive: true,
        validUntil: {
          gt: new Date()
        }
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            isVerified: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 2
    })
    
    console.log(`✅ Cupons encontrados: ${coupons.length}`)
    if (coupons.length > 0) {
      console.log('Primeiro cupom:', {
        id: coupons[0].id,
        title: coupons[0].title,
        business: coupons[0].business?.name,
        validUntil: coupons[0].validUntil
      })
    }
    
    console.log('\n✅ Todos os testes passaram!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testRoutes()