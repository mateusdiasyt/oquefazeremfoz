const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('🔍 Testando API de login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@oqfoz.com',
        password: 'admin123'
      })
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('📄 Corpo da resposta:', data);

    if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.log('❌ Erro no login');
    }

  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

testLoginAPI();