const axios = require('axios');
const config = require('./src/config/index');

async function testVizzionPayQRCode() {
  try {
    console.log('🔍 Testando geração de QR Code VizzionPay...');
    console.log('📋 Configurações:');
    console.log('- API Key:', config.vizzionpay.apiKey ? '✅ Configurada' : '❌ Não configurada');
    console.log('- Base URL:', config.vizzionpay.baseUrl);
    console.log('- PIX Key:', config.vizzionpay.pixKey);
    console.log('- PIX Key Type:', config.vizzionpay.pixKeyType);
    console.log('- Webhook Secret:', config.vizzionpay.webhookSecret ? '✅ Configurada' : '❌ Não configurada');
    
    if (!config.vizzionpay.apiKey) {
      console.error('❌ API Key não configurada!');
      return;
    }
    
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
      reference: 'TEST-QR-' + Date.now(),
      customer: {
        name: 'Teste Usuario QR',
        email: 'teste.qr@teste.com',
        document: '12345678901',
        document_type: 'CPF'
      },
      notification_url: `${config.api.baseUrl}/api/deposit/callback`,
      expiration_time: 3600,
      description: 'Teste de geração QR Code VizzionPay',
      pix_key: config.vizzionpay.pixKey,
      pix_key_type: config.vizzionpay.pixKeyType
    };

    console.log('\n📤 Enviando dados para VizzionPay:');
    console.log(JSON.stringify(testData, null, 2));
    
    // Tentar diferentes endpoints
    let response;
    let endpointUsed = '';
    
    try {
      console.log('\n🔄 Tentando endpoint: /v1/payments');
      response = await client.post('/v1/payments', testData);
      endpointUsed = '/v1/payments';
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Endpoint /v1/payments não encontrado, tentando /pix/payments');
        try {
          response = await client.post('/pix/payments', testData);
          endpointUsed = '/pix/payments';
        } catch (error2) {
          console.log('⚠️ Endpoint /pix/payments não encontrado, tentando /pix/receive');
          response = await client.post('/pix/receive', testData);
          endpointUsed = '/pix/receive';
        }
      } else {
        throw error;
      }
    }
    
    console.log(`\n✅ Resposta VizzionPay (endpoint: ${endpointUsed}):`);
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
        const value = data.data[key];
        console.log(`  - ${key}:`, typeof value, Array.isArray(value) ? `[${value.length} items]` : 
          typeof value === 'string' && value.length > 100 ? `${value.substring(0, 50)}...` : value);
      });
    }
    
    // Procurar por QR code usando a mesma lógica do serviço
    console.log('\n🎯 Procurando QR Code (usando lógica do serviço):');
    
    const vizzionData = data.data || data;
    let qrBase64 = null;
    let qrText = null;
    
    // Função para buscar recursivamente por campos de QR Code
    const findQrCodeField = (obj, fieldNames) => {
      for (const fieldName of fieldNames) {
        if (obj[fieldName]) {
          return obj[fieldName];
        }
      }
      return null;
    };
    
    // Buscar QR Code em base64
    const qrBase64Fields = [
      'qr_code_base64', 'qr_code', 'qrcode', 'qrCode', 'qr_base64',
      'pix_qr_code', 'pix_qr', 'qr_image', 'qr_image_base64'
    ];
    qrBase64 = findQrCodeField(vizzionData, qrBase64Fields);
    
    // Buscar código PIX copy/paste
    const qrTextFields = [
      'qr_code_text', 'pix_copy_paste', 'pixCopyPaste', 'copy_paste',
      'pix_code', 'pix_text', 'qr_text', 'emv', 'brcode'
    ];
    qrText = findQrCodeField(vizzionData, qrTextFields);
    
    // Se não encontrou nos campos diretos, buscar recursivamente
    if (!qrBase64 || !qrText) {
      const searchInObject = (obj, path = '') => {
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          
          if (typeof value === 'string') {
            // Verificar se é um QR code base64
            if (key.toLowerCase().includes('qr') && value.length > 100 && value.includes('data:image')) {
              if (!qrBase64) {
                qrBase64 = value;
                console.log(`  ✅ QR Base64 encontrado em: ${currentPath}`);
              }
            }
            // Verificar se é um código PIX
            if ((key.toLowerCase().includes('pix') || key.toLowerCase().includes('copy')) && value.length > 50) {
              if (!qrText) {
                qrText = value;
                console.log(`  ✅ QR Text encontrado em: ${currentPath}`);
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            searchInObject(value, currentPath);
          }
        }
      };
      
      searchInObject(vizzionData);
    }
    
    // Resultado final
    console.log('\n📋 RESULTADO FINAL:');
    console.log('='.repeat(50));
    
    if (qrBase64) {
      console.log('✅ QR Code Base64: ENCONTRADO');
      console.log(`   Tamanho: ${qrBase64.length} caracteres`);
      console.log(`   Tipo: ${qrBase64.includes('data:image') ? 'Com prefixo data:image' : 'Base64 puro'}`);
      console.log(`   Início: ${qrBase64.substring(0, 50)}...`);
    } else {
      console.log('❌ QR Code Base64: NÃO ENCONTRADO');
    }
    
    if (qrText) {
      console.log('✅ QR Code Text: ENCONTRADO');
      console.log(`   Tamanho: ${qrText.length} caracteres`);
      console.log(`   Início: ${qrText.substring(0, 50)}...`);
    } else {
      console.log('❌ QR Code Text: NÃO ENCONTRADO');
    }
    
    // Verificar se tem gateway_id
    const gatewayId = vizzionData.id || vizzionData.transaction_id || vizzionData.payment_id;
    if (gatewayId) {
      console.log('✅ Gateway ID: ENCONTRADO');
      console.log(`   ID: ${gatewayId}`);
    } else {
      console.log('❌ Gateway ID: NÃO ENCONTRADO');
    }
    
    console.log('='.repeat(50));
    
    // Teste de integração com o serviço real
    console.log('\n🧪 Testando integração com VizzionPayService...');
    try {
      const VizzionPayService = require('./src/services/vizzionPayService');
      const vizzionPay = new VizzionPayService();
      
      // Simular dados de usuário
      const mockUser = {
        id: 'test-user-123',
        nome: 'Teste Usuario',
        email: 'teste@teste.com',
        cpf: '12345678901'
      };
      
      console.log('📤 Criando pagamento via serviço...');
      const paymentResult = await vizzionPay.createPayment({
        userId: mockUser.id,
        valor: 20.00
      });
      
      console.log('✅ Resultado do serviço:');
      console.log('- QR Base64:', paymentResult.qr_base64 ? 'Presente' : 'Ausente');
      console.log('- QR Text:', paymentResult.qr_text ? 'Presente' : 'Ausente');
      console.log('- Gateway ID:', paymentResult.gateway_id || 'N/A');
      console.log('- Transaction ID:', paymentResult.transaction_id);
      console.log('- Amount:', paymentResult.amount);
      
    } catch (serviceError) {
      console.error('❌ Erro no teste do serviço:', serviceError.message);
    }
    
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

// Executar teste
testVizzionPayQRCode();
