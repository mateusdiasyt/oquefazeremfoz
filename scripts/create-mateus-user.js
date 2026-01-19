const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createMateusUser() {
  try {
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash('Vanguarda@2021', 10);

    // Gerar ID único para o usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: 'mateusdiasyt@hotmail.com',
        password: hashedPassword,
        name: 'Mateus',
        updatedAt: new Date(),
        userrole: {
          create: {
            id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'COMPANY'
          }
        },
        business: {
          create: {
            id: `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: 'Empresa do Mateus',
            description: 'Descrição da empresa',
            address: 'Endereço da empresa',
            phone: '(45) 99999-9999',
            website: 'https://empresa.com',
            instagram: '@empresa',
            facebook: 'empresa',
            whatsapp: '45999999999',
            isApproved: true,
            approvedAt: new Date(),
            updatedAt: new Date(),
            category: 'Turismo'
          }
        }
      },
      include: {
        userrole: true,
        business: true
      }
    });

    console.log('✅ Usuário criado com sucesso:', {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.userrole.map(ur => ur.role),
      business: user.business.id
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    await prisma.$disconnect();
  }
}

createMateusUser();