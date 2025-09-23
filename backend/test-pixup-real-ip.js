// Teste para verificar IP real usado na chamada da Pixup
const axios = require('axios');

async function testPixupRealIP() {
  try {
    console.log('🔍 TESTANDO IP REAL USADO NA CHAMADA DA PIXUP');
    console.log('==============================================');
    
    // Configurações Pixup
    const PIXUP_CLIENT_ID = 'ocosta4m_2683309738242919';
    const PIXUP_CLIENT_SECRET = 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1';
    const PIXUP_API_URL = 'https://api.pixupbr.com';
    
    console.log('📡 Fazendo chamada de autenticação para Pixup...');
    
    // Fazer chamada de autenticação
    const authHeader = Buffer.from(`${PIXUP_CLIENT_ID}:${PIXUP_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(`${PIXUP_API_URL}/v2/oauth/token`, {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SlotBox-Test/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Autenticação bem-sucedida!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    // Agora testar endpoint de depósito
    console.log('\n💰 TESTANDO ENDPOINT DE DEPÓSITO...');
    
    const depositData = {
      amount: 10.00,
      external_id: `test-${Date.now()}`,
      payer: {
        name: "Teste SlotBox",
        document: "12345678901"
      },
      description: "Teste de depósito SlotBox"
    };
    
    const depositResponse = await axios.post(`${PIXUP_API_URL}/v2/pix/qrcode`, depositData, {
      headers: {
        'Authorization': `Bearer ${response.data.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SlotBox-Test/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Depósito criado com sucesso!');
    console.log('Status:', depositResponse.status);
    console.log('Response:', depositResponse.data);
    
  } catch (error) {
    console.log('❌ ERRO:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Data:', error.response?.data);
    
    if (error.response?.data?.message?.includes('IP bloqueado')) {
      console.log('\n🚨 ERRO DE IP BLOQUEADO CONFIRMADO!');
      console.log('💡 O IP usado para esta chamada não está na whitelist da Pixup');
    }
  }
}

testPixupRealIP();
