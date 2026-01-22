const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function debugAuth() {
  try {
    console.log('🔍 Debugando autenticação para mateusdiasyt@hotmail.com\n');

    // 1. Buscar o usuário e suas sessões
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

    console.log('✅ Usuário encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Nome:', user.name);
    console.log('  Roles:', user.userrole.map(ur => ur.role));
    console.log('  Business ID:', user.business?.id);
    console.log('  Business aprovado:', user.business?.isApproved);

    // 2. Verificar sessão mais recente
    if (user.session.length > 0) {
      const session = user.session[0];
      console.log('\n🔑 Sessão mais recente:');
      console.log('  Token:', session.token.substring(0, 20) + '...');
      console.log('  Criada em:', session.createdAt);
      console.log('  Expira em:', session.expiresAt);
      console.log('  Válida:', session.expiresAt >= new Date());

      // 3. Verificar token JWT
      try {
        const decoded = jwt.verify(session.token, JWT_SECRET);
        console.log('\n🎫 Token JWT decodificado:');
        console.log('  User ID:', decoded.userId);
      } catch (jwtError) {
        console.log('\n❌ Erro ao decodificar JWT:', jwtError.message);
      }
    } else {
      console.log('\n❌ Nenhuma sessão encontrada');
    }

    // 4. Simular verificação de roles
    const roles = user.userrole.map(ur => ur.role);
    console.log('\n🎭 Verificação de roles:');
    console.log('  Roles array:', roles);
    console.log('  Tem role COMPANY:', roles.includes('COMPANY'));
    console.log('  Tem role BUSINESS:', roles.includes('BUSINESS'));

    // 5. Verificar se a função hasRole funcionaria
    function hasRole(userRoles, role) {
      return userRoles.includes(role);
    }

    function isCompany(userRoles) {
      return hasRole(userRoles, 'COMPANY');
    }

    console.log('\n🔧 Teste das funções:');
    console.log('  hasRole(roles, "COMPANY"):', hasRole(roles, 'COMPANY'));
    console.log('  isCompany(roles):', isCompany(roles));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();