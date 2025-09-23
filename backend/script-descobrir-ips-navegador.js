// 🔍 SCRIPT PARA DESCOBRIR IPs REAIS DAS REQUISIÇÕES
// Cole este código no console do navegador (F12)

console.log('🔍 DESCOBRINDO IPs REAIS DAS REQUISIÇÕES');
console.log('========================================');

// Função para capturar informações de IP
async function discoverRealIPs() {
  try {
    console.log('\n🌐 TESTE 1: Verificar IP atual do navegador');
    console.log('-------------------------------------------');
    
    // Testar diferentes serviços de IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://httpbin.org/ip',
      'https://ipinfo.io/json',
      'https://api.myip.com',
      'https://ipapi.co/json/'
    ];
    
    for (const service of ipServices) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        console.log(`✅ ${service}:`, data);
      } catch (error) {
        console.log(`❌ ${service}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 TESTE 2: Verificar IP do backend Render');
    console.log('------------------------------------------');
    
    // Testar endpoint do backend com informações de IP
    try {
      const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const backendData = await backendResponse.json();
      
      console.log('✅ Backend respondendo:', backendData);
      
      if (backendData.ipInfo) {
        console.log('\n📋 INFORMAÇÕES DE IP DO BACKEND:');
        console.log('===============================');
        console.log('Client IP:', backendData.ipInfo.clientIP);
        console.log('X-Forwarded-For:', backendData.ipInfo.xForwardedFor);
        console.log('CF-Connecting-IP:', backendData.ipInfo.cfConnectingIP);
        console.log('True-Client-IP:', backendData.ipInfo.allHeaders['true-client-ip']);
        console.log('CF-Ray:', backendData.ipInfo.cfRay);
        
        // Analisar cadeia de IPs
        const forwardedIPs = backendData.ipInfo.xForwardedFor?.split(',') || [];
        console.log('\n🔗 CADEIA DE IPs:');
        forwardedIPs.forEach((ip, index) => {
          console.log(`  ${index + 1}. ${ip.trim()}`);
        });
        
        // Verificar headers específicos
        console.log('\n📡 HEADERS IMPORTANTES:');
        for (const [key, value] of Object.entries(backendData.ipInfo.allHeaders)) {
          if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('cf-') || key.toLowerCase().includes('x-')) {
            console.log(`  ${key}: ${value}`);
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar backend:', error.message);
    }
    
    console.log('\n🔍 TESTE 3: Simular requisição de depósito');
    console.log('------------------------------------------');
    
    // Simular requisição de depósito para ver qual IP é usado
    try {
      const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          amount: 20
        })
      });
      
      console.log('📊 Status da requisição:', depositResponse.status);
      
      if (depositResponse.status === 500) {
        const errorData = await depositResponse.json();
        console.log('❌ Erro na requisição:', errorData);
        
        if (errorData.message?.includes('IP bloqueado')) {
          console.log('\n🚨 CONFIRMADO: IP bloqueado na requisição real!');
          console.log('💡 Isso confirma que o IP usado para a requisição não está na whitelist');
        }
      } else {
        console.log('✅ Requisição bem-sucedida!');
      }
      
    } catch (error) {
      console.log('❌ Erro na requisição de depósito:', error.message);
    }
    
    console.log('\n🔍 TESTE 4: Verificar DNS e conectividade');
    console.log('----------------------------------------');
    
    // Verificar DNS
    try {
      const dnsResponse = await fetch('https://dns.google/resolve?name=slotbox-api.onrender.com&type=A');
      const dnsData = await dnsResponse.json();
      console.log('🌐 DNS A records:', dnsData);
    } catch (error) {
      console.log('❌ Erro no DNS lookup:', error.message);
    }
    
    // Verificar conectividade
    try {
      const startTime = Date.now();
      const response = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const endTime = Date.now();
      console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
      console.log(`📊 Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Erro na conectividade:', error.message);
    }
    
    console.log('\n🔍 TESTE 5: Verificar headers da requisição');
    console.log('------------------------------------------');
    
    // Fazer requisição HEAD para ver headers
    try {
      const headResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test', {
        method: 'HEAD'
      });
      
      console.log('📋 Headers da resposta:');
      for (const [key, value] of headResponse.headers.entries()) {
        if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('cf-') || key.toLowerCase().includes('x-')) {
          console.log(`  ${key}: ${value}`);
        }
      }
    } catch (error) {
      console.log('❌ Erro no HEAD request:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar descoberta
discoverRealIPs().then(() => {
  console.log('\n✅ DESCOBERTA DE IPs CONCLUÍDA!');
  console.log('📋 Verifique os resultados acima para identificar os IPs reais');
  console.log('💡 Use essas informações para configurar a whitelist da Pixup');
}).catch(error => {
  console.log('❌ Erro na descoberta:', error.message);
});
