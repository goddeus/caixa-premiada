// 🔍 CÓDIGO PARA DESCOBRIR IP REAL DO RENDER
// Cole este código no console do navegador (F12)

console.log('🔍 DESCOBRINDO IP REAL DO RENDER');
console.log('=================================');

// Função para descobrir IP do Render
async function discoverRenderIP() {
  try {
    console.log('🌐 Testando diferentes serviços para descobrir IP do Render...');
    
    // 1. Testar via API do próprio backend
    try {
      const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const backendData = await backendResponse.json();
      console.log('✅ Backend respondendo:', backendData);
    } catch (error) {
      console.log('❌ Erro no backend:', error.message);
    }
    
    // 2. Testar via headers HTTP
    try {
      const response = await fetch('https://slotbox-api.onrender.com/api/pixup-test', {
        method: 'HEAD'
      });
      console.log('📡 Headers da resposta:');
      for (let [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
    } catch (error) {
      console.log('❌ Erro ao obter headers:', error.message);
    }
    
    // 3. Testar via diferentes serviços de IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      'https://httpbin.org/ip',
      'https://api.myip.com',
      'https://ipapi.co/ip/',
      'https://api.ipify.org?format=text'
    ];
    
    console.log('\n🌐 Testando serviços de IP...');
    for (const service of ipServices) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        console.log(`✅ ${service}:`, data);
      } catch (error) {
        console.log(`❌ ${service}:`, error.message);
      }
    }
    
    // 4. Testar via DNS lookup
    console.log('\n🔍 Testando DNS lookup...');
    try {
      const dnsResponse = await fetch('https://dns.google/resolve?name=slotbox-api.onrender.com&type=A');
      const dnsData = await dnsResponse.json();
      console.log('DNS A records:', dnsData);
    } catch (error) {
      console.log('❌ Erro no DNS lookup:', error.message);
    }
    
    // 5. Testar via traceroute (simulado)
    console.log('\n🔍 Testando conectividade...');
    try {
      const startTime = Date.now();
      const response = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const endTime = Date.now();
      console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
      console.log(`📊 Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Erro na conectividade:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar descoberta
discoverRenderIP();

console.log('\n✅ Teste de descoberta de IP iniciado!');
console.log('📋 Verifique os resultados acima para encontrar o IP real do Render.');

