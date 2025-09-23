// 🔍 SCRIPT ESPECÍFICO PARA CAPTURAR IPs DAS REQUISIÇÕES PIXUP
// Cole este código no console do navegador (F12) e execute

console.log('🔍 CAPTURANDO IPs REAIS DAS REQUISIÇÕES PIXUP');
console.log('=============================================');

// Função para interceptar requisições
function interceptRequests() {
  console.log('\n📡 INTERCEPTANDO REQUISIÇÕES...');
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    // Verificar se é requisição para Pixup
    if (typeof url === 'string' && url.includes('pixup')) {
      console.log('\n🎯 REQUISIÇÃO PIXUP DETECTADA:');
      console.log('URL:', url);
      console.log('Método:', options.method || 'GET');
      console.log('Headers:', options.headers);
      console.log('Body:', options.body);
      
      // Fazer a requisição original
      return originalFetch.apply(this, args)
        .then(response => {
          console.log('📊 Resposta da Pixup:');
          console.log('Status:', response.status);
          console.log('Headers:', Object.fromEntries(response.headers.entries()));
          
          // Clonar resposta para ler o body
          const clonedResponse = response.clone();
          clonedResponse.text().then(text => {
            try {
              const data = JSON.parse(text);
              console.log('Data:', data);
              
              if (data.message?.includes('IP bloqueado')) {
                console.log('\n🚨 ERRO DE IP BLOQUEADO CONFIRMADO!');
                console.log('💡 A requisição está sendo bloqueada pela Pixup');
              }
            } catch (e) {
              console.log('Response text:', text);
            }
          });
          
          return response;
        })
        .catch(error => {
          console.log('❌ Erro na requisição:', error);
          return Promise.reject(error);
        });
    }
    
    // Para outras requisições, usar fetch original
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Interceptação configurada');
}

// Função para descobrir IPs
async function discoverIPs() {
  try {
    console.log('\n🌐 DESCOBRINDO IPs ATUAIS...');
    
    // 1. IP do navegador
    console.log('\n1️⃣ IP DO NAVEGADOR:');
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      console.log('IP Público:', ipData.ip);
    } catch (error) {
      console.log('Erro ao obter IP:', error.message);
    }
    
    // 2. IP do backend
    console.log('\n2️⃣ IP DO BACKEND:');
    try {
      const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const backendData = await backendResponse.json();
      
      if (backendData.ipInfo) {
        console.log('Client IP:', backendData.ipInfo.clientIP);
        console.log('X-Forwarded-For:', backendData.ipInfo.xForwardedFor);
        console.log('CF-Connecting-IP:', backendData.ipInfo.cfConnectingIP);
        console.log('True-Client-IP:', backendData.ipInfo.allHeaders['true-client-ip']);
        
        // Analisar cadeia de IPs
        const forwardedIPs = backendData.ipInfo.xForwardedFor?.split(',') || [];
        console.log('\n🔗 CADEIA DE IPs:');
        forwardedIPs.forEach((ip, index) => {
          console.log(`  ${index + 1}. ${ip.trim()}`);
        });
      }
    } catch (error) {
      console.log('Erro ao verificar backend:', error.message);
    }
    
    // 3. Testar requisição real
    console.log('\n3️⃣ TESTANDO REQUISIÇÃO REAL:');
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
      
      console.log('Status:', depositResponse.status);
      
      if (depositResponse.status === 500) {
        const errorData = await depositResponse.json();
        console.log('Erro:', errorData);
        
        if (errorData.message?.includes('IP bloqueado')) {
          console.log('\n🚨 CONFIRMADO: IP bloqueado!');
          console.log('💡 A requisição está sendo bloqueada pela Pixup');
        }
      }
    } catch (error) {
      console.log('Erro na requisição:', error.message);
    }
    
  } catch (error) {
    console.log('Erro geral:', error.message);
  }
}

// Executar
console.log('🚀 INICIANDO DESCOBERTA DE IPs...');
interceptRequests();
discoverIPs().then(() => {
  console.log('\n✅ DESCOBERTA CONCLUÍDA!');
  console.log('📋 Verifique os resultados acima');
  console.log('💡 Use essas informações para configurar a whitelist da Pixup');
});
