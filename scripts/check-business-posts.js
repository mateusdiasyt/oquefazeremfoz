const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBusinessPosts() {
  try {
    // Buscar empresa
    const business = await prisma.business.findFirst({
      where: { name: 'Republica Arcade' },
      include: {
        post: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                postlike: true,
                comment: true
              }
            }
          }
        }
      }
    });

    if (!business) {
      console.log('❌ Empresa não encontrada');
      return;
    }

    console.log('✅ Empresa encontrada:', business.name);
    console.log('ID:', business.id);
    console.log('\nTotal de posts:', business.post.length);

    if (business.post.length > 0) {
      console.log('\nDetalhes dos posts:');
      business.post.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log('ID:', post.id);
        console.log('Criado em:', post.createdAt);
        console.log('Likes:', post._count.postlike);
        console.log('Comentários:', post._count.comment);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

checkBusinessPosts();