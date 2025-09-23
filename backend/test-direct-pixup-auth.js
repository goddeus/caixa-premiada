// Teste direto de autenticação Pixup
// Cole no console do navegador (F12)

console.log('🔍 TESTE DIRETO DE AUTENTICAÇÃO PIXUP');
console.log('====================================');

async function testDirectPixupAuth() {
  try {
    // Credenciais corretas (confirmadas pelo Render)
    const clientId = 'ocosta4m_2683309738242919';
    const clientSecret = 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1';
    
    console.log('🔐 TESTANDO AUTENTICAÇÃO:');
    console.log('Client ID:', clientId);
    console.log('Client Secret:', clientSecret.substring(0, 10) + '...');
    
    // Criar Basic Auth
    const credentials = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(credentials);
    
    console.log('Base64:', base64Credentials.substring(0, 20) + '...');
    
    // Testar autenticação
    const authResponse = await fetch('https://api.pixupbr.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: '{}'
    });
    
    console.log('Status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ AUTENTICAÇÃO BEM-SUCEDIDA!');
      console.log('Token:', authData.access_token ? '✅ Recebido' : '❌ Não recebido');
      console.log('Expires in:', authData.expires_in, 'segundos');
      
      // Testar criação de QR Code
      console.log('\n💰 TESTANDO CRIAÇÃO DE QR CODE:');
      const qrData = {
        amount: 20,
        external_id: `test_${Date.now()}`,
        payer: {
          name: "Teste Usuario",
          document: "12345678901"
        },
        description: "Teste de depósito",
        postbackUrl: "https://slotbox.shop/api/pixup/webhook/payment"
      };
      
      const qrResponse = await fetch('https://api.pixupbr.com/v2/pix/qrcode', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(qrData)
      });
      
      console.log('Status do QR Code:', qrResponse.status);
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR CODE CRIADO COM SUCESSO!');
        console.log('Transaction ID:', qrData.transactionId);
        console.log('QR Code:', qrData.qrcode ? '✅ Gerado' : '❌ Não gerado');
        console.log('Status:', qrData.status);
      } else {
        const errorData = await qrResponse.json();
        console.log('❌ Erro ao criar QR Code:', errorData);
      }
      
    } else {
      const errorData = await authResponse.json();
      console.log('❌ ERRO NA AUTENTICAÇÃO:');
      console.log('Status:', authResponse.status);
      console.log('Erro:', errorData);
      
      if (errorData.message && errorData.message.includes('IP bloqueado')) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO:');
        console.log('💡 Se depósito não exige IP, então o problema pode ser:');
        console.log('   1. Conta Pixup com problema');
        console.log('   2. Credenciais incorretas (mesmo que pareçam corretas)');
        console.log('   3. Formato de autenticação');
        console.log('   4. API da Pixup com problema');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testDirectPixupAuth();
