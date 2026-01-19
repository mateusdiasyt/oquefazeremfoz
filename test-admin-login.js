const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🔐 Testando login do admin...');
    
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

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('Usuário:', data.user.name);
      console.log('Email:', data.user.email);
      console.log('Roles:', data.user.roles);
    } else {
      console.log('❌ Falha no login:', data.error);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

testAdminLogin();