const fetch = require('node-fetch')

async function testFollowersAPI() {
  try {
    console.log('🔍 Testando API de seguidores...\n')
    
    const businessId = 'cmfcsmxnr000et6ac3bg5ccu2' // República Arcade
    const url = `http://localhost:3000/api/business/${businessId}/followers`
    
    console.log(`📡 Fazendo requisição para: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📊 Status da resposta: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📤 Dados recebidos:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.error('❌ Erro na API:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error)
  }
}

testFollowersAPI()





