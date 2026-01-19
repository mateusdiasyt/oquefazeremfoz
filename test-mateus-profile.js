const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMateusProfile() {
  try {
    console.log('🧪 Testando acesso ao profile da empresa para mateusdiasyt@hotmail.com\n');

    // 1. Fazer login
    console.log('1. 🔐 Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mateusdiasyt@hotmail.com',
        password: 'senha123' // Assumindo que esta é a senha
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Erro no login:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Resposta:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');

    if (!loginData.token) {
      console.log('❌ Token de autenticação não encontrado na resposta');
      return;
    }

    const authToken = loginData.token;
    console.log('🔑 Token recebido:', authToken.substring(0, 20) + '...');

    // 2. Verificar dados do usuário
    console.log('\n2. 👤 Verificando dados do usuário...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': `auth-token=${authToken}; Path=/; HttpOnly; SameSite=Lax`
      }
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Dados do usuário:', {
        id: meData.user.id,
        name: meData.user.name,
        email: meData.user.email,
        roles: meData.user.roles,
        businessId: meData.user.businessId
      });
    } else {
      console.log('❌ Erro ao buscar dados do usuário:', meResponse.status);
    }

    // 3. Testar API /api/business/profile
    console.log('\n3. 🏢 Testando API /api/business/profile...');
    const businessProfileHeaders = {
      'Cookie': `auth-token=${authToken}; Path=/; HttpOnly; SameSite=Lax`,
      'Authorization': `Bearer ${authToken}`
    };
    console.log('Headers:', businessProfileHeaders);

    const businessProfileResponse = await fetch(`${BASE_URL}/api/business/profile`, {
      headers: businessProfileHeaders
    });

    console.log('Status da API business/profile:', businessProfileResponse.status);
    console.log('Response headers:', Object.fromEntries(businessProfileResponse.headers.entries()));
    
    if (businessProfileResponse.ok) {
      const businessData = await businessProfileResponse.json();
      console.log('✅ Dados da empresa:', {
        id: businessData.business.id,
        name: businessData.business.name,
        slug: businessData.business.slug,
        isApproved: businessData.business.isApproved
      });
    } else {
      const errorText = await businessProfileResponse.text();
      console.log('❌ Erro na API business/profile:', errorText);
    }

    // 4. Testar acesso à página /profile
    console.log('\n4. 📄 Testando acesso à página /profile...');
    const profileResponse = await fetch(`${BASE_URL}/profile`, {
      headers: {
        'Cookie': `auth-token=${authToken}`
      },
      redirect: 'manual' // Para capturar redirecionamentos
    });

    console.log('Status da página /profile:', profileResponse.status);
    
    if (profileResponse.status === 307 || profileResponse.status === 302) {
      const location = profileResponse.headers.get('location');
      console.log('🔄 Redirecionamento para:', location);
      
      if (location && location.includes('/empresa/')) {
        console.log('✅ Redirecionamento correto para página da empresa!');
      } else {
        console.log('❌ Redirecionamento incorreto');
      }
    } else {
      console.log('📄 Conteúdo da página profile carregado diretamente');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testMateusProfile();