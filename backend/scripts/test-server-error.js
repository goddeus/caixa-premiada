// TESTE DO ERRO DO SERVIDOR
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testServerError() {
  console.log('🧪 TESTE DO ERRO DO SERVIDOR');
  console.log('============================');
  
  try {
    // 1. Testar endpoint que funciona (sem banco)
    console.log('\n📦 1. TESTANDO ENDPOINT QUE FUNCIONA...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    console.log('✅ Status:', casesResponse.status);
    console.log('📊 Funciona porque não precisa do banco');
    
    // 2. Testar endpoint que falha (precisa do banco)
    console.log('\n🎯 2. TESTANDO ENDPOINT QUE FALHA...');
    
    if (casesResponse.data.success && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Deveria ter falhado');
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('❌ ERRO 500 - Problema no servidor');
          console.log('📊 Dados:', error.response.data);
          
          // Analisar o erro
          if (error.response.data.error === 'Erro interno do servidor') {
            console.log('\n🔍 ANÁLISE DO ERRO:');
            console.log('   - Erro genérico indica problema no código');
            console.log('   - Provavelmente erro de conexão com banco de dados');
            console.log('   - O endpoint /api/cases funciona porque não precisa do banco');
            console.log('   - O endpoint /api/cases/buy/:id falha porque precisa do banco');
            
            console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
            console.log('   1. Verificar configuração do banco de dados');
            console.log('   2. Verificar se o banco está acessível');
            console.log('   3. Verificar se as variáveis de ambiente estão corretas');
            console.log('   4. Verificar se o Prisma Client está configurado corretamente');
          }
        } else {
          console.log(`❌ Status inesperado: ${error.response?.status}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testServerError();
