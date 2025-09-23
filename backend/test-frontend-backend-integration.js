// Script para testar integração completa frontend-backend
// Execute no console do navegador (F12)

console.log('🔍 TESTE COMPLETO FRONTEND-BACKEND PIXUP');
console.log('=========================================');

// Função para testar depósito completo
async function testCompleteDeposit() {
  try {
    console.log('\n💰 TESTANDO DEPÓSITO COMPLETO:');
    
    // 1. Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Usuário não está logado');
      return;
    }
    
    console.log('✅ Token encontrado');
    
    // 2. Fazer depósito
    const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: '2a3eb9e5-5c7e-4602-bd06-4302dd47c75f', // ID de teste
        amount: 20
      })
    });
    
    const depositData = await depositResponse.json();
    console.log('📊 Resposta do depósito:', depositData);
    
    if (depositData.success) {
      console.log('✅ Depósito criado com sucesso!');
      console.log('QR Code:', depositData.qrCode ? '✅ Gerado' : '❌ Não gerado');
      console.log('Identifier:', depositData.identifier);
      console.log('Transaction ID:', depositData.transaction_id);
      
      // 3. Testar verificação de status
      if (depositData.identifier) {
        console.log('\n🔍 TESTANDO VERIFICAÇÃO DE STATUS:');
        
        const statusResponse = await fetch(`https://slotbox-api.onrender.com/api/pixup/deposit/status/${depositData.identifier}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const statusData = await statusResponse.json();
        console.log('📊 Status do depósito:', statusData);
        
        if (statusData.success) {
          console.log('✅ Status verificado com sucesso!');
          console.log('Status atual:', statusData.status);
        } else {
          console.log('❌ Erro ao verificar status:', statusData.message);
        }
      }
      
    } else {
      console.log('❌ Erro ao criar depósito:', depositData.message);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Função para testar configurações do backend
async function testBackendConfig() {
  try {
    console.log('\n⚙️ TESTANDO CONFIGURAÇÕES DO BACKEND:');
    
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('📊 Configurações:', configData);
    
    if (configData.success) {
      console.log('✅ Backend respondendo corretamente');
      console.log('Client ID:', configData.config.clientId);
      console.log('API URL:', configData.config.apiUrl);
    } else {
      console.log('❌ Erro no backend:', configData.message);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar configurações:', error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  await testBackendConfig();
  await testCompleteDeposit();
  
  console.log('\n🏁 TESTE COMPLETO FINALIZADO!');
  console.log('Verifique os resultados acima para identificar problemas.');
}

// Executar testes
runAllTests();
