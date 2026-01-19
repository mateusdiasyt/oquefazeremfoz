const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const prisma = new PrismaClient();
// Usar a chave exata do .env
const JWT_SECRET = 'sua-chave-secreta-super-segura-aqui-mude-em-producao';

async function testWithHardcodedKey() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Fazer login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@oqfoz.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    // Extrair token do cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader?.match(/auth-token=([^;]+)/);
    
    if (!tokenMatch) {
      throw new Error('Token não encontrado no cookie');
    }

    const token = tokenMatch[1];
    console.log('✅ Login realizado com sucesso!');
    console.log('🔍 Token extraído:', token.substring(0, 50) + '...');

    // Decodificar token com a chave hardcoded
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token válido com chave hardcoded!');
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));

      // Buscar sessão no banco
      const session = await prisma.session.findUnique({
        where: { token }
      });

      if (session) {
        console.log('✅ Sessão encontrada no banco!');
        console.log('📋 Sessão:', {
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
          isExpired: session.expiresAt < new Date()
        });
      } else {
        console.log('❌ Sessão não encontrada no banco');
        
        // Buscar pelo sessionId
        const sessionById = await prisma.session.findUnique({
          where: { id: payload.sessionId }
        });
        
        if (sessionById) {
          console.log('✅ Sessão encontrada pelo sessionId!');
          console.log('📋 Sessão:', {
            id: sessionById.id,
            userId: sessionById.userId,
            tokenMatch: sessionById.token === token,
            expiresAt: sessionById.expiresAt,
            isExpired: sessionById.expiresAt < new Date()
          });
        }
      }

    } catch (error) {
      console.log('❌ Erro ao verificar token:', error.message);
    }

    // Testar API /api/auth/me
    console.log('\n🔍 Testando API /api/auth/me...');
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    });

    console.log(`📊 Status da API /api/auth/me: ${meResponse.status}`);
    
    if (meResponse.ok) {
      const userData = await meResponse.json();
      console.log('✅ API /api/auth/me funcionando!');
      console.log('👤 Dados do usuário:', JSON.stringify(userData, null, 2));
    } else {
      const errorData = await meResponse.text();
      console.log('❌ Erro na API /api/auth/me:', errorData);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testWithHardcodedKey();