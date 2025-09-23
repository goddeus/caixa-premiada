// Script para debug completo do erro de IP
// Cole no console do navegador (F12)

console.log('🔍 DEBUG COMPLETO DO ERRO DE IP');
console.log('================================');

async function debugIPError() {
  try {
    // 1. Verificar configurações do backend
    console.log('\n⚙️ VERIFICANDO CONFIGURAÇÕES:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Status:', configResponse.status);
    console.log('Configurações:', configData);
    
    if (!configData.success) {
      console.log('❌ Backend com problema');
      return;
    }
    
    // 2. Verificar se a URL está correta
    if (configData.config.apiUrl !== 'https://api.pixupbr.com') {
      console.log('❌ URL incorreta:', configData.config.apiUrl);
      console.log('💡 Deve ser: https://api.pixupbr.com');
    } else {
      console.log('✅ URL correta');
    }
    
    // 3. Verificar IPs do backend
    console.log('\n🌐 VERIFICANDO IPs DO BACKEND:');
    console.log('Client IP:', configData.ipInfo?.clientIP);
    console.log('X-Forwarded-For:', configData.ipInfo?.xForwardedFor);
    console.log('X-Real-IP:', configData.ipInfo?.xRealIP);
    console.log('CF-Connecting-IP:', configData.ipInfo?.cfConnectingIP);
    
    // 4. Testar depósito se usuário estiver logado
    const token = localStorage.getItem('token');
    if (token) {
      console.log('\n💰 TESTANDO DEPÓSITO:');
      
      const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: '2a3eb9e5-5c7e-4602-bd06-4302dd47c75f',
          amount: 20
        })
      });
      
      const depositData = await depositResponse.json();
      console.log('Status:', depositResponse.status);
      console.log('Resposta:', depositData);
      
      if (depositData.message && depositData.message.includes('IP bloqueado')) {
        console.log('\n🚨 ERRO DE IP CONFIRMADO!');
        console.log('💡 Possíveis soluções:');
        console.log('   1. Render não fez deploy ainda');
        console.log('   2. Cache do Render');
        console.log('   3. Variáveis de ambiente não atualizadas');
        console.log('   4. Serviço errado sendo usado');
        console.log('   5. Headers ainda presentes no código');
        
        // 5. Verificar se é problema de cache
        console.log('\n🔄 TESTANDO COM TIMESTAMP:');
        const timestamp = Date.now();
        const cacheResponse = await fetch(`https://slotbox-api.onrender.com/api/pixup-test?t=${timestamp}`);
        const cacheData = await cacheResponse.json();
        console.log('Cache test:', cacheData);
      }
    } else {
      console.log('\n💡 Faça login para testar o depósito');
    }
    
  } catch (error) {
    console.log('❌ Erro no debug:', error.message);
  }
}

// Executar debug
debugIPError();
