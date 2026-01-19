const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestBusiness() {
  try {
    console.log('🏢 Criando empresa de teste...');

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        id: 'user_test_' + Date.now(),
        email: 'empresa@teste.com',
        password: hashedPassword,
        name: 'Empresa Teste',
        updatedAt: new Date()
      }
    });

    // Criar empresa de teste
    const business = await prisma.business.create({
      data: {
        id: 'business_test_' + Date.now(),
        userId: user.id,
        name: 'Empresa Teste Ltda',
        description: 'Uma empresa de teste para verificar aprovação/rejeição',
        category: 'Turismo',
        address: 'Rua Teste, 123 - Foz do Iguaçu, PR',
        phone: '(45) 99999-9999',
        website: 'https://empresateste.com.br',
        isApproved: false,
        slug: 'empresa-teste-' + Date.now(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Empresa criada com sucesso!');
    console.log('ID da empresa:', business.id);
    console.log('Nome:', business.name);
    console.log('Status aprovação:', business.isApproved);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBusiness();