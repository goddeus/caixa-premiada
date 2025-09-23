// 🔍 SCRIPT PARA TESTAR INTEGRAÇÃO DO BACKEND
// Cole este código no console do navegador (F12) e execute

console.log('🔍 TESTANDO INTEGRAÇÃO DO BACKEND');
console.log('=================================');

async function testarIntegracaoBackend() {
  try {
    console.log('\n📋 TESTE 1: Verificar configurações do backend');
    console.log('---------------------------------------------');
    
    // Testar endpoint de configurações
    try {
      const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const configData = await configResponse.json();
      
      console.log('✅ Configurações do backend:');
      console.log('Client ID:', configData.config.clientId);
      console.log('API URL:', configData.config.apiUrl);
      console.log('Webhook Secret:', configData.config.webhookSecret);
      
    } catch (error) {
      console.log('❌ Erro ao obter configurações:', error.message);
    }
    
    console.log('\n📋 TESTE 2: Testar autenticação via backend');
    console.log('-------------------------------------------');
    
    // Testar se o backend consegue autenticar com a Pixup
    try {
      const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: 'auth'
        })
      });
      
      console.log('Status da autenticação:', authResponse.status);
      
      if (authResponse.status === 200) {
        const authData = await authResponse.json();
        console.log('✅ Autenticação via backend funcionando!');
        console.log('Resposta:', authData);
      } else {
        const authError = await authResponse.json();
        console.log('❌ Erro na autenticação via backend:', authError);
      }
      
    } catch (error) {
      console.log('❌ Erro no teste de autenticação:', error.message);
    }
    
    console.log('\n📋 TESTE 3: Testar depósito via backend');
    console.log('-------------------------------------');
    
    // Testar depósito via backend
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
      
      console.log('Status do depósito:', depositResponse.status);
      
      if (depositResponse.status === 200) {
        const depositData = await depositResponse.json();
        console.log('✅ Depósito via backend funcionando!');
        console.log('QR Code:', depositData.qrCode ? 'Presente' : 'Ausente');
        console.log('Transaction ID:', depositData.transaction_id);
        console.log('Amount:', depositData.amount);
      } else {
        const depositError = await depositResponse.json();
        console.log('❌ Erro no depósito via backend:', depositError);
        
        if (depositError.message?.includes('IP bloqueado')) {
          console.log('\n🚨 CONFIRMADO: Problema de IP bloqueado no backend!');
          console.log('💡 O backend está sendo bloqueado pela Pixup');
        } else if (depositError.message?.includes('autenticação')) {
          console.log('\n🚨 CONFIRMADO: Problema de autenticação no backend!');
          console.log('💡 As credenciais podem estar incorretas');
        } else {
          console.log('\n⚠️ Outro tipo de erro no backend');
        }
      }
      
    } catch (error) {
      console.log('❌ Erro no teste de depósito:', error.message);
    }
    
    console.log('\n📋 TESTE 4: Verificar logs do backend');
    console.log('------------------------------------');
    
    // Verificar se há logs de erro no backend
    try {
      const logsResponse = await fetch('https://slotbox-api.onrender.com/api/health');
      const logsData = await logsResponse.json();
      
      console.log('✅ Health check do backend:');
      console.log('Status:', logsData.status);
      console.log('Services:', logsData.services);
      
    } catch (error) {
      console.log('❌ Erro no health check:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar teste
testarIntegracaoBackend().then(() => {
  console.log('\n✅ TESTE DE INTEGRAÇÃO CONCLUÍDO!');
  console.log('📋 Verifique os resultados acima');
  console.log('🎯 Se o backend funcionar, o problema é de CORS no frontend');
  console.log('🎯 Se o backend falhar, o problema é de configuração da Pixup');
}).catch(error => {
  console.log('❌ Erro no teste:', error.message);
});
