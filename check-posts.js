const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPosts() {
  try {
    console.log('🔍 Verificando posts no banco de dados...')
    
    const posts = await prisma.post.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isApproved: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Total de posts encontrados: ${posts.length}`)
    
    if (posts.length > 0) {
      console.log('\n📝 Posts encontrados:')
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post.id}`)
        console.log(`   Título: ${post.title}`)
        console.log(`   Empresa: ${post.business?.name || 'N/A'}`)
        console.log(`   Aprovado: ${post.business?.isApproved || false}`)
        console.log(`   Criado em: ${post.createdAt}`)
        console.log('   ---')
      })
    } else {
      console.log('❌ Nenhum post encontrado no banco de dados')
    }
    
    // Verificar empresas
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        isApproved: true,
        isVerified: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })
    
    console.log(`\n🏢 Total de empresas: ${businesses.length}`)
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} - Posts: ${business._count.posts} - Aprovada: ${business.isApproved}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPosts()

