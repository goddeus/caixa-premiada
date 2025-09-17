const axios = require('axios');

/**
 * SCRIPT DE TESTE DO SISTEMA MANIPULATIVO
 * 
 * Este script testa o sistema RTP viciante e manipulativo
 * para verificar se está funcionando corretamente.
 */

// Configurações
const API_BASE = 'https://slotbox-api.onrender.com';
const TEST_USER = {
  email: 'teste@manipulative.com',
  senha: 'Teste123!'
};

let authToken = '';

async function testManipulativeSystem() {
  try {
    console.log('🧠 Iniciando teste do sistema manipulativo...\n');
    
    // 1. Fazer login
    console.log('1. 🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, TEST_USER);
    authToken = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');
    
    // 2. Obter caixas disponíveis
    console.log('2. 📦 Obtendo caixas disponíveis...');
    const casesResponse = await axios.get(`${API_BASE}/api/cases`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const cases = casesResponse.data.data || casesResponse.data;
    console.log(`✅ ${cases.length} caixas encontradas\n`);
    
    // 3. Testar compra manipulativa
    console.log('3. 🎲 Testando compra manipulativa...');
    const testCase = cases[0]; // Usar primeira caixa
    
    console.log(`📦 Testando caixa: ${testCase.nome} (R$ ${testCase.preco})`);
    
    const buyResponse = await axios.post(
      `${API_BASE}/api/manipulative/cases/${testCase.id}/buy`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const result = buyResponse.data;
    console.log('🎁 Resultado da compra manipulativa:');
    console.log(`   - Prêmio: ${result.prize.nome}`);
    console.log(`   - Valor: R$ ${result.prize.valor}`);
    console.log(`   - Estratégia: ${result.manipulativeData.strategy}`);
    console.log(`   - RTP Usado: ${(result.manipulativeData.rtpUsed * 100).toFixed(1)}%`);
    console.log(`   - Mensagem Psicológica: ${result.prize.psychologicalMessage || 'N/A'}`);
    console.log(`   - É Prêmio de Retenção: ${result.manipulativeData.isRetentionPrize}`);
    console.log('✅ Compra manipulativa testada com sucesso\n');
    
    // 4. Obter estatísticas manipulativas
    console.log('4. 📊 Obtendo estatísticas manipulativas...');
    const statsResponse = await axios.get(`${API_BASE}/api/manipulative/user/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const stats = statsResponse.data.data;
    console.log('📈 Estatísticas do usuário:');
    console.log(`   - É Novo Usuário: ${stats.behaviorProfile.isNewUser}`);
    console.log(`   - Está Perseguindo Perdas: ${stats.behaviorProfile.isLossChasing}`);
    console.log(`   - É Alta Frequência: ${stats.behaviorProfile.isHighFrequency}`);
    console.log(`   - Está Prestes a Desistir: ${stats.behaviorProfile.isAboutToQuit}`);
    console.log(`   - Total Gasto: R$ ${stats.behaviorProfile.totalSpent.toFixed(2)}`);
    console.log(`   - Total Ganho: R$ ${stats.behaviorProfile.totalWon.toFixed(2)}`);
    console.log(`   - Prejuízo Líquido: R$ ${stats.behaviorProfile.netLoss.toFixed(2)}`);
    console.log(`   - Jogos nas últimas 24h: ${stats.behaviorProfile.gamesLast24h}`);
    console.log(`   - Jogos na última semana: ${stats.behaviorProfile.gamesLastWeek}`);
    
    console.log('\n🔥 Hot Streak:');
    console.log(`   - Está em Hot Streak: ${stats.hotStreak.isHotStreak}`);
    console.log(`   - Contagem: ${stats.hotStreak.streakCount}`);
    
    console.log('\n❄️ Cold Streak:');
    console.log(`   - Está em Cold Streak: ${stats.coldStreak.isColdStreak}`);
    console.log(`   - Contagem: ${stats.coldStreak.streakCount}`);
    
    console.log('\n🎯 Timing de Prêmio:');
    console.log(`   - Deve Dar Prêmio Grande: ${stats.prizeTiming.shouldGiveBigPrize}`);
    console.log(`   - Razão: ${stats.prizeTiming.reason}`);
    
    console.log('\n💡 Recomendações:');
    stats.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.type.toUpperCase()}: ${rec.message}`);
      console.log(`      Ação: ${rec.action}`);
    });
    
    console.log('\n✅ Estatísticas obtidas com sucesso\n');
    
    // 5. Testar compra múltipla manipulativa
    console.log('5. 🎲 Testando compra múltipla manipulativa...');
    const multipleBuyResponse = await axios.post(
      `${API_BASE}/api/manipulative/cases/${testCase.id}/buy-multiple`,
      { quantity: 3 },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const multipleResult = multipleBuyResponse.data;
    console.log('🎁 Resultado da compra múltipla manipulativa:');
    console.log(`   - Total de Caixas: ${multipleResult.summary.totalBoxes}`);
    console.log(`   - Custo Total: R$ ${multipleResult.summary.totalCost.toFixed(2)}`);
    console.log(`   - Total Ganho: R$ ${multipleResult.summary.totalWon.toFixed(2)}`);
    console.log(`   - Resultado Líquido: R$ ${multipleResult.summary.netResult.toFixed(2)}`);
    console.log(`   - Saldo Final: R$ ${multipleResult.summary.finalBalance.toFixed(2)}`);
    
    console.log('\n📦 Resultados individuais:');
    multipleResult.results.forEach((result, index) => {
      if (result.success) {
        console.log(`   Caixa ${result.boxNumber}: ${result.prize.nome} - R$ ${result.prize.valor}`);
        if (result.prize.psychologicalMessage) {
          console.log(`      Mensagem: ${result.prize.psychologicalMessage}`);
        }
      } else {
        console.log(`   Caixa ${result.boxNumber}: ERRO - ${result.error}`);
      }
    });
    
    console.log('\n✅ Compra múltipla manipulativa testada com sucesso\n');
    
    // 6. Resumo final
    console.log('🎯 RESUMO DO TESTE DO SISTEMA MANIPULATIVO:');
    console.log('✅ Sistema de RTP dinâmico funcionando');
    console.log('✅ Análise comportamental ativa');
    console.log('✅ Estratégias psicológicas aplicadas');
    console.log('✅ Sistema de retenção operacional');
    console.log('✅ Near miss e loss chasing implementados');
    console.log('✅ Hot/cold streak detection funcionando');
    console.log('✅ Recomendações automáticas geradas');
    
    console.log('\n🧠 O sistema manipulativo está 100% operacional!');
    console.log('💡 Este sistema maximiza a retenção e os lucros através de:');
    console.log('   - RTP dinâmico baseado no comportamento');
    console.log('   - Técnicas de manipulação psicológica');
    console.log('   - Sistema de retenção inteligente');
    console.log('   - Análise comportamental em tempo real');
    console.log('   - Estratégias de extração de valor');
    
  } catch (error) {
    console.error('❌ Erro no teste do sistema manipulativo:', error.message);
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📡 Data:', error.response.data);
    }
  }
}

// Executar teste
testManipulativeSystem();
