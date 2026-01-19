const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function fixMateusSession() {
  try {
    console.log('🔧 Corrigindo sessão para mateusdiasyt@hotmail.com...\n');

    // 1. Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@hotmail.com' },
      include: {
        userrole: true,
        business: true,
        session: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.id);
    console.log('  Roles:', user.userrole.map(ur => ur.role));
    console.log('  Business ID:', user.business?.id);

    // 2. Remover sessões antigas
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });
    console.log('🧹 Sessões antigas removidas');

    // 3. Gerar novo token JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Criar nova sessão
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newSession = await prisma.session.create({
      data: {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        token,
        userId: user.id,
        expiresAt
      }
    });

    console.log('\n✅ Nova sessão criada:');
    console.log('  Token:', token.substring(0, 20) + '...');
    console.log('  Expira em:', expiresAt);

    // 5. Verificar token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token JWT válido:');
      console.log('  User ID:', decoded.userId);
    } catch (error) {
      console.log('\n❌ Erro ao verificar token:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixMateusSession();