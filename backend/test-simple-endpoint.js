const axios = require('axios');

async function testSimpleEndpoint() {
  try {
    console.log('🧪 Testando endpoint simples...');
    
    // Testar endpoint de health check se existir
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check falhou:', error.message);
    }
    
    // Testar endpoint de login
    console.log('1️⃣ Testando login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });
    
    console.log('✅ Login funcionando');
    
    // Testar endpoint que não existe
    console.log('2️⃣ Testando endpoint inexistente...');
    try {
      await axios.get('http://localhost:3001/teste');
    } catch (error) {
      console.log('✅ Endpoint inexistente retorna erro como esperado:', error.response?.status);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testSimpleEndpoint();

