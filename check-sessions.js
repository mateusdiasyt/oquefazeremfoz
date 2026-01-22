const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSessions() {
  try {
    console.log('🔍 Verificando sessões no banco...');
    
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log(`📊 Total de sessões encontradas: ${sessions.length}`);
    
    sessions.forEach((session, index) => {
      console.log(`\n--- Sessão ${index + 1} ---`);
      console.log('ID:', session.id);
      console.log('Usuário:', session.user.email);
      console.log('Token (primeiros 50 chars):', session.token.substring(0, 50) + '...');
      console.log('Criada em:', session.createdAt);
      console.log('Expira em:', session.expiresAt);
      console.log('Expirada?', session.expiresAt < new Date() ? '❌ SIM' : '✅ NÃO');
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();