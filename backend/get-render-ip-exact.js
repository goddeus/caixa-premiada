// 🔍 CÓDIGO PARA DESCOBRIR IP EXATO DO RENDER
// Cole este código no console do navegador (F12)

console.log('🔍 DESCOBRINDO IP EXATO DO RENDER');

// Função para descobrir IP exato do Render
async function getExactRenderIP() {
  try {
    // 1. DNS Lookup detalhado
    console.log('🌐 Fazendo DNS lookup detalhado...');
    const dnsResponse = await fetch('https://dns.google/resolve?name=slotbox-api.onrender.com&type=A');
    const dnsData = await dnsResponse.json();
    console.log('📡 DNS A records completos:', dnsData);
    
    if (dnsData.Answer) {
      console.log('🎯 IPs do Render encontrados:');
      dnsData.Answer.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.data} (TTL: ${record.TTL})`);
      });
    }
    
    // 2. Testar conectividade direta
    console.log('\n🔌 Testando conectividade direta...');
    const startTime = Date.now();
    const response = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const endTime = Date.now();
    console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
    console.log(`📊 Status: ${response.status}`);
    
    // 3. Verificar headers detalhados
    console.log('\n📡 Headers detalhados do Render:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // 4. Testar via curl (simulado)
    console.log('\n🔍 Simulando curl para descobrir IP:');
    try {
      const curlResponse = await fetch('https://httpbin.org/headers');
      const curlData = await curlResponse.json();
      console.log('Headers via httpbin:', curlData);
    } catch (error) {
      console.log('Erro no httpbin:', error.message);
    }
    
    // 5. Testar via diferentes endpoints
    console.log('\n🌐 Testando diferentes endpoints do Render:');
    const endpoints = [
      'https://slotbox-api.onrender.com/',
      'https://slotbox-api.onrender.com/api/',
      'https://slotbox-api.onrender.com/api/pixup-test',
      'https://slotbox-api.onrender.com/api/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const epResponse = await fetch(endpoint);
        console.log(`✅ ${endpoint}: ${epResponse.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar
getExactRenderIP();

console.log('\n✅ Teste de IP exato iniciado!');

