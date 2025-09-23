// 🔍 SCRIPT PARA TESTAR CONFIGURAÇÕES DA PIXUP
// Cole este código no console do navegador (F12) e execute

console.log('🔍 TESTANDO CONFIGURAÇÕES DA PIXUP');
console.log('==================================');

async function testarConfiguracoesPixup() {
  try {
    console.log('\n📋 CONFIGURAÇÕES ATUAIS:');
    
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
    
    console.log('\n🧪 TESTE 1: Verificar URL da API');
    console.log('-------------------------------');
    
    // Testar diferentes URLs da API
    const apiUrls = [
      'https://api.pixupbr.com',
      'https://api.pixupbr.com/v2',
      'https://api.pixupbr.com/v2/',
      'https://api.pixupbr.com/api',
      'https://api.pixupbr.com/api/v2'
    ];
    
    for (const url of apiUrls) {
      try {
        console.log(`\n🔗 Testando: ${url}`);
        
        // Testar endpoint de autenticação
        const authResponse = await fetch(`${url}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: 'ocosta4m_2683309738242919',
            client_secret: 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1'
          })
        });
        
        console.log(`  Status: ${authResponse.status}`);
        
        if (authResponse.status === 200) {
          const authData = await authResponse.json();
          console.log(`  ✅ SUCESSO! Token obtido:`, authData.access_token ? 'Presente' : 'Ausente');
          console.log(`  Expires in: ${authData.expires_in} segundos`);
        } else if (authResponse.status === 404) {
          console.log(`  ❌ 404 - Endpoint não encontrado`);
        } else if (authResponse.status === 401) {
          console.log(`  ❌ 401 - Credenciais inválidas`);
        } else {
          const errorData = await authResponse.json();
          console.log(`  ❌ Erro ${authResponse.status}:`, errorData);
        }
        
      } catch (error) {
        console.log(`  ❌ Erro de conexão: ${error.message}`);
      }
    }
    
    console.log('\n🧪 TESTE 2: Verificar credenciais');
    console.log('--------------------------------');
    
    // Testar credenciais com URL correta
    const correctUrl = 'https://api.pixupbr.com';
    
    try {
      console.log(`\n🔐 Testando credenciais com ${correctUrl}`);
      
      // Testar com Basic Auth (como está implementado)
      const authHeader = btoa('ocosta4m_2683309738242919:fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1');
      
      const basicAuthResponse = await fetch(`${correctUrl}/v2/oauth/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      console.log(`Status Basic Auth: ${basicAuthResponse.status}`);
      
      if (basicAuthResponse.status === 200) {
        const basicAuthData = await basicAuthResponse.json();
        console.log('✅ Basic Auth funcionando!');
        console.log('Token:', basicAuthData.access_token ? 'Presente' : 'Ausente');
        console.log('Expires in:', basicAuthData.expires_in);
        
        // Testar endpoint de depósito
        console.log('\n🧪 TESTE 3: Testar endpoint de depósito');
        console.log('------------------------------------');
        
        const depositData = {
          amount: 10.00,
          external_id: `test-${Date.now()}`,
          payer: {
            name: "Teste SlotBox",
            document: "12345678901"
          },
          description: "Teste de depósito SlotBox"
        };
        
        const depositResponse = await fetch(`${correctUrl}/v2/pix/qrcode`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${basicAuthData.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(depositData)
        });
        
        console.log(`Status Depósito: ${depositResponse.status}`);
        
        if (depositResponse.status === 200) {
          const depositResult = await depositResponse.json();
          console.log('✅ Depósito funcionando!');
          console.log('QR Code:', depositResult.qrcode ? 'Presente' : 'Ausente');
          console.log('Transaction ID:', depositResult.transactionId);
        } else {
          const depositError = await depositResponse.json();
          console.log('❌ Erro no depósito:', depositError);
        }
        
      } else {
        const basicAuthError = await basicAuthResponse.json();
        console.log('❌ Erro Basic Auth:', basicAuthError);
      }
      
    } catch (error) {
      console.log('❌ Erro no teste de credenciais:', error.message);
    }
    
    console.log('\n🧪 TESTE 4: Verificar formato das credenciais');
    console.log('--------------------------------------------');
    
    // Verificar se as credenciais estão no formato correto
    const clientId = 'ocosta4m_2683309738242919';
    const clientSecret = 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1';
    
    console.log('Client ID:', clientId);
    console.log('Client ID Length:', clientId.length);
    console.log('Client Secret:', clientSecret.substring(0, 10) + '...');
    console.log('Client Secret Length:', clientSecret.length);
    
    // Verificar se são válidos
    if (clientId.length < 10) {
      console.log('⚠️ Client ID muito curto');
    }
    if (clientSecret.length < 20) {
      console.log('⚠️ Client Secret muito curto');
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar teste
testarConfiguracoesPixup().then(() => {
  console.log('\n✅ TESTE DE CONFIGURAÇÕES CONCLUÍDO!');
  console.log('📋 Verifique os resultados acima');
  console.log('🎯 Se algum teste funcionar, sabemos qual é o problema!');
}).catch(error => {
  console.log('❌ Erro no teste:', error.message);
});
