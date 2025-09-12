const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Testando API diretamente...');
    
    // Testar se o servidor está rodando
    const response = await axios.get('http://localhost:3001/api/cases', {
      timeout: 5000
    });
    
    console.log('✅ API funcionando!');
    console.log('📦 Total de caixas:', response.data.length);
    
    // Procurar pela caixa Weekend
    const weekendCase = response.data.find(caixa => 
      caixa.nome && caixa.nome.toLowerCase().includes('weekend')
    );
    
    if (weekendCase) {
      console.log('🎁 Caixa Weekend encontrada:');
      console.log(`- Nome: ${weekendCase.nome}`);
      console.log(`- Preço: R$ ${weekendCase.preco}`);
      console.log(`- Prêmios: ${weekendCase.prizes ? weekendCase.prizes.length : 0}`);
      console.log(`- Ativa: ${weekendCase.ativo}`);
    } else {
      console.log('❌ Caixa Weekend não encontrada');
      console.log('📦 Caixas disponíveis:');
      response.data.forEach(caixa => {
        console.log(`- ${caixa.nome}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 O servidor não está rodando na porta 3001');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Timeout - servidor pode estar lento');
    } else if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testAPI();
