const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'teste@empresa.com',
        password: hashedPassword,
        name: 'Usuário de Teste',
        userrole: {
          create: {
            role: 'COMPANY'
          }
        },
        business: {
          create: {
            name: 'Empresa de Teste',
            description: 'Uma empresa para testes',
            address: 'Rua de Teste, 123',
            phone: '(45) 99999-9999',
            website: 'https://teste.com',
            instagram: '@teste',
            facebook: 'teste',
            whatsapp: '45999999999'
          }
        }
      },
      include: {
        userrole: true,
        business: true
      }
    });

    console.log('Usuário criado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.userrole.map(ur => ur.role),
      business: user.business.id
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

createTestUser();