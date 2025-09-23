// Script para testar integração completa no navegador
// Cole no console do navegador (F12)

console.log('🔍 TESTE COMPLETO DE INTEGRAÇÃO PIXUP');
console.log('=====================================');

async function testCompleteIntegration() {
  try {
    // 1. Verificar configurações do backend
    console.log('\n⚙️ VERIFICANDO CONFIGURAÇÕES:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    console.log('Backend config:', configData);
    
    if (!configData.success) {
      console.log('❌ Backend não está respondendo corretamente');
      return;
    }
    
    // 2. Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Usuário não está logado');
      console.log('💡 Faça login primeiro para testar o depósito');
      return;
    }
    
    console.log('✅ Usuário logado');
    
    // 3. Testar depósito
    console.log('\n💰 TESTANDO DEPÓSITO:');
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
    console.log('Resposta do depósito:', depositData);
    
    if (depositData.success) {
      console.log('✅ Depósito criado com sucesso!');
      console.log('QR Code:', depositData.qrCode ? '✅ Gerado' : '❌ Não gerado');
      console.log('Identifier:', depositData.identifier);
      console.log('Transaction ID:', depositData.transaction_id);
      
      // 4. Testar verificação de status
      if (depositData.identifier) {
        console.log('\n🔍 TESTANDO VERIFICAÇÃO DE STATUS:');
        const statusResponse = await fetch(`https://slotbox-api.onrender.com/api/pixup/deposit/status/${depositData.identifier}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const statusData = await statusResponse.json();
        console.log('Status do depósito:', statusData);
        
        if (statusData.success) {
          console.log('✅ Status verificado com sucesso!');
        } else {
          console.log('❌ Erro ao verificar status:', statusData.message);
        }
      }
      
    } else {
      console.log('❌ Erro ao criar depósito:', depositData.message);
      console.log('💡 Verifique se o backend foi atualizado no Render');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testCompleteIntegration();
