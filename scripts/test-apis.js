const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testando APIs...\n');
  
  const apis = [
    { name: 'Posts', url: '/api/posts' },
    { name: 'Empresas', url: '/api/business/list' },
    { name: 'Banners', url: '/api/banners' },
    { name: 'Cupons', url: '/api/coupons/recent' },
    { name: 'Clima', url: '/api/weather' },
    { name: 'Auth Me', url: '/api/auth/me' }
  ];
  
  for (const api of apis) {
    try {
      console.log(`📡 Testando ${api.name}...`);
      const response = await fetch(`${baseUrl}${api.url}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${api.name}: OK (${response.status})`);
        if (data.posts) console.log(`   📊 Posts: ${data.posts.length}`);
        if (data.businesses) console.log(`   🏢 Empresas: ${data.businesses.length}`);
        if (data.banners) console.log(`   🖼️ Banners: ${data.banners.length}`);
        if (data.coupons) console.log(`   🎫 Cupons: ${data.coupons.length}`);
        if (data.user) console.log(`   👤 Usuário: ${data.user.email}`);
      } else {
        console.log(`❌ ${api.name}: ERRO ${response.status} - ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.log(`💥 ${api.name}: FALHA - ${error.message}`);
    }
    console.log('');
  }
}

testAPIs().catch(console.error);
