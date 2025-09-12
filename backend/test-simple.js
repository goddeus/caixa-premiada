const axios = require('axios');

async function testSimple() {
  try {
    console.log('🧪 Teste simples...');
    
    const response = await axios.get('http://localhost:3001/health');
    console.log('✅ Servidor funcionando:', response.data);
    
    // Testar login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste-pix@test.com',
      senha: '123456'
    });
    console.log('✅ Login funcionando:', loginResponse.data.user.nome);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testSimple();