const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const prisma = new PrismaClient();
const JWT_SECRET = 'sua-chave-secreta-super-segura-aqui-mude-em-producao';

async function debugSessionMatch() {
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

    // Decodificar token
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('📋 Payload do token:', JSON.stringify(payload, null, 2));

    // Buscar sessão pelo token (como a API faz)
    console.log('\n🔍 Buscando sessão pelo token...');
    const sessionByToken = await prisma.session.findUnique({
      where: { token }
    });

    if (sessionByToken) {
      console.log('✅ Sessão encontrada pelo token!');
      console.log('📋 Dados da sessão:', {
        id: sessionByToken.id,
        userId: sessionByToken.userId,
        tokenMatch: sessionByToken.token === token,
        expiresAt: sessionByToken.expiresAt,
        isExpired: sessionByToken.expiresAt < new Date()
      });
    } else {
      console.log('❌ Sessão NÃO encontrada pelo token');
      
      // Buscar sessão pelo sessionId
      console.log('\n🔍 Buscando sessão pelo sessionId...');
      const sessionById = await prisma.session.findUnique({
        where: { id: payload.sessionId }
      });

      if (sessionById) {
        console.log('✅ Sessão encontrada pelo sessionId!');
        console.log('📋 Dados da sessão:', {
          id: sessionById.id,
          userId: sessionById.userId,
          tokenStored: sessionById.token.substring(0, 50) + '...',
          tokenReceived: token.substring(0, 50) + '...',
          tokensMatch: sessionById.token === token,
          expiresAt: sessionById.expiresAt,
          isExpired: sessionById.expiresAt < new Date()
        });
      } else {
        console.log('❌ Sessão NÃO encontrada pelo sessionId');
      }
    }

    // Listar todas as sessões do usuário
    console.log('\n📋 Todas as sessões do usuário:');
    const allSessions = await prisma.session.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    allSessions.forEach((session, index) => {
      console.log(`${index + 1}. ID: ${session.id}`);
      console.log(`   Token (50 chars): ${session.token.substring(0, 50)}...`);
      console.log(`   Token atual match: ${session.token === token ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Criada: ${session.createdAt}`);
      console.log(`   Expira: ${session.expiresAt}`);
      console.log(`   Expirada: ${session.expiresAt < new Date() ? '❌ SIM' : '✅ NÃO'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessionMatch();