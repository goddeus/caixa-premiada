// 🔍 CÓDIGO PARA CONSOLE DO NAVEGADOR - DEBUG DE IPs
// Cole este código no console do navegador (F12)

console.log('🔍 DEBUG COMPLETO DE IPs E CONFIGURAÇÕES');
console.log('==========================================');

// 1. Informações do navegador
console.log('\n🌐 INFORMAÇÕES DO NAVEGADOR:');
console.log('User Agent:', navigator.userAgent);
console.log('Language:', navigator.language);
console.log('Platform:', navigator.platform);
console.log('Cookie Enabled:', navigator.cookieEnabled);
console.log('Online:', navigator.onLine);

// 2. Informações de rede
console.log('\n🌐 INFORMAÇÕES DE REDE:');
console.log('Connection:', navigator.connection ? {
  effectiveType: navigator.connection.effectiveType,
  downlink: navigator.connection.downlink,
  rtt: navigator.connection.rtt
} : 'Não disponível');

// 3. URLs e configurações
console.log('\n🔗 URLs E CONFIGURAÇÕES:');
console.log('Current URL:', window.location.href);
console.log('Origin:', window.location.origin);
console.log('Hostname:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
console.log('Port:', window.location.port);

// 4. Verificar configurações da API
console.log('\n⚙️ CONFIGURAÇÕES DA API:');
if (window.api) {
  console.log('API Base URL:', window.api.defaults?.baseURL);
  console.log('API Headers:', window.api.defaults?.headers);
} else {
  console.log('API não encontrada no window');
}

// 5. Verificar localStorage
console.log('\n💾 LOCAL STORAGE:');
console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
console.log('User Data:', localStorage.getItem('userData') ? 'Presente' : 'Ausente');
console.log('Todas as chaves:', Object.keys(localStorage));

// 6. Verificar sessionStorage
console.log('\n💾 SESSION STORAGE:');
console.log('Todas as chaves:', Object.keys(sessionStorage));

// 7. Testar conectividade com backend
console.log('\n🔌 TESTANDO CONECTIVIDADE:');

// Função para testar IPs
async function testIPs() {
  try {
    // Testar IP público
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    console.log('IP Público (Frontend):', ipData.ip);
    
    // Testar IP do backend via API
    try {
      const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const backendData = await backendResponse.json();
      console.log('Backend Status:', backendResponse.status);
      console.log('Backend Response:', backendData);
    } catch (error) {
      console.log('Erro ao conectar com backend:', error.message);
    }
    
    // Testar rota de depósito
    try {
      const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          amount: 20
        })
      });
      console.log('Deposit Route Status:', depositResponse.status);
      const depositData = await depositResponse.json();
      console.log('Deposit Response:', depositData);
    } catch (error) {
      console.log('Erro na rota de depósito:', error.message);
    }
    
  } catch (error) {
    console.log('Erro ao testar IPs:', error.message);
  }
}

// 8. Informações de performance
console.log('\n⚡ PERFORMANCE:');
console.log('Load Time:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms');
console.log('DOM Ready:', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart, 'ms');

// 9. Informações de memória (se disponível)
if (performance.memory) {
  console.log('\n💾 MEMÓRIA:');
  console.log('Used JS Heap:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), 'MB');
  console.log('Total JS Heap:', Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), 'MB');
  console.log('JS Heap Limit:', Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), 'MB');
}

// 10. Executar testes
testIPs();

console.log('\n✅ DEBUG COMPLETO FINALIZADO!');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('1. Verificar IP público do frontend');
console.log('2. Verificar se backend está respondendo');
console.log('3. Verificar se rotas da Pixup estão ativas');
console.log('4. Adicionar IP do Render na whitelist da Pixup');

