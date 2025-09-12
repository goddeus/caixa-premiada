const axios = require('axios');

async function testCreateUserAndDeposit() {
  try {
    console.log('🧪 Testando criação de usuário e depósito PIX...');
    
    // Primeiro, registrar um usuário
    console.log('1️⃣ Registrando usuário...');
    const registerResponse = await axios.post('http://localhost:3001/auth/register', {
      nome: 'Teste Usuario',
      email: 'teste@teste.com',
      senha: '123456',
      confirmar_senha: '123456',
      cpf: '11144477735'
    });
    
    console.log('✅ Usuário registrado:', registerResponse.data);
    
    // Fazer login
    console.log('2️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Testar o depósito com o token
    console.log('3️⃣ Testando depósito PIX...');
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

testCreateUserAndDeposit();
