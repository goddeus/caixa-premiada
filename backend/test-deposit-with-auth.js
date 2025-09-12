const axios = require('axios');

async function testDepositWithAuth() {
  try {
    console.log('🧪 Testando endpoint de depósito PIX com autenticação...');
    
    // Primeiro, fazer login para obter o token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Agora testar o depósito com o token
    console.log('2️⃣ Testando depósito PIX...');
    const depositResponse = await axios.post('http://localhost:3001/payments/deposit/pix', {
      valor: 25.00
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Depósito PIX criado com sucesso:', depositResponse.data);
  } catch (error) {
    console.log('❌ Erro:', error.response?.data || error.message);
  }
}

testDepositWithAuth();

