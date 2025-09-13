const axios = require('axios');
const config = require('./src/config/index');

async function testVizzionPayReal() {
  try {
    console.log('🔍 Testando integração VizzionPay REAL...');
    console.log('📋 Configurações:');
    console.log('- API Key:', config.vizzionpay.apiKey ? '✅ Configurada' : '❌ Não configurada');
    console.log('- Base URL:', config.vizzionpay.baseUrl);
    console.log('- PIX Key:', config.vizzionpay.pixKey);
    console.log('- PIX Key Type:', config.vizzionpay.pixKeyType);
    
    const client = axios.create({
      baseURL: config.vizzionpay.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.vizzionpay.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Dados de teste real
    const testData = {
      amount: 20.00,
      currency: 'BRL',
      payment_method: 'pix',
      reference: 'TEST-' + Date.now(),
      customer: {
        name: 'Teste Usuario',
        email: 'teste@teste.com',
        document: '12345678901',
        document_type: 'CPF'
      },
      notification_url: `${config.api.baseUrl}/api/deposit/callback`,
      expiration_time: 3600,
      description: 'Teste de integração VizzionPay',
      pix_key: config.vizzionpay.pixKey,
      pix_key_type: config.vizzionpay.pixKeyType
    };

    console.log('\n📤 Enviando dados para VizzionPay:');
    console.log(JSON.stringify(testData, null, 2));
    
    const response = await client.post('/pix/receive', testData);
    
    console.log('\n✅ Resposta VizzionPay:');
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Data completa:', JSON.stringify(response.data, null, 2));
    
    // Analisar estrutura da resposta
    const data = response.data;
    console.log('\n🔍 Análise da resposta:');
    console.log('- success:', data.success);
    console.log('- message:', data.message);
    console.log('- data existe:', !!data.data);
    
    if (data.data) {
      console.log('\n📊 Campos em data:');
      Object.keys(data.data).forEach(key => {
        console.log(`  - ${key}:`, typeof data.data[key], Array.isArray(data.data[key]) ? `[${data.data[key].length} items]` : data.data[key]);
      });
    }
    
    // Procurar por QR code
    console.log('\n🎯 Procurando QR Code:');
    const searchInObject = (obj, path = '') => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'string' && (key.toLowerCase().includes('qr') || key.toLowerCase().includes('pix'))) {
          console.log(`  ✅ Encontrado: ${currentPath} = ${value.substring(0, 100)}...`);
        } else if (typeof value === 'object' && value !== null) {
          searchInObject(value, currentPath);
        }
      }
    };
    
    searchInObject(data);
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('📊 Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📊 Request:', error.request);
    }
  }
}

testVizzionPayReal();