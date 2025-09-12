const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function testPixQRCode() {
  console.log('🧪 Testando geração de QR Code PIX...\n');

  try {
    // 1. Fazer login com usuário existente
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'lucas.almeida@test.com',
      senha: '123456'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login realizado:', loginResponse.data.user.nome);

    // 2. Testar depósito PIX
    console.log('\n2️⃣ Testando depósito PIX...');
    const pixDepositResponse = await axios.post(`${BASE_URL}/api/payments/deposit/pix`, {
      valor: 50.00
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Resposta do depósito PIX:');
    console.log('   - Payment ID:', pixDepositResponse.data.payment_id);
    console.log('   - Valor:', pixDepositResponse.data.valor);
    console.log('   - QR Code presente:', pixDepositResponse.data.qr_code ? 'SIM' : 'NÃO');
    console.log('   - PIX Copy Paste presente:', pixDepositResponse.data.pix_copy_paste ? 'SIM' : 'NÃO');
    console.log('   - Expira em:', pixDepositResponse.data.expires_at);
    
    if (pixDepositResponse.data.qr_code) {
      console.log('\n🎉 QR Code PIX gerado com sucesso!');
      console.log('📱 QR Code (base64):', pixDepositResponse.data.qr_code.substring(0, 50) + '...');
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
testPixQRCode();
