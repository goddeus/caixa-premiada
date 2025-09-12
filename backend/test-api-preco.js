const axios = require('axios');

async function testarAPI() {
  try {
    console.log('🧪 TESTANDO API DE COMPRA DE CAIXAS');
    console.log('==================================================');

    const baseURL = 'http://localhost:3001';
    
    // 1. Buscar caixas disponíveis
    console.log('1. Buscando caixas disponíveis...');
    const response = await axios.get(`${baseURL}/cases`);
    const caixas = response.data.cases;
    
    console.log(`✅ Encontradas ${caixas.length} caixas:`);
    caixas.forEach(caixa => {
      console.log(`   - ${caixa.nome}: R$ ${parseFloat(caixa.preco).toFixed(2)}`);
    });

    // 2. Testar compra da CAIXA FINAL DE SEMANA
    const weekendCase = caixas.find(c => c.nome === 'CAIXA FINAL DE SEMANA');
    if (weekendCase) {
      console.log(`\n2. Testando compra da ${weekendCase.nome}...`);
      console.log(`   Preço esperado: R$ ${parseFloat(weekendCase.preco).toFixed(2)}`);
      
      try {
        // Simular compra (vai falhar por falta de autenticação, mas vamos ver o preço)
        const buyResponse = await axios.post(`${baseURL}/cases/buy/${weekendCase.id}`, {}, {
          headers: {
            'Authorization': 'Bearer fake-token'
          }
        });
        console.log('✅ Compra realizada com sucesso');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('❌ Erro de autenticação (esperado)');
        } else {
          console.log(`❌ Erro inesperado: ${error.response?.data?.error || error.message}`);
        }
      }
    }

    // 3. Verificar se há alguma lógica de desconto no código
    console.log('\n3. Verificando se há lógica de desconto...');
    console.log('   - Preço da caixa no banco:', weekendCase?.preco);
    console.log('   - Preço esperado para débito:', weekendCase ? parseFloat(weekendCase.preco) : 'N/A');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarAPI();
