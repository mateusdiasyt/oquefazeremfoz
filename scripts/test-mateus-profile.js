const fetch = require('node-fetch');

async function testProfile() {
  try {
    // Login
    console.log('Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'mateus@empresa.com',
        password: 'senha123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login bem sucedido:', loginData);

    // Pegar o token do corpo da resposta
    const authToken = loginData.token;
    if (!authToken) {
      throw new Error('Token de autenticação não encontrado na resposta');
    }
    console.log('Token recebido:', authToken);

    // Verificar usuário atual
    console.log('\nVerificando usuário atual...');
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `auth-token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });

    const userData = await meResponse.json();
    console.log('Dados do usuário:', userData);

    // Acessar profile da empresa
    console.log('\nAcessando profile da empresa...');
    const profileResponse = await fetch('http://localhost:3000/api/business/profile', {
      headers: {
        'Cookie': `auth-token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Headers enviados:', {
      Cookie: `auth-token=${authToken}`,
      Authorization: `Bearer ${authToken}`
    });

    const profileStatus = profileResponse.status;
    const profileData = await profileResponse.json();
    
    console.log('Status:', profileStatus);
    console.log('Resposta:', profileData);

    // Acessar página do profile
    console.log('\nAcessando página /profile...');
    const pageResponse = await fetch('http://localhost:3000/profile', {
      headers: {
        'Cookie': `auth-token=${authToken}`
      }
    });

    console.log('Status da página:', pageResponse.status);

  } catch (error) {
    console.error('Erro:', error);
  }
}

testProfile();