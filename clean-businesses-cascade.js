const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanBusinessesCascade() {
  try {
    const targetEmail = 'mateospinheiro@gmail.com';
    
    // 1. Buscar o usuário alvo
    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail }
    });
    
    if (!targetUser) {
      console.log(`❌ Usuário ${targetEmail} não encontrado!`);
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${targetUser.name || targetUser.email}`);
    
    // 2. Buscar todas as empresas exceto as do usuário alvo
    const businessesToDelete = await prisma.business.findMany({
      where: {
        user: {
          email: { not: targetEmail }
        }
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`\n🗑️ Empresas que serão deletadas: ${businessesToDelete.length}`);
    
    if (businessesToDelete.length === 0) {
      console.log(`✅ Não há empresas para deletar. Apenas as do ${targetEmail} existem.`);
      return;
    }
    
    // 3. Mostrar empresas que serão deletadas
    console.log('\n📋 Lista de empresas que serão deletadas:');
    businessesToDelete.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name} (${business.user.email})`);
    });
    
    // 4. Deletar em cascata para cada empresa
    console.log('\n🔄 Iniciando deleção em cascata...\n');
    
    for (const business of businessesToDelete) {
      try {
        console.log(`🔄 Processando: ${business.name}...`);
        
        // Deletar posts e suas relações
        const posts = await prisma.post.findMany({
          where: { businessId: business.id }
        });
        
        for (const post of posts) {
          // Deletar likes dos posts
          await prisma.postlike.deleteMany({
            where: { postId: post.id }
          });
          
          // Deletar comentários dos posts
          await prisma.comment.deleteMany({
            where: { postId: post.id }
          });
        }
        
        // Deletar posts
        await prisma.post.deleteMany({
          where: { businessId: business.id }
        });
        
        // Deletar reviews da empresa
        await prisma.businessreview.deleteMany({
          where: { businessId: business.id }
        });
        
        // Deletar likes da empresa
        await prisma.businesslike.deleteMany({
          where: { businessId: business.id }
        });
        
        // Deletar produtos da empresa
        await prisma.businessproduct.deleteMany({
          where: { businessId: business.id }
        });
        
        // Deletar cupons da empresa
        await prisma.businesscoupon.deleteMany({
          where: { businessId: business.id }
        });
        
        // Finalmente deletar a empresa
        await prisma.business.delete({
          where: { id: business.id }
        });
        
        console.log(`✅ Deletada: ${business.name} (${business.user.email})`);
        
      } catch (error) {
        console.log(`❌ Erro ao deletar ${business.name}: ${error.message}`);
      }
    }
    
    // 5. Verificar resultado final
    const remainingBusinesses = await prisma.business.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`\n🎉 Limpeza concluída!`);
    console.log(`📊 Empresas restantes: ${remainingBusinesses.length}`);
    
    if (remainingBusinesses.length > 0) {
      console.log('\n📋 Empresas que permaneceram:');
      remainingBusinesses.forEach((business, index) => {
        console.log(`${index + 1}. ${business.name} (${business.user.email}) - ${business.isApproved ? 'Aprovada' : 'Pendente'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanBusinessesCascade();