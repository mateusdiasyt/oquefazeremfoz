const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
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
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

checkUser();