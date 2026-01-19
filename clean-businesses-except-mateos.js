const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanBusinesses() {
  try {
    const targetEmail = 'mateospinheiro@gmail.com';
    
    // 1. Buscar o usuário alvo
    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { business: true }
    });
    
    if (!targetUser) {
      console.log(`❌ Usuário ${targetEmail} não encontrado!`);
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${targetUser.name || targetUser.email}`);
    console.log(`🏢 Empresas do usuário: ${targetUser.business ? 1 : 0}`);
    
    if (targetUser.business) {
      console.log(`   - ${targetUser.business.name} (${targetUser.business.isApproved ? 'Aprovada' : 'Pendente'})`);
    }
    
    // 2. Buscar todas as empresas
    const allBusinesses = await prisma.business.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`\n📊 Total de empresas no sistema: ${allBusinesses.length}`);
    
    // 3. Identificar empresas para deletar (todas exceto as do usuário alvo)
    const businessesToDelete = allBusinesses.filter(business => 
      business.user.email !== targetEmail
    );
    
    console.log(`\n🗑️ Empresas que serão deletadas: ${businessesToDelete.length}`);
    
    if (businessesToDelete.length === 0) {
      console.log(`✅ Não há empresas para deletar. Apenas as do ${targetEmail} existem.`);
      return;
    }
    
    // 4. Mostrar empresas que serão deletadas
    console.log('\n📋 Lista de empresas que serão deletadas:');
    businessesToDelete.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   Proprietário: ${business.user.name || business.user.email}`);
      console.log(`   Status: ${business.isApproved ? 'Aprovada' : 'Pendente'}`);
      console.log(`   ID: ${business.id}`);
      console.log('');
    });
    
    // 5. Deletar empresas (o Prisma vai cuidar das relações em cascata)
    console.log('🔄 Iniciando deleção...\n');
    
    for (const business of businessesToDelete) {
      try {
        await prisma.business.delete({
          where: { id: business.id }
        });
        console.log(`✅ Deletada: ${business.name} (${business.user.email})`);
      } catch (error) {
        console.log(`❌ Erro ao deletar ${business.name}: ${error.message}`);
      }
    }
    
    // 6. Verificar resultado final
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
        console.log(`${index + 1}. ${business.name} (${business.user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanBusinesses();