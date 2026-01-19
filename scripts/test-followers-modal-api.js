const fetch = require('node-fetch')

async function testFollowersModalAPI() {
  try {
    console.log('🧪 Testando API do modal de seguidores...\n')

    // 1. Buscar ID da República Arcade
    const businessId = 'cmfcsmxnr000et6ac3bg5ccu2' // ID da República Arcade

    console.log(`🏢 Testando para empresa ID: ${businessId}`)

    // 2. Simular chamada da API
    const response = await fetch(`http://localhost:3000/api/business/${businessId}/followers`)
    
    console.log(`📡 Status da resposta: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📤 Dados retornados:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.followers && data.followers.length > 0) {
        console.log(`\n✅ ${data.followers.length} seguidores encontrados:`)
        data.followers.forEach((follower, index) => {
          console.log(`${index + 1}. ${follower.name} (${follower.email})`)
        })
      } else {
        console.log('\n❌ Nenhum seguidor retornado pela API')
      }
    } else {
      const errorText = await response.text()
      console.log(`❌ Erro na API: ${response.status}`)
      console.log(`📄 Resposta: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
    console.log('\n💡 Dica: Certifique-se de que o servidor Next.js está rodando (npm run dev)')
  }
}

testFollowersModalAPI()





