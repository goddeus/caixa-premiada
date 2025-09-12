const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testeApiDireto() {
  try {
    console.log('🧪 TESTE DIRETO DA API - VERIFICANDO RESPOSTA');
    console.log('==================================================');

    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'junior@admin.com',
      password: '123456'
    });
    
    const authToken = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    const saldoAntes = loginResponse.data.user.saldo;
    
    console.log(`✅ Login realizado`);
    console.log(`👤 Usuário: ${loginResponse.data.user.nome}`);
    console.log(`💰 Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
    console.log(`🔑 Token: ${authToken.substring(0, 50)}...`);
    console.log('');

    // 2. Buscar caixas
    console.log('2. Buscando caixas...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const caseData = casesResponse.data.cases.find(c => c.nome === 'CAIXA FINAL DE SEMANA');
    if (!caseData) {
      console.error(`❌ Caixa "CAIXA FINAL DE SEMANA" não encontrada`);
      return;
    }
    
    console.log(`✅ Caixa encontrada: ${caseData.nome}`);
    console.log(`💰 Preço: R$ ${caseData.preco.toFixed(2)}`);
    console.log('');

    // 3. Comprar caixa
    console.log('3. Comprando caixa...');
    console.log(`🔗 URL: ${API_BASE_URL}/cases/buy/${caseData.id}`);
    console.log(`🔑 Headers: Authorization: Bearer ${authToken.substring(0, 20)}...`);
    console.log('');

    const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${caseData.id}`, {}, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Compra realizada!');
    console.log('📦 RESPOSTA COMPLETA DA API:');
    console.log('============================');
    console.log(JSON.stringify(buyResponse.data, null, 2));
    console.log('');

    // 4. Análise da resposta
    console.log('🔍 ANÁLISE DA RESPOSTA:');
    console.log('-----------------------');
    console.log(`   Success: ${buyResponse.data.success || 'N/A'}`);
    console.log(`   Is Demo: ${buyResponse.data.is_demo}`);
    console.log(`   User Balance: R$ ${buyResponse.data.userBalance || 'N/A'}`);
    console.log(`   Prize: ${buyResponse.data.wonPrize?.nome || 'N/A'}`);
    console.log(`   Prize Value: R$ ${buyResponse.data.wonPrize?.valor || 'N/A'}`);
    console.log(`   Message: ${buyResponse.data.message || 'N/A'}`);
    console.log('');

    if (buyResponse.data.is_demo === true) {
      console.log('❌ PROBLEMA: API está retornando is_demo: true!');
      console.log('💡 Isso explica por que o frontend não está debitando');
    } else {
      console.log('✅ API está retornando is_demo: false corretamente');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Erro 401: Token inválido ou expirado');
    } else if (error.response?.status === 404) {
      console.log('💡 Erro 404: Endpoint não encontrado');
    } else if (error.response?.status === 500) {
      console.log('💡 Erro 500: Erro interno do servidor');
    }
  }
}

testeApiDireto();
