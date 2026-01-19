const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️ Iniciando limpeza completa do banco de dados...');

    // Deletar em ordem para respeitar as foreign keys
    console.log('💬 Deletando comentários...');
    await prisma.comment.deleteMany({});

    console.log('👍 Deletando likes de posts...');
    await prisma.postlike.deleteMany({});

    console.log('📝 Deletando posts...');
    await prisma.post.deleteMany({});

    console.log('⭐ Deletando avaliações de empresas...');
    await prisma.businessreview.deleteMany({});

    console.log('⭐ Deletando avaliações de companies...');
    await prisma.review.deleteMany({});

    console.log('🎫 Deletando cupons de empresas...');
    await prisma.businesscoupon.deleteMany({});

    console.log('🎫 Deletando cupons de companies...');
    await prisma.coupon.deleteMany({});

    console.log('📦 Deletando produtos de empresas...');
    await prisma.businessproduct.deleteMany({});

    console.log('📦 Deletando produtos de companies...');
    await prisma.product.deleteMany({});

    console.log('🛒 Deletando pedidos...');
    await prisma.order.deleteMany({});

    console.log('👥 Deletando seguidores de empresas...');
    await prisma.businesslike.deleteMany({});

    console.log('👥 Deletando seguidores de usuários...');
    await prisma.follow.deleteMany({});

    console.log('💬 Deletando mensagens...');
    await prisma.message.deleteMany({});

    console.log('💬 Deletando conversas...');
    await prisma.conversation.deleteMany({});

    console.log('📺 Deletando stories...');
    await prisma.story.deleteMany({});

    console.log('📢 Deletando posts patrocinados...');
    await prisma.sponsoredpost.deleteMany({});

    console.log('💳 Deletando assinaturas...');
    await prisma.subscription.deleteMany({});

    console.log('📋 Deletando planos...');
    await prisma.plan.deleteMany({});

    console.log('🏢 Deletando companies...');
    await prisma.company.deleteMany({});

    console.log('🔐 Deletando sessões...');
    await prisma.session.deleteMany({});

    console.log('👤 Deletando roles de usuários...');
    await prisma.userrole.deleteMany({});

    console.log('🏢 Deletando empresas...');
    await prisma.business.deleteMany({});

    console.log('👤 Deletando usuários...');
    await prisma.user.deleteMany({});

    console.log('🎨 Deletando banners...');
    await prisma.banner.deleteMany({});

    console.log('✅ Banco de dados limpo com sucesso!');
    console.log('📊 Todas as tabelas foram esvaziadas.');

  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('🎉 Limpeza concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na limpeza:', error);
      process.exit(1);
    });
}

module.exports = { clearDatabase };