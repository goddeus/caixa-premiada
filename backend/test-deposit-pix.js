const axios = require('axios');

async function testDepositPix() {
  try {
    console.log('🧪 Testando endpoint de depósito PIX...');
    
    const response = await axios.post('http://localhost:3001/payments/deposit/pix', {
      valor: 25.00
    });
    
    console.log('✅ Sucesso:', response.data);
  } catch (error) {
    console.log('❌ Erro:', error.response?.data || error.message);
  }
}

testDepositPix();

