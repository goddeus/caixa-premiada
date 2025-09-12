const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001';

async function testVizzionPayReal() {
  console.log('🧪 Testando VizzionPay com chaves REAIS...\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'teste-pix@test.com',
      senha: '123456'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login realizado:', loginResponse.data.user.nome);

    // 2. Testar depósito PIX com chaves reais
    console.log('\n2️⃣ Testando depósito PIX com chaves REAIS...');
    console.log('🔑 API Key configurada:', process.env.VIZZIONPAY_API_KEY ? 'SIM' : 'NÃO');
    console.log('🔑 Public Key configurada:', process.env.VIZZIONPAY_PUBLIC_KEY ? 'SIM' : 'NÃO');
    
    const pixDepositResponse = await axios.post(`${BASE_URL}/payments/deposit/pix`, {
      valor: 25.00
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('\n✅ Resposta do depósito PIX:');
    console.log('   - Payment ID:', pixDepositResponse.data.payment_id);
    console.log('   - Valor:', pixDepositResponse.data.valor);
    console.log('   - QR Code presente:', pixDepositResponse.data.qr_code ? 'SIM' : 'NÃO');
    console.log('   - PIX Copy Paste presente:', pixDepositResponse.data.pix_copy_paste ? 'SIM' : 'NÃO');
    console.log('   - Expira em:', pixDepositResponse.data.expires_at);
    
    if (pixDepositResponse.data.qr_code) {
      console.log('\n🎉 QR Code PIX gerado com sucesso usando chaves REAIS!');
      console.log('📱 QR Code (base64):', pixDepositResponse.data.qr_code.substring(0, 50) + '...');
      console.log('📋 PIX Copy Paste:', pixDepositResponse.data.pix_copy_paste);
      
      // Verificar se é um QR Code real ou de teste
      if (pixDepositResponse.data.qr_code.includes('teste@caixapremiada.com')) {
        console.log('⚠️  ATENÇÃO: Ainda está usando modo de TESTE');
      } else {
        console.log('✅ Usando QR Code REAL do VizzionPay!');
      }
    } else {
      console.log('\n❌ PROBLEMA: QR Code PIX não foi gerado!');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar teste
testVizzionPayReal();
