const { PrismaClient } = require('@prisma/client');

// Criando cliente Prisma com URL direta
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/oqfoz"
    }
  }
});

async function main() {
  try {
    console.log('Testando conexão com o banco de dados...');
    
    // Testar tabela de posts
    const posts = await prisma.post.findMany({ take: 1 });
    console.log('✓ Tabela posts OK - Registros encontrados:', posts.length);
    
    // Testar tabela de business
    const business = await prisma.business.findMany({ take: 1 });
    console.log('✓ Tabela business OK - Registros encontrados:', business.length);
    
    // Testar tabela de businesscoupon
    const coupons = await prisma.businesscoupon.findMany({ take: 1 });
    console.log('✓ Tabela businesscoupon OK - Registros encontrados:', coupons.length);
    
    // Testar tabela de user
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✓ Tabela user OK - Registros encontrados:', users.length);
    
    console.log('\n✅ Todas as tabelas estão funcionando!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();