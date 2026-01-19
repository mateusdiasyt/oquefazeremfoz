const fetch = require('node-fetch');

async function testAdminAccess() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Primeiro, fazer login
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
    
    // Extrair o cookie do cabeçalho Set-Cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    if (!setCookieHeader) {
      console.log('❌ Nenhum cookie encontrado na resposta');
      return;
    }
    
    // Tentar acessar a página admin
    console.log('\n🔍 Testando acesso à página /admin...');
    
    const adminResponse = await fetch('http://localhost:3000/admin', {
      headers: {
        'Cookie': setCookieHeader
      }
    });
    
    console.log('Status da página admin:', adminResponse.status);
    
    if (adminResponse.status === 200) {
      console.log('✅ Acesso à página admin permitido!');
    } else if (adminResponse.status === 404) {
      console.log('❌ Página admin não encontrada (404)');
    } else if (adminResponse.status === 401) {
      console.log('❌ Acesso negado (401) - problema de autenticação');
    } else if (adminResponse.status === 403) {
      console.log('❌ Acesso negado (403) - problema de autorização');
    } else {
      console.log('❓ Status inesperado:', adminResponse.status);
    }
    
    // Testar também a API /api/auth/me com o cookie
    console.log('\n🔍 Testando /api/auth/me com cookie...');
    
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': setCookieHeader
      }
    });
    
    const meData = await meResponse.json();
    console.log('Status /api/auth/me:', meResponse.status);
    console.log('Response:', JSON.stringify(meData, null, 2));

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

testAdminAccess();