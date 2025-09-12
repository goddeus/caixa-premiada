const axios = require('axios');

async function testSimpleDeposit() {
  try {
    console.log('🧪 Testando depósito PIX simples...');
    
    // Fazer login primeiro
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Testar o depósito com o token
    console.log('2️⃣ Testando depósito PIX...');
    const depositResponse = await axios.post('http://localhost:3001/payments/deposit/pix', {
      valor: 25.00
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Depósito PIX criado com sucesso:', depositResponse.data);
  } catch (error) {
    console.log('❌ Erro:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.log('Detalhes do erro:', error.response.data.error);
    }
  }
}

testSimpleDeposit();

