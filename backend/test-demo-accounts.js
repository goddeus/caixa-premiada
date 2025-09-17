const axios = require('axios');

/**
 * SCRIPT DE TESTE PARA CONTAS DEMO
 * 
 * Este script testa se as contas demo estão recebendo
 * RTP mais alto e prêmios maiores para afiliados.
 */

// Configurações
const API_BASE = 'https://slotbox-api.onrender.com';

async function testDemoAccounts() {
  try {
    console.log('🎯 Testando Contas Demo com RTP Alto...\n');
    
    // 1. Verificar se API está funcionando
    console.log('1. 🔍 Verificando API...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ API funcionando:', healthResponse.data.message);
    
    // 2. Criar conta demo de teste
    console.log('\n2. 👤 Criando conta demo de teste...');
    let demoAuthToken = '';
    let demoUser = null;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
        nome: 'Afiliado Demo Teste',
        email: `demo.test.${Date.now()}@teste.com`,
        senha: 'Demo123!',
        confirmarSenha: 'Demo123!',
        cpf: `demo${Date.now()}`
      });
      
      demoAuthToken = registerResponse.data.token;
      demoUser = registerResponse.data.user;
      console.log('✅ Conta demo criada:', demoUser.nome);
      console.log(`   - Tipo: ${demoUser.tipo_conta}`);
      console.log(`   - Saldo Demo: R$ ${demoUser.saldo_demo || 0}`);
    } catch (error) {
      console.log('⚠️ Erro ao criar conta demo:', error.response?.data?.message);
      return;
    }
    
    // 3. Criar conta normal para comparação
    console.log('\n3. 👤 Criando conta normal para comparação...');
    let normalAuthToken = '';
    let normalUser = null;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
        nome: 'Usuário Normal Teste',
        email: `normal.test.${Date.now()}@teste.com`,
        senha: 'Normal123!',
        confirmarSenha: 'Normal123!',
        cpf: `normal${Date.now()}`
      });
      
      normalAuthToken = registerResponse.data.token;
      normalUser = registerResponse.data.user;
      console.log('✅ Conta normal criada:', normalUser.nome);
      console.log(`   - Tipo: ${normalUser.tipo_conta}`);
      console.log(`   - Saldo: R$ ${normalUser.saldo_reais || 0}`);
    } catch (error) {
      console.log('⚠️ Erro ao criar conta normal:', error.response?.data?.message);
      return;
    }
    
    // 4. Obter caixas disponíveis
    console.log('\n4. 📦 Obtendo caixas disponíveis...');
    const casesResponse = await axios.get(`${API_BASE}/api/cases`, {
      headers: { Authorization: `Bearer ${demoAuthToken}` }
    });
    const cases = casesResponse.data.data || casesResponse.data;
    console.log(`✅ ${cases.length} caixas encontradas`);
    
    if (cases.length === 0) {
      console.log('❌ Nenhuma caixa disponível para teste');
      return;
    }
    
    const testCase = cases[0];
    console.log(`📦 Testando caixa: ${testCase.nome} (R$ ${testCase.preco})`);
    
    // 5. Testar conta demo (deve ter RTP alto)
    console.log('\n5. 🎯 Testando CONTA DEMO (deve ter RTP alto)...');
    const demoResults = [];
    
    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`   Teste ${i}/5...`);
        
        const buyResponse = await axios.post(
          `${API_BASE}/api/cases/${testCase.id}/buy`,
          {},
          {
            headers: { Authorization: `Bearer ${demoAuthToken}` }
          }
        );
        
        const result = buyResponse.data;
        demoResults.push({
          prize: result.prize.nome,
          value: result.prize.valor,
          rtp: result.manipulativeData?.rtpUsed || 0,
          strategy: result.manipulativeData?.strategy || 'unknown',
          isDemo: result.manipulativeData?.isDemoAccount || false
        });
        
        console.log(`     Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
        console.log(`     RTP: ${((result.manipulativeData?.rtpUsed || 0) * 100).toFixed(1)}%`);
        console.log(`     Estratégia: ${result.manipulativeData?.strategy || 'unknown'}`);
        
      } catch (error) {
        console.log(`     ❌ Erro no teste ${i}:`, error.response?.data?.message);
      }
    }
    
    // 6. Testar conta normal (deve ter RTP baixo)
    console.log('\n6. 🎯 Testando CONTA NORMAL (deve ter RTP baixo)...');
    const normalResults = [];
    
    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`   Teste ${i}/5...`);
        
        const buyResponse = await axios.post(
          `${API_BASE}/api/cases/${testCase.id}/buy`,
          {},
          {
            headers: { Authorization: `Bearer ${normalAuthToken}` }
          }
        );
        
        const result = buyResponse.data;
        normalResults.push({
          prize: result.prize.nome,
          value: result.prize.valor,
          rtp: result.manipulativeData?.rtpUsed || 0,
          strategy: result.manipulativeData?.strategy || 'unknown',
          isDemo: result.manipulativeData?.isDemoAccount || false
        });
        
        console.log(`     Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
        console.log(`     RTP: ${((result.manipulativeData?.rtpUsed || 0) * 100).toFixed(1)}%`);
        console.log(`     Estratégia: ${result.manipulativeData?.strategy || 'unknown'}`);
        
      } catch (error) {
        console.log(`     ❌ Erro no teste ${i}:`, error.response?.data?.message);
      }
    }
    
    // 7. Análise dos resultados
    console.log('\n7. 📊 ANÁLISE DOS RESULTADOS:');
    
    // Análise conta demo
    const demoWins = demoResults.filter(r => r.value > 0).length;
    const demoTotalWon = demoResults.reduce((sum, r) => sum + r.value, 0);
    const demoAvgRTP = demoResults.reduce((sum, r) => sum + r.rtp, 0) / demoResults.length;
    
    console.log('\n🎯 CONTA DEMO:');
    console.log(`   - Vitórias: ${demoWins}/${demoResults.length} (${(demoWins/demoResults.length*100).toFixed(1)}%)`);
    console.log(`   - Total ganho: R$ ${demoTotalWon.toFixed(2)}`);
    console.log(`   - RTP médio: ${(demoAvgRTP * 100).toFixed(1)}%`);
    console.log(`   - Estratégias: ${demoResults.map(r => r.strategy).join(', ')}`);
    
    // Análise conta normal
    const normalWins = normalResults.filter(r => r.value > 0).length;
    const normalTotalWon = normalResults.reduce((sum, r) => sum + r.value, 0);
    const normalAvgRTP = normalResults.reduce((sum, r) => sum + r.rtp, 0) / normalResults.length;
    
    console.log('\n👤 CONTA NORMAL:');
    console.log(`   - Vitórias: ${normalWins}/${normalResults.length} (${(normalWins/normalResults.length*100).toFixed(1)}%)`);
    console.log(`   - Total ganho: R$ ${normalTotalWon.toFixed(2)}`);
    console.log(`   - RTP médio: ${(normalAvgRTP * 100).toFixed(1)}%`);
    console.log(`   - Estratégias: ${normalResults.map(r => r.strategy).join(', ')}`);
    
    // Comparação
    console.log('\n🔍 COMPARAÇÃO:');
    const rtpDifference = demoAvgRTP - normalAvgRTP;
    const winRateDifference = (demoWins/demoResults.length) - (normalWins/normalResults.length);
    
    console.log(`   - Diferença de RTP: ${(rtpDifference * 100).toFixed(1)}%`);
    console.log(`   - Diferença de taxa de vitória: ${(winRateDifference * 100).toFixed(1)}%`);
    console.log(`   - Diferença de ganhos: R$ ${(demoTotalWon - normalTotalWon).toFixed(2)}`);
    
    // Verificação se está funcionando
    console.log('\n✅ VERIFICAÇÃO:');
    if (demoAvgRTP > normalAvgRTP) {
      console.log('   ✅ Contas demo têm RTP mais alto que contas normais');
    } else {
      console.log('   ❌ Contas demo NÃO têm RTP mais alto que contas normais');
    }
    
    if (demoWins > normalWins) {
      console.log('   ✅ Contas demo ganham mais que contas normais');
    } else {
      console.log('   ❌ Contas demo NÃO ganham mais que contas normais');
    }
    
    if (demoTotalWon > normalTotalWon) {
      console.log('   ✅ Contas demo ganham valores maiores que contas normais');
    } else {
      console.log('   ❌ Contas demo NÃO ganham valores maiores que contas normais');
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('💡 As contas demo devem ter RTP mais alto para incentivar afiliados.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📡 Data:', error.response.data);
    }
  }
}

// Executar teste
testDemoAccounts();
