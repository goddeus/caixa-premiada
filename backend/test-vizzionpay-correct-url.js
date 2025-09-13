const axios = require('axios');
const config = require('./src/config/index');

async function testVizzionPayCorrectUrl() {
  console.log('🔍 Testando VizzionPay com URL correta...');
  console.log('='.repeat(60));
  
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
  
  const testData = {
    amount: 20.00,
    currency: 'BRL',
    payment_method: 'pix',
    reference: 'TEST-CORRECT-URL-' + Date.now(),
    customer: {
      name: 'Teste Usuario',
      email: 'teste@teste.com',
      document: '12345678901',
      document_type: 'CPF'
    },
    notification_url: `${config.api.baseUrl}/api/deposit/callback`,
    expiration_time: 3600,
    description: 'Teste com URL correta VizzionPay',
    pix_key: config.vizzionpay.pixKey,
    pix_key_type: config.vizzionpay.pixKeyType
  };
  
  console.log('\n📤 Enviando dados para VizzionPay...');
  console.log('URL completa:', config.vizzionpay.baseUrl + '/payments');
  console.log('Dados:', JSON.stringify(testData, null, 2));
  
  try {
    console.log('\n🔄 Tentando endpoint: /payments');
    const response = await client.post('/payments', testData);
    
    console.log('\n✅ Resposta VizzionPay:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Verificar se tem QR Code na resposta
    const responseData = response.data.data || response.data;
    const hasQrCode = responseData.qr_code_base64 || responseData.qr_code || responseData.qrcode;
    const hasPixText = responseData.qr_code_text || responseData.pix_copy_paste || responseData.emv;
    
    console.log('\n📊 Análise da resposta:');
    console.log('- QR Code Base64:', hasQrCode ? '✅ Presente' : '❌ Ausente');
    console.log('- Código PIX:', hasPixText ? '✅ Presente' : '❌ Ausente');
    console.log('- Gateway ID:', responseData.id || responseData.transaction_id || 'N/A');
    
    if (hasQrCode || hasPixText) {
      console.log('\n🎉 SUCESSO! A integração está funcionando!');
    } else {
      console.log('\n⚠️ Resposta recebida, mas sem QR Code. Verificar formato da resposta.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n💡 Possível problema: API Key inválida ou expirada');
      } else if (error.response.status === 403) {
        console.log('\n💡 Possível problema: Sem permissão para acessar o endpoint');
      } else if (error.response.status === 422) {
        console.log('\n💡 Possível problema: Dados inválidos enviados');
      } else if (error.response.status === 404) {
        console.log('\n💡 Possível problema: Endpoint não encontrado');
      }
    } else if (error.request) {
      console.error('Request error - sem resposta do servidor');
      console.log('\n💡 Possível problema: URL incorreta ou servidor indisponível');
    } else {
      console.error('Erro desconhecido:', error.message);
    }
  }
}

// Executar teste
testVizzionPayCorrectUrl();
