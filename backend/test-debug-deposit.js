const axios = require('axios');

async function testDebugDeposit() {
  try {
    console.log('🧪 Testando depósito PIX com debug...');
    
    // Fazer login primeiro
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    // Testar o depósito com o token
    console.log('2️⃣ Testando depósito PIX...');
    console.log('📤 Enviando requisição para:', 'http://localhost:3001/payments/deposit/pix');
    console.log('📤 Headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });
    console.log('📤 Body:', { valor: 25.00 });
    
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
    if (error.response?.status) {
      console.log('Status HTTP:', error.response.status);
    }
  }
}

testDebugDeposit();

