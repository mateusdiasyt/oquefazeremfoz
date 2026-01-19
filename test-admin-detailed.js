async function testAdminAccess() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Fazer login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@oqfoz.com',
        password: 'admin123'
      })
    });
    
    console.log('✅ Login realizado com sucesso!');
    
    // Extrair cookies do cabeçalho Set-Cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('🍪 Set-Cookie headers:', setCookieHeader);
    
    if (!setCookieHeader) {
      console.log('❌ Nenhum cookie foi definido no login');
      return;
    }
    
    // Extrair o token do cookie
    let authToken = null;
    if (setCookieHeader.includes('auth-token=')) {
      authToken = setCookieHeader.split('auth-token=')[1].split(';')[0];
    }
    
    console.log('🔍 Token extraído:', authToken ? authToken.substring(0, 50) + '...' : 'null');
    
    if (!authToken) {
      console.log('❌ Token não encontrado nos cookies');
      return;
    }
    
    // Testar acesso à página /admin com cookies
    console.log('🔍 Testando acesso à página /admin com cookies...');
    
    try {
      const adminResponse = await fetch('http://localhost:3000/admin', {
        headers: {
          'Cookie': `auth-token=${authToken}`
        },
        redirect: 'manual' // Não seguir redirecionamentos
      });
      
      console.log('📊 Status da página /admin:', adminResponse.status);
      
      if (adminResponse.status === 200) {
        console.log('✅ Acesso ao admin bem-sucedido!');
        const content = await adminResponse.text();
        console.log('📄 Conteúdo da página (primeiros 200 chars):', content.substring(0, 200));
      } else if (adminResponse.status === 307 || adminResponse.status === 302) {
        console.log('🔄 Redirecionamento para:', adminResponse.headers.get('location'));
      } else {
        console.log('⚠️ Status inesperado:', adminResponse.status);
      }
      
    } catch (error) {
      console.log('❌ Erro de rede:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
  }
}

testAdminAccess();