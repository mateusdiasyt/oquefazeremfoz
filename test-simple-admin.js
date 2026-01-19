const fetch = require('node-fetch');

async function testAdminAccess() {
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

    // Testar API /api/auth/me
    console.log('🔍 Testando API /api/auth/me...');
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

    // Testar acesso à página /admin
    console.log('🔍 Testando acesso à página /admin...');
    const adminResponse = await fetch('http://localhost:3000/admin', {
      headers: {
        'Cookie': `auth-token=${token}`
      },
      redirect: 'manual'
    });

    console.log(`📊 Status da página /admin: ${adminResponse.status}`);
    
    if (adminResponse.status === 200) {
      console.log('✅ Acesso à página /admin permitido!');
    } else if (adminResponse.status === 302 || adminResponse.status === 307) {
      const location = adminResponse.headers.get('location');
      console.log(`🔄 Redirecionamento para: ${location}`);
    } else {
      console.log('❌ Acesso à página /admin negado');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAdminAccess();