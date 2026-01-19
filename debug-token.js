const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// Usar a mesma chave que está no .env
const JWT_SECRET = 'sua-chave-secreta-super-segura-aqui-mude-em-producao';

console.log('🔑 JWT_SECRET sendo usado:', JWT_SECRET);

async function debugToken() {
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

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Falha no login:', loginData.error);
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    
    // Extrair o token do cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/auth-token=([^;]+)/);
    
    if (!tokenMatch) {
      console.log('❌ Token não encontrado no cookie');
      return;
    }
    
    const token = tokenMatch[1];
    console.log('\n🔍 Analisando token...');
    console.log('Token (primeiros 50 chars):', token.substring(0, 50) + '...');
    
    // Decodificar o token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token válido!');
      console.log('Payload:', JSON.stringify(decoded, null, 2));
      
      // Verificar se a sessão existe no banco
      console.log('\n🔍 Verificando sessão no banco...');
      const session = await prisma.session.findUnique({
        where: { token }
      });
      
      if (!session) {
        console.log('❌ Sessão não encontrada no banco');
        
        // Listar sessões recentes para comparar
        const recentSessions = await prisma.session.findMany({
          where: { userId: decoded.userId },
          orderBy: { createdAt: 'desc' },
          take: 3
        });
        
        console.log('\n📋 Sessões recentes do usuário:');
        recentSessions.forEach((s, i) => {
          console.log(`${i + 1}. ID: ${s.id}`);
          console.log(`   Token match: ${s.token === token ? '✅ SIM' : '❌ NÃO'}`);
          console.log(`   Criada: ${s.createdAt}`);
        });
        
      } else {
        console.log('✅ Sessão encontrada no banco!');
        console.log('Session ID:', session.id);
        console.log('User ID:', session.userId);
        console.log('Expira em:', session.expiresAt);
        console.log('Expirada?', session.expiresAt < new Date() ? '❌ SIM' : '✅ NÃO');
      }
      
    } catch (jwtError) {
      console.log('❌ Erro ao verificar token:', jwtError.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugToken();