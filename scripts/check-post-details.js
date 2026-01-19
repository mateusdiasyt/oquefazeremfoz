const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPostDetails() {
  try {
    const post = await prisma.post.findUnique({
      where: { id: 'post_1758570033187_f3afrdomu' },
      include: {
        business: true,
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
          }
        }
      }
    });

    if (!post) {
      console.log('❌ Post não encontrado');
      return;
    }

    console.log('✅ Post encontrado');
    console.log('\nDetalhes do post:');
    console.log('ID:', post.id);
    console.log('Título:', post.title);
    console.log('Conteúdo:', post.content);
    console.log('Imagem:', post.imageUrl || 'Nenhuma');
    console.log('Criado em:', post.createdAt);
    console.log('Atualizado em:', post.updatedAt);
    
    console.log('\nEmpresa:', post.business.name);
    
    console.log('\nLikes:', post.postlike.length);
    if (post.postlike.length > 0) {
      console.log('Usuários que curtiram:');
      post.postlike.forEach(like => {
        console.log(`- ${like.user.name} (${like.user.email})`);
      });
    }

    console.log('\nComentários:', post.comment.length);
    if (post.comment.length > 0) {
      console.log('Comentários:');
      post.comment.forEach(comment => {
        console.log(`- ${comment.user.name}: ${comment.content}`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

checkPostDetails();