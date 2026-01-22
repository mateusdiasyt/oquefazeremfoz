require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testPostsQuery() {
  try {
    console.log('🔍 Testando conexão com o banco...')
    
    // Teste básico de conexão
    await prisma.$connect()
    console.log('✅ Conexão estabelecida')
    
    // Teste de contagem de posts
    console.log('📊 Contando posts...')
    const postCount = await prisma.post.count()
    console.log(`📝 Total de posts: ${postCount}`)
    
    // Teste da query exata da rota
    console.log('🔍 Testando query da rota...')
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
      skip: 0,
      take: 5
    })
    
    console.log(`✅ Query executada com sucesso! Encontrados ${posts.length} posts`)
    
    // Mostrar detalhes dos posts
    posts.forEach((post, index) => {
      console.log(`📝 Post ${index + 1}:`)
      console.log(`   ID: ${post.id}`)
      console.log(`   Título: ${post.title}`)
      console.log(`   Business: ${post.business?.name || 'N/A'}`)
      console.log(`   Comentários: ${post._count.comment}`)
      console.log(`   Likes: ${post._count.postlike}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testPostsQuery()