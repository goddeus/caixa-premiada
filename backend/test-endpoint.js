const axios = require('axios');

async function testDeposit() {
  try {
    console.log('🧪 Testando endpoint de depósito...');
    
    const response = await axios.post('http://localhost:3001/payments/deposit/pix', {
      valor: 50
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      }
    });
    
    console.log('✅ Resposta recebida:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testDeposit();

