const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function debugAuth() {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateus@empresa.com' },
      include: {
        userrole: true,
        business: true
      }
    });

    console.log('Usuário encontrado:', !!user);
    if (user) {
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Roles:', user.userrole.map(ur => ur.role));
      console.log('Empresa:', user.business ? user.business.id : 'Nenhuma');

      // Testar senha
      const isValidPassword = await bcrypt.compare('senha123', user.password);
      console.log('Senha válida:', isValidPassword);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

debugAuth();