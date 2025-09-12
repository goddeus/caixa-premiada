const axios = require('axios');

async function testInitDatabase() {
  console.log('🧪 Testando inicialização do banco...');
  
  try {
    // 1. Testar health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get('https://slotbox-api.onrender.com/api/health');
    console.log('✅ Health check:', healthResponse.data.message);
    
    // 2. Testar conexão com banco
    console.log('2️⃣ Testando conexão com banco...');
    const dbResponse = await axios.get('https://slotbox-api.onrender.com/api/db-test');
    console.log('✅ Database test:', dbResponse.data.message);
    
    // 3. Inicializar banco
    console.log('3️⃣ Inicializando banco...');
    const initResponse = await axios.post('https://slotbox-api.onrender.com/api/init-db');
    console.log('✅ Init DB:', initResponse.data.message);
    
    if (initResponse.data.admin) {
      console.log('👤 Conta admin criada:');
      console.log(`   Email: ${initResponse.data.admin.email}`);
      console.log(`   Senha: ${initResponse.data.admin.senha}`);
    }
    
    // 4. Testar listagem de caixas
    console.log('4️⃣ Testando listagem de caixas...');
    const casesResponse = await axios.get('https://slotbox-api.onrender.com/api/cases');
    console.log(`✅ Caixas encontradas: ${casesResponse.data.cases?.length || 0}`);
    
    console.log('🎉 Todos os testes passaram! Sistema pronto!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

// Executar testes
testInitDatabase();
