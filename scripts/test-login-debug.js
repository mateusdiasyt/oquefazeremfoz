const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@hotmail.com' },
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
      const senha = 'Vanguarda@2021';
      const isValidPassword = await bcrypt.compare(senha, user.password);
      console.log('Senha válida:', isValidPassword);
      console.log('Hash da senha atual:', user.password);
      
      // Gerar hash da senha fornecida para comparação
      const hashDaSenhaFornecida = await bcrypt.hash(senha, 10);
      console.log('Hash da senha fornecida:', hashDaSenhaFornecida);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

testLogin();