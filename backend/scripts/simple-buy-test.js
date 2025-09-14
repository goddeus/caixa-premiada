// TESTE SIMPLES DO ENDPOINT DE ABERTURA
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function simpleBuyTest() {
  console.log('🧪 TESTE SIMPLES DO ENDPOINT DE ABERTURA');
  console.log('========================================');
  
  try {
    // 1. Buscar caixas
    console.log('\n📦 1. BUSCANDO CAIXAS...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    
    if (casesResponse.data.success && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      console.log(`✅ Caixa encontrada: ${firstCase.nome} (ID: ${firstCase.id})`);
      
      // 2. Testar endpoint de abertura sem autenticação
      console.log('\n🎯 2. TESTANDO SEM AUTENTICAÇÃO...');
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`);
        console.log('❌ Deveria ter retornado erro 401');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Retornou 401 (sem autenticação) - OK');
        } else if (error.response?.status === 500) {
          console.log('❌ Retornou 500 (erro interno) - PROBLEMA!');
          console.log('📊 Dados do erro:', error.response.data);
        } else {
          console.log(`❌ Retornou ${error.response?.status} - inesperado`);
        }
      }
      
      // 3. Testar com token inválido
      console.log('\n🎯 3. TESTANDO COM TOKEN INVÁLIDO...');
      try {
        await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': 'Bearer token_invalido_123',
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Deveria ter retornado erro 401');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Retornou 401 (token inválido) - OK');
        } else if (error.response?.status === 500) {
          console.log('❌ Retornou 500 (erro interno) - PROBLEMA!');
          console.log('📊 Dados do erro:', error.response.data);
        } else {
          console.log(`❌ Retornou ${error.response?.status} - inesperado`);
        }
      }
      
      // 4. Testar com token válido mas usuário inexistente
      console.log('\n🎯 4. TESTANDO COM USUÁRIO INEXISTENTE...');
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
        console.log('❌ Deveria ter retornado erro 401');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Retornou 401 (usuário inexistente) - OK');
        } else if (error.response?.status === 500) {
          console.log('❌ Retornou 500 (erro interno) - PROBLEMA!');
          console.log('📊 Dados do erro:', error.response.data);
        } else {
          console.log(`❌ Retornou ${error.response?.status} - inesperado`);
        }
      }
      
    } else {
      console.log('❌ Não foi possível obter caixas');
    }
    
    // 5. Resumo
    console.log('\n📊 RESUMO:');
    console.log('==========');
    console.log('🔍 Se todos os testes retornaram 500, o problema está no servidor');
    console.log('🔍 Se apenas alguns retornaram 500, o problema está na lógica específica');
    console.log('🔍 Se nenhum retornou 500, o problema está na autenticação do usuário real');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Dados:', error.response.data);
    }
  }
}

// Executar teste
simpleBuyTest();
