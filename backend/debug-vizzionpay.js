const axios = require('axios');
const config = require('./src/config/index');

async function debugVizzionPay() {
  try {
    console.log('🔍 Debugando integração VizzionPay...');
    console.log('📋 Configurações:');
    console.log('- API Key:', config.vizzionpay.apiKey ? '✅ Configurada' : '❌ Não configurada');
    console.log('- Base URL:', config.vizzionpay.baseUrl);
    console.log('- PIX Key:', config.vizzionpay.pixKey);
    console.log('- PIX Key Type:', config.vizzionpay.pixKeyType);
    console.log('- Webhook Secret:', config.vizzionpay.webhookSecret ? '✅ Configurada' : '❌ Não configurada');
    
    const client = axios.create({
      baseURL: config.vizzionpay.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.vizzionpay.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Dados de teste
    const testData = {
      amount: 20.00,
      currency: 'BRL',
      payment_method: 'pix',
      reference: 'DEBUG-' + Date.now(),
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
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Verificar se tem QR code
    if (response.data?.data?.qr_code_base64) {
      console.log('\n🎯 QR Code encontrado!');
      console.log('Tamanho do base64:', response.data.data.qr_code_base64.length);
    } else if (response.data?.qr_code_base64) {
      console.log('\n🎯 QR Code encontrado (formato alternativo)!');
      console.log('Tamanho do base64:', response.data.qr_code_base64.length);
    } else {
      console.log('\n❌ QR Code não encontrado na resposta');
      console.log('Campos disponíveis:', Object.keys(response.data));
    }
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Headers:', error.response.headers);
      console.error('📊 Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📊 Request:', error.request);
    }
  }
}

debugVizzionPay();
