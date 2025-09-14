// DEBUG DO ENDPOINT DE ABERTURA DE CAIXAS
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function debugBuyEndpoint() {
  console.log('🔍 DEBUG DO ENDPOINT DE ABERTURA DE CAIXAS');
  console.log('==========================================');
  
  try {
    // 1. TESTAR ENDPOINT /api/cases (sem autenticação)
    console.log('\n📦 1. BUSCANDO CAIXAS DISPONÍVEIS');
    console.log('----------------------------------');
    
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    console.log('✅ Status:', casesResponse.status);
    
    if (casesResponse.data.success && casesResponse.data.data) {
      console.log(`📦 Total de caixas: ${casesResponse.data.data.length}`);
      
      // Mostrar primeira caixa
      const firstCase = casesResponse.data.data[0];
      console.log('\n📦 Primeira caixa:');
      console.log(`   ID: ${firstCase.id}`);
      console.log(`   Nome: ${firstCase.nome}`);
      console.log(`   Preço: R$ ${firstCase.preco}`);
      console.log(`   Ativa: ${firstCase.ativo ? '✅' : '❌'}`);
      console.log(`   Prêmios: ${firstCase.prizes?.length || 0}`);
      
      if (firstCase.prizes && firstCase.prizes.length > 0) {
        console.log('   📋 Prêmios:');
        firstCase.prizes.forEach((prize, index) => {
          console.log(`      ${index + 1}. ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
        });
      }
      
      // 2. TESTAR ENDPOINT /api/cases/buy/:id (sem autenticação - deve retornar 401)
      console.log('\n🎯 2. TESTANDO ENDPOINT /api/cases/buy/:id (sem auth)');
      console.log('----------------------------------------------------');
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`);
        console.log('❌ Endpoint deveria exigir autenticação!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Endpoint corretamente protegido (401 Unauthorized)');
        } else if (error.response?.status === 500) {
          console.log('❌ ERRO 500 DETECTADO!');
          console.log('📊 Status:', error.response.status);
          console.log('📊 Dados:', error.response.data);
          console.log('🔍 Isso indica um problema no servidor, não na autenticação');
        } else {
          console.log('❌ Erro inesperado:', error.response?.status, error.response?.data);
        }
      }
      
      // 3. TESTAR COM TOKEN INVÁLIDO
      console.log('\n🎯 3. TESTANDO COM TOKEN INVÁLIDO');
      console.log('---------------------------------');
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': 'Bearer token_invalido',
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Token inválido deveria retornar erro!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Token inválido corretamente rejeitado (401 Unauthorized)');
        } else if (error.response?.status === 500) {
          console.log('❌ ERRO 500 COM TOKEN INVÁLIDO!');
          console.log('📊 Status:', error.response.status);
          console.log('📊 Dados:', error.response.data);
          console.log('🔍 Isso indica que o erro 500 acontece ANTES da validação do token');
        } else {
          console.log('❌ Erro inesperado:', error.response?.status, error.response?.data);
        }
      }
      
      // 4. TESTAR COM TOKEN VÁLIDO MAS USUÁRIO INEXISTENTE
      console.log('\n🎯 4. TESTANDO COM TOKEN VÁLIDO MAS USUÁRIO INEXISTENTE');
      console.log('------------------------------------------------------');
      
      // Criar um token JWT válido mas com usuário inexistente
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        { 
          id: 'usuario-inexistente-123',
          email: 'fake@example.com',
          tipo_conta: 'normal'
        },
        'fake-secret',
        { expiresIn: '1h' }
      );
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`, {}, {
          headers: {
            'Authorization': `Bearer ${fakeToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Usuário inexistente deveria retornar erro!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Usuário inexistente corretamente rejeitado (401 Unauthorized)');
        } else if (error.response?.status === 500) {
          console.log('❌ ERRO 500 COM USUÁRIO INEXISTENTE!');
          console.log('📊 Status:', error.response.status);
          console.log('📊 Dados:', error.response.data);
          console.log('🔍 Isso indica que o erro 500 acontece durante a validação do usuário');
        } else {
          console.log('❌ Erro inesperado:', error.response?.status, error.response?.data);
        }
      }
      
    } else {
      console.log('❌ Não foi possível obter caixas para teste');
    }
    
    // 5. RESUMO DO DEBUG
    console.log('\n📊 RESUMO DO DEBUG');
    console.log('==================');
    console.log('🔍 Se todos os testes retornaram 500, o problema está no servidor');
    console.log('🔍 Se apenas alguns retornaram 500, o problema está na lógica específica');
    console.log('🔍 Se nenhum retornou 500, o problema está na autenticação do usuário real');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Dados:', error.response.data);
    }
  }
}

// Executar debug
debugBuyEndpoint();
