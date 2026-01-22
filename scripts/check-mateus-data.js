const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkMateusData() {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@hotmail.com' },
      include: {
        userrole: true,
        business: true,
        session: true
      }
    });

    console.log('Usuário encontrado:', !!user);
    if (user) {
      console.log('\nDados do usuário:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Roles:', user.userrole.map(ur => ur.role));
      
      if (user.business) {
        console.log('\nDados da empresa:');
        console.log('ID:', user.business.id);
        console.log('Nome:', user.business.name);
        console.log('Aprovada:', user.business.isApproved);
        console.log('Aprovada em:', user.business.approvedAt);
      }

      console.log('\nSessões ativas:', user.session.length);
      if (user.session.length > 0) {
        console.log('Última sessão:', {
          id: user.session[0].id,
          expiresAt: user.session[0].expiresAt
        });
      }

      // Testar senha
      const senha = 'Vanguarda@2021';
      const isValidPassword = await bcrypt.compare(senha, user.password);
      console.log('\nSenha válida:', isValidPassword);
      console.log('Hash da senha atual:', user.password);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

checkMateusData();