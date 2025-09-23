// 🔍 SCRIPT DE MONITORAMENTO DE IPs EM TEMPO REAL
// Cole este código no console do navegador (F12) e execute

console.log('🔍 MONITORAMENTO DE IPs EM TEMPO REAL');
console.log('=====================================');

let ipHistory = [];
let testCount = 0;

async function monitorIPs() {
  try {
    testCount++;
    console.log(`\n🔍 TESTE ${testCount}: Verificando IPs...`);
    
    const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const backendData = await backendResponse.json();
    
    if (backendData.ipInfo) {
      const forwardedIPs = backendData.ipInfo.xForwardedFor?.split(',') || [];
      const cloudflareIP = forwardedIPs[1]?.trim();
      
      console.log('📋 IPs ATUAIS:');
      console.log('Client IP:', backendData.ipInfo.clientIP);
      console.log('X-Forwarded-For:', backendData.ipInfo.xForwardedFor);
      console.log('CF-Connecting-IP:', backendData.ipInfo.cfConnectingIP);
      console.log('CF-Ray:', backendData.ipInfo.cfRay);
      
      // Verificar se é um novo IP
      if (cloudflareIP && !ipHistory.includes(cloudflareIP)) {
        ipHistory.push(cloudflareIP);
        console.log(`\n🆕 NOVO IP DETECTADO: ${cloudflareIP}`);
        console.log('💡 ADICIONE ESTE IP NA WHITELIST DA PIXUP!');
      } else if (cloudflareIP) {
        console.log(`\n🔄 IP RECORRENTE: ${cloudflareIP}`);
      }
      
      // Mostrar histórico de IPs
      if (ipHistory.length > 0) {
        console.log('\n📋 HISTÓRICO DE IPs DO CLOUDFLARE:');
        ipHistory.forEach((ip, index) => {
          console.log(`  ${index + 1}. ${ip}`);
        });
      }
      
      // Testar depósito
      console.log('\n🧪 TESTANDO DEPÓSITO...');
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
        
        if (depositResponse.status === 200) {
          console.log('🎉 SUCESSO! Depósito funcionando!');
          console.log('✅ PROBLEMA RESOLVIDO!');
          return; // Parar monitoramento
        } else if (depositResponse.status === 500) {
          const errorData = await depositResponse.json();
          if (errorData.message?.includes('IP bloqueado')) {
            console.log('❌ AINDA BLOQUEADO - IP não está na whitelist');
          } else {
            console.log('⚠️ Outro erro:', errorData.message);
          }
        }
        
      } catch (error) {
        console.log('❌ Erro no teste de depósito:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro no monitoramento:', error.message);
  }
}

// Executar monitoramento a cada 30 segundos
console.log('🚀 INICIANDO MONITORAMENTO...');
console.log('⏰ Verificando IPs a cada 30 segundos...');
console.log('🛑 Para parar, pressione Ctrl+C ou feche o console');

// Primeira execução
monitorIPs();

// Executar a cada 30 segundos
const interval = setInterval(monitorIPs, 30000);

// Parar após 10 minutos
setTimeout(() => {
  clearInterval(interval);
  console.log('\n⏰ Monitoramento finalizado após 10 minutos');
  console.log('📋 IPs encontrados:', ipHistory);
}, 600000);
