// 🔍 CÓDIGO PARA TESTAR IPs ATUAIS E VERIFICAR STATUS
// Cole este código no console do navegador (F12)

console.log('🔍 TESTANDO IPs ATUAIS E STATUS DA PIXUP');
console.log('=========================================');

// Função para testar IPs atuais
async function testCurrentIPs() {
  try {
    // 1. Verificar IP atual do frontend
    console.log('🌐 Verificando IP atual do frontend...');
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    console.log('IP Atual (Frontend):', ipData.ip);
    
    // 2. Verificar IPs do Render novamente
    console.log('\n🌐 Verificando IPs do Render...');
    const dnsResponse = await fetch('https://dns.google/resolve?name=slotbox-api.onrender.com&type=A');
    const dnsData = await dnsResponse.json();
    
    if (dnsData.Answer) {
      console.log('IPs do Render:');
      dnsData.Answer.forEach((record, index) => {
        if (record.type === 1) { // A record
          console.log(`  ${index + 1}. ${record.data}`);
        }
      });
    }
    
    // 3. Testar autenticação Pixup diretamente
    console.log('\n🔐 Testando autenticação Pixup...');
    try {
      const authResponse = await fetch('https://api.pixupbr.com/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('ocosta4m_2683309738242919:fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1'),
          'Content-Type': 'application/json'
        }
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ Autenticação Pixup: SUCESSO');
        console.log('Token obtido:', authData.access_token ? 'Sim' : 'Não');
      } else {
        const errorData = await authResponse.json();
        console.log('❌ Autenticação Pixup: ERRO');
        console.log('Status:', authResponse.status);
        console.log('Erro:', errorData);
      }
    } catch (error) {
      console.log('❌ Erro na autenticação Pixup:', error.message);
    }
    
    // 4. Testar rota de depósito do backend
    console.log('\n💰 Testando rota de depósito...');
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
      
      const depositData = await depositResponse.json();
      console.log('Status da rota:', depositResponse.status);
      console.log('Resposta:', depositData);
      
      if (depositData.message && depositData.message.includes('IP bloqueado')) {
        console.log('❌ PROBLEMA: IP ainda bloqueado na Pixup');
        console.log('📋 IPs que precisam ser liberados:');
        console.log('  1. Frontend:', ipData.ip);
        if (dnsData.Answer) {
          dnsData.Answer.forEach((record, index) => {
            if (record.type === 1) {
              console.log(`  ${index + 2}. Render: ${record.data}`);
            }
          });
        }
      } else if (depositData.success) {
        console.log('✅ SUCESSO: Sistema funcionando!');
      }
      
    } catch (error) {
      console.log('❌ Erro na rota de depósito:', error.message);
    }
    
    // 5. Verificar se há mudança de IP
    console.log('\n🔄 Verificando se IPs mudaram...');
    const currentTime = new Date().toLocaleString();
    console.log('Teste realizado em:', currentTime);
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar teste
testCurrentIPs();

console.log('\n✅ Teste de IPs atuais iniciado!');

