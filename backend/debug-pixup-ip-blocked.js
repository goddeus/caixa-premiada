const axios = require('axios');

console.log('🔍 DEBUG: Investigando problema de IP bloqueado na Pixup');
console.log('====================================================');

// Configurações da Pixup
const PIXUP_CONFIG = {
  clientId: 'ocosta4m_2683309738242919',
  clientSecret: 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1',
  apiUrl: 'https://api.pixupbr.com'
};

async function debugPixupConnection() {
  try {
    console.log('\n📋 CONFIGURAÇÕES ATUAIS:');
    console.log('Client ID:', PIXUP_CONFIG.clientId);
    console.log('API URL:', PIXUP_CONFIG.apiUrl);
    console.log('Client Secret:', PIXUP_CONFIG.clientSecret.substring(0, 10) + '...');

    // 1. Testar autenticação básica
    console.log('\n🔐 TESTE 1: Autenticação Básica');
    console.log('-------------------------------');
    
    const authHeader = Buffer.from(`${PIXUP_CONFIG.clientId}:${PIXUP_CONFIG.clientSecret}`).toString('base64');
    console.log('Auth Header:', `Basic ${authHeader.substring(0, 20)}...`);
    
    try {
      const authResponse = await axios.post(`${PIXUP_CONFIG.apiUrl}/v2/oauth/token`, {}, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Autenticação bem-sucedida!');
      console.log('Status:', authResponse.status);
      console.log('Response:', authResponse.data);
      
      const accessToken = authResponse.data.access_token;
      
      // 2. Testar endpoint de depósito
      console.log('\n💰 TESTE 2: Endpoint de Depósito');
      console.log('--------------------------------');
      
      const depositData = {
        amount: 10.00,
        external_id: `test-${Date.now()}`,
        payer: {
          name: "Teste SlotBox",
          document: "12345678901"
        },
        description: "Teste de depósito SlotBox"
      };
      
      console.log('Dados do depósito:', JSON.stringify(depositData, null, 2));
      
      try {
        const depositResponse = await axios.post(`${PIXUP_CONFIG.apiUrl}/v2/pix/qrcode`, depositData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Depósito criado com sucesso!');
        console.log('Status:', depositResponse.status);
        console.log('Response:', depositResponse.data);
        
      } catch (depositError) {
        console.log('❌ Erro no depósito:');
        console.log('Status:', depositError.response?.status);
        console.log('Status Text:', depositError.response?.statusText);
        console.log('Headers:', depositError.response?.headers);
        console.log('Data:', depositError.response?.data);
        console.log('Message:', depositError.message);
        
        // Analisar erro específico
        if (depositError.response?.data?.message) {
          const errorMsg = depositError.response.data.message;
          console.log('\n🔍 ANÁLISE DO ERRO:');
          if (errorMsg.includes('IP bloqueado')) {
            console.log('❌ PROBLEMA: IP do servidor está bloqueado');
            console.log('💡 SOLUÇÃO: Verificar IPs na whitelist da Pixup');
          } else if (errorMsg.includes('credenciais')) {
            console.log('❌ PROBLEMA: Credenciais inválidas');
            console.log('💡 SOLUÇÃO: Verificar Client ID e Secret');
          } else if (errorMsg.includes('campo obrigatório')) {
            console.log('❌ PROBLEMA: Dados obrigatórios faltando');
            console.log('💡 SOLUÇÃO: Verificar estrutura dos dados');
          }
        }
      }
      
    } catch (authError) {
      console.log('❌ Erro na autenticação:');
      console.log('Status:', authError.response?.status);
      console.log('Status Text:', authError.response?.statusText);
      console.log('Headers:', authError.response?.headers);
      console.log('Data:', authError.response?.data);
      console.log('Message:', authError.message);
      
      // Analisar erro de autenticação
      if (authError.response?.data?.message) {
        const errorMsg = authError.response.data.message;
        console.log('\n🔍 ANÁLISE DO ERRO DE AUTENTICAÇÃO:');
        if (errorMsg.includes('IP bloqueado')) {
          console.log('❌ PROBLEMA: IP do servidor está bloqueado na autenticação');
          console.log('💡 SOLUÇÃO: Adicionar IP do Render na whitelist da Pixup');
        } else if (errorMsg.includes('credenciais')) {
          console.log('❌ PROBLEMA: Credenciais inválidas');
          console.log('💡 SOLUÇÃO: Verificar Client ID e Secret');
        }
      }
    }

    // 3. Verificar IP atual do servidor
    console.log('\n🌐 TESTE 3: Verificar IP Atual');
    console.log('------------------------------');
    
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
      console.log('IP atual do servidor:', ipResponse.data.ip);
      
      // Verificar se é um dos IPs esperados
      const expectedIPs = ['35.160.120.126', '44.233.151.27', '34.211.200.85'];
      const currentIP = ipResponse.data.ip;
      
      if (expectedIPs.includes(currentIP)) {
        console.log('✅ IP está na lista esperada do Render');
      } else {
        console.log('⚠️ IP não está na lista esperada do Render');
        console.log('IPs esperados:', expectedIPs);
        console.log('IP atual:', currentIP);
      }
      
    } catch (ipError) {
      console.log('❌ Erro ao verificar IP:', ipError.message);
    }

    // 4. Testar diferentes serviços de IP
    console.log('\n🔍 TESTE 4: Verificar IPs via Diferentes Serviços');
    console.log('------------------------------------------------');
    
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipinfo.io/json',
      'https://httpbin.org/ip'
    ];
    
    for (const service of ipServices) {
      try {
        const response = await axios.get(service, { timeout: 5000 });
        console.log(`${service}:`, response.data);
      } catch (error) {
        console.log(`${service}: Erro -`, error.message);
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar debug
debugPixupConnection().then(() => {
  console.log('\n✅ Debug concluído!');
}).catch(error => {
  console.log('❌ Erro no debug:', error.message);
});
