// TESTE DO ERRO DO USUÁRIO REAL
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testUserError() {
  console.log('🧪 TESTE DO ERRO DO USUÁRIO REAL');
  console.log('=================================');
  
  try {
    // 1. Buscar caixas
    console.log('\n📦 1. BUSCANDO CAIXAS...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    
    if (casesResponse.data.success && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      console.log(`✅ Caixa: ${firstCase.nome} (ID: ${firstCase.id})`);
      
      // 2. Testar endpoint de abertura com token real do usuário
      console.log('\n🎯 2. TESTANDO ENDPOINT DE ABERTURA...');
      
      // Simular token real do usuário (baseado no que vimos no console)
      const jwt = require('jsonwebtoken');
      const realToken = jwt.sign(
        { 
          userId: 'usuario-real-123',
          email: 'user@example.com',
          tipo_conta: 'normal'
        },
        'fake-secret',
        { expiresIn: '1h' }
      );
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': `Bearer ${realToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Status:', buyResponse.status);
        console.log('📊 Resposta:', buyResponse.data);
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('❌ ERRO 500 DETECTADO!');
          console.log('📊 Dados:', error.response.data);
          
          // Analisar o erro
          console.log('\n🔍 ANÁLISE DO ERRO:');
          console.log('   - Erro 500 com usuário autenticado');
          console.log('   - Problema no código do servidor');
          console.log('   - Provavelmente erro no centralizedDrawService');
          console.log('   - Ou erro no prizeValidationService');
          console.log('   - Ou erro no Prisma Client');
          
          console.log('\n🔧 POSSÍVEIS CAUSAS:');
          console.log('   1. Erro no centralizedDrawService.sortearPremio()');
          console.log('   2. Erro no prizeValidationService.validatePrizeBeforeCredit()');
          console.log('   3. Erro no walletService.hasEnoughBalance()');
          console.log('   4. Erro no Prisma Client (conexão com banco)');
          console.log('   5. Erro na transação do banco de dados');
          
        } else if (error.response?.status === 401) {
          console.log('✅ Status: 401 - Token inválido (esperado)');
        } else {
          console.log(`❌ Status inesperado: ${error.response?.status}`);
          console.log('📊 Dados:', error.response.data);
        }
      }
      
    } else {
      console.log('❌ Não foi possível obter caixas');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testUserError();
