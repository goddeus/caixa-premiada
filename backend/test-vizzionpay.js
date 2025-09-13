const axios = require('axios');
const config = require('./src/config/index');

async function testVizzionPay() {
  try {
    console.log('🧪 Testando integração VizzionPay...');
    
    const client = axios.create({
      baseURL: config.vizzionpay.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.vizzionpay.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Dados de teste
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

    console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
    
    const response = await client.post('/pix/receive', testData);
    
    console.log('✅ Resposta VizzionPay:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testVizzionPay();
