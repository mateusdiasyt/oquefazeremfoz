const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPostInteractions() {
  try {
    // Buscar o post
    const post = await prisma.post.findFirst({
      where: { business: { name: 'Republica Arcade' } },
      include: {
        _count: {
          select: {
            postlike: true,
            comment: true
          }
        },
        postlike: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      console.log('❌ Post não encontrado');
      return;
    }

    console.log('✅ Post encontrado:', post.id);
    console.log('Likes:', post._count.postlike);
    console.log('Comentários:', post._count.comment);

    if (post.postlike.length > 0) {
      console.log('\nUsuários que curtiram:');
      post.postlike.forEach(like => {
        console.log(`- ${like.user.name} (${like.user.email})`);
      });
    }

    if (post.comment.length > 0) {
      console.log('\nComentários:');
      post.comment.forEach(comment => {
        console.log(`- ${comment.user.name} (${comment.user.email}): ${comment.body}`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

testPostInteractions();