// Script simples para testar autenticação Pixup
// Cole no console do navegador (F12)

console.log('🔍 TESTE SIMPLES DE AUTENTICAÇÃO PIXUP');
console.log('=====================================');

async function testSimpleAuth() {
  try {
    // 1. Testar endpoint de configuração
    console.log('\n⚙️ TESTANDO ENDPOINT DE CONFIGURAÇÃO:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Status:', configResponse.status);
    console.log('Configurações:', configData);
    
    if (!configData.success) {
      console.log('❌ Endpoint com problema:', configData.message);
      return;
    }
    
    // 2. Verificar credenciais
    console.log('\n🔐 VERIFICANDO CREDENCIAIS:');
    console.log('Client ID:', configData.config.clientId);
    console.log('API URL:', configData.config.apiUrl);
    console.log('Serviço:', configData.service?.type);
    
    // 3. Testar autenticação diretamente
    console.log('\n🔑 TESTANDO AUTENTICAÇÃO DIRETA:');
    
    const clientId = 'ocosta4m_2683309738242919';
    const clientSecret = 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1';
    
    const credentials = `${clientId}:${clientSecret}`;
    const base64Credentials = btoa(credentials);
    
    console.log('Testando com credenciais:', clientId);
    
    const authResponse = await fetch('https://api.pixupbr.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: '{}'
    });
    
    console.log('Status da autenticação:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Autenticação bem-sucedida!');
      console.log('Token recebido:', authData.access_token ? '✅' : '❌');
    } else {
      const errorData = await authResponse.json();
      console.log('❌ Erro na autenticação:', errorData);
      
      if (errorData.message && errorData.message.includes('IP bloqueado')) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO:');
        console.log('💡 Se depósito não exige IP, então pode ser:');
        console.log('   1. Credenciais incorretas');
        console.log('   2. Conta Pixup com problema');
        console.log('   3. Formato de autenticação');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testSimpleAuth();
