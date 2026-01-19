const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = 'sua-chave-secreta-super-segura-aqui-mude-em-producao';

async function debugSessions() {
  try {
    console.log('🔍 Verificando todas as sessões no banco...');
    
    const sessions = await prisma.session.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`📊 Total de sessões: ${sessions.length}`);
    
    sessions.forEach((session, index) => {
      console.log(`\n--- Sessão ${index + 1} ---`);
      console.log('ID:', session.id);
      console.log('User ID:', session.userId);
      console.log('User Email:', session.user.email);
      console.log('Token Match:', session.tokenMatch);
      console.log('Expires At:', session.expiresAt);
      console.log('Is Expired:', new Date() > session.expiresAt);
      console.log('Created At:', session.createdAt);
      console.log('Updated At:', session.updatedAt);
    });
    
    // Verificar se conseguimos decodificar algum token
    console.log('\n🔍 Testando decodificação de tokens...');
    
    for (const session of sessions) {
      try {
        const payload = jwt.verify(session.id, JWT_SECRET);
        console.log(`✅ Token ${session.id.substring(0, 20)}... é válido:`, payload);
      } catch (error) {
        console.log(`❌ Token ${session.id.substring(0, 20)}... é inválido:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessions();