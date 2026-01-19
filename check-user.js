const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
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
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Roles:', user.userrole.map(ur => ur.role));
      console.log('Empresa:', user.business ? user.business.id : 'Nenhuma');
      console.log('Sessões ativas:', user.session.length);
      if (user.session.length > 0) {
        console.log('Última sessão:', {
          id: user.session[0].id,
          expiresAt: user.session[0].expiresAt
        });
      }
    }
    
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();