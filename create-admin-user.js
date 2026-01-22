const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Criando usuário admin...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar usuário admin
    const user = await prisma.user.create({
      data: {
        id: 'admin_user_' + Date.now(),
        email: 'admin@oqfoz.com',
        password: hashedPassword,
        name: 'Administrador',
        updatedAt: new Date()
      }
    });

    // Adicionar role de admin
    await prisma.userrole.create({
      data: {
        id: 'role_' + Date.now(),
        userId: user.id,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: admin@oqfoz.com');
    console.log('Senha: admin123');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();