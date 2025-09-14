// TESTE DO ERRO REAL DO SERVIDOR
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testRealError() {
  console.log('🧪 TESTE DO ERRO REAL DO SERVIDOR');
  console.log('=================================');
  
  try {
    // 1. Testar endpoint que funciona
    console.log('\n📦 1. TESTANDO ENDPOINT QUE FUNCIONA...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    console.log('✅ Status:', casesResponse.status);
    
    if (casesResponse.data.success && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      console.log(`📦 Caixa: ${firstCase.nome} (ID: ${firstCase.id})`);
      
      // 2. Testar endpoint que falha com diferentes tipos de token
      console.log('\n🎯 2. TESTANDO ENDPOINT QUE FALHA...');
      
      // Teste 1: Sem token
      console.log('\n🔍 Teste 1: Sem token');
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`);
        console.log('❌ Deveria ter falhado');
      } catch (error) {
        console.log(`✅ Status: ${error.response?.status} - ${error.response?.data?.message || error.response?.data?.error || 'Erro'}`);
      }
      
      // Teste 2: Token inválido
      console.log('\n🔍 Teste 2: Token inválido');
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': 'Bearer token_invalido_123',
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Deveria ter falhado');
      } catch (error) {
        console.log(`✅ Status: ${error.response?.status} - ${error.response?.data?.message || error.response?.data?.error || 'Erro'}`);
      }
      
      // Teste 3: Token válido mas usuário inexistente
      console.log('\n🔍 Teste 3: Token válido mas usuário inexistente');
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        { 
          userId: 'usuario-inexistente-123',
          email: 'fake@example.com'
        },
        'fake-secret',
        { expiresIn: '1h' }
      );
      
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': `Bearer ${fakeToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Deveria ter falhado');
      } catch (error) {
        console.log(`✅ Status: ${error.response?.status} - ${error.response?.data?.message || error.response?.data?.error || 'Erro'}`);
      }
      
      // Teste 4: Token válido com usuário existente mas sem saldo
      console.log('\n🔍 Teste 4: Token válido com usuário existente mas sem saldo');
      const userToken = jwt.sign(
        { 
          userId: 'usuario-sem-saldo-123',
          email: 'user@example.com'
        },
        'fake-secret',
        { expiresIn: '1h' }
      );
      
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Deveria ter falhado');
      } catch (error) {
        console.log(`✅ Status: ${error.response?.status} - ${error.response?.data?.message || error.response?.data?.error || 'Erro'}`);
      }
      
      // 3. Análise dos resultados
      console.log('\n📊 ANÁLISE DOS RESULTADOS:');
      console.log('==========================');
      console.log('🔍 Se todos os testes retornaram 401:');
      console.log('   - O problema está na autenticação');
      console.log('   - O servidor está funcionando corretamente');
      console.log('   - O erro 500 só acontece com usuários autenticados');
      
      console.log('\n🔍 Se algum teste retornou 500:');
      console.log('   - O problema está no código do servidor');
      console.log('   - Provavelmente erro no centralizedDrawService');
      console.log('   - Ou erro no prizeValidationService');
      
    } else {
      console.log('❌ Não foi possível obter caixas');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testRealError();
