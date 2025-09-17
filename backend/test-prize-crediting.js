const axios = require('axios');

/**
 * SCRIPT DE TESTE PARA CREDITAÇÃO DE PRÊMIOS
 * 
 * Este script testa se os prêmios estão sendo creditados corretamente
 * tanto para contas demo quanto para contas normais.
 */

// Configurações
const API_BASE = 'https://slotbox-api.onrender.com';

async function testPrizeCrediting() {
  try {
    console.log('🎯 Testando Creditação de Prêmios...\n');
    
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
        nome: 'Teste Creditação Demo',
        email: `crediting.demo.${Date.now()}@teste.com`,
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
        nome: 'Teste Creditação Normal',
        email: `crediting.normal.${Date.now()}@teste.com`,
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
    
    // 5. Testar creditação em conta demo
    console.log('\n5. 🎯 Testando CREDITAÇÃO em CONTA DEMO...');
    const demoResults = [];
    
    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`   Teste ${i}/3...`);
        
        // Obter saldo antes
        const balanceBeforeResponse = await axios.get(`${API_BASE}/api/user/balance`, {
          headers: { Authorization: `Bearer ${demoAuthToken}` }
        });
        const balanceBefore = balanceBeforeResponse.data.saldo_demo || 0;
        
        // Comprar caixa
        const buyResponse = await axios.post(
          `${API_BASE}/api/cases/${testCase.id}/buy`,
          {},
          {
            headers: { Authorization: `Bearer ${demoAuthToken}` }
          }
        );
        
        const result = buyResponse.data;
        
        // Obter saldo depois
        const balanceAfterResponse = await axios.get(`${API_BASE}/api/user/balance`, {
          headers: { Authorization: `Bearer ${demoAuthToken}` }
        });
        const balanceAfter = balanceAfterResponse.data.saldo_demo || 0;
        
        // Calcular diferença real
        const actualDifference = balanceAfter - balanceBefore;
        const expectedDifference = result.prize.valor - testCase.preco;
        
        demoResults.push({
          prize: result.prize.nome,
          prizeValue: result.prize.valor,
          casePrice: testCase.preco,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          expectedDifference: expectedDifference,
          actualDifference: actualDifference,
          isCorrect: Math.abs(actualDifference - expectedDifference) < 0.01
        });
        
        console.log(`     Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
        console.log(`     Saldo antes: R$ ${balanceBefore.toFixed(2)}`);
        console.log(`     Saldo depois: R$ ${balanceAfter.toFixed(2)}`);
        console.log(`     Diferença esperada: R$ ${expectedDifference.toFixed(2)}`);
        console.log(`     Diferença real: R$ ${actualDifference.toFixed(2)}`);
        console.log(`     ✅ Creditação correta: ${Math.abs(actualDifference - expectedDifference) < 0.01 ? 'SIM' : 'NÃO'}`);
        
      } catch (error) {
        console.log(`     ❌ Erro no teste ${i}:`, error.response?.data?.message);
      }
    }
    
    // 6. Testar creditação em conta normal
    console.log('\n6. 🎯 Testando CREDITAÇÃO em CONTA NORMAL...');
    const normalResults = [];
    
    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`   Teste ${i}/3...`);
        
        // Obter saldo antes
        const balanceBeforeResponse = await axios.get(`${API_BASE}/api/user/balance`, {
          headers: { Authorization: `Bearer ${normalAuthToken}` }
        });
        const balanceBefore = balanceBeforeResponse.data.saldo_reais || 0;
        
        // Comprar caixa
        const buyResponse = await axios.post(
          `${API_BASE}/api/cases/${testCase.id}/buy`,
          {},
          {
            headers: { Authorization: `Bearer ${normalAuthToken}` }
          }
        );
        
        const result = buyResponse.data;
        
        // Obter saldo depois
        const balanceAfterResponse = await axios.get(`${API_BASE}/api/user/balance`, {
          headers: { Authorization: `Bearer ${normalAuthToken}` }
        });
        const balanceAfter = balanceAfterResponse.data.saldo_reais || 0;
        
        // Calcular diferença real
        const actualDifference = balanceAfter - balanceBefore;
        const expectedDifference = result.prize.valor - testCase.preco;
        
        normalResults.push({
          prize: result.prize.nome,
          prizeValue: result.prize.valor,
          casePrice: testCase.preco,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          expectedDifference: expectedDifference,
          actualDifference: actualDifference,
          isCorrect: Math.abs(actualDifference - expectedDifference) < 0.01
        });
        
        console.log(`     Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
        console.log(`     Saldo antes: R$ ${balanceBefore.toFixed(2)}`);
        console.log(`     Saldo depois: R$ ${balanceAfter.toFixed(2)}`);
        console.log(`     Diferença esperada: R$ ${expectedDifference.toFixed(2)}`);
        console.log(`     Diferença real: R$ ${actualDifference.toFixed(2)}`);
        console.log(`     ✅ Creditação correta: ${Math.abs(actualDifference - expectedDifference) < 0.01 ? 'SIM' : 'NÃO'}`);
        
      } catch (error) {
        console.log(`     ❌ Erro no teste ${i}:`, error.response?.data?.message);
      }
    }
    
    // 7. Análise dos resultados
    console.log('\n7. 📊 ANÁLISE DA CREDITAÇÃO:');
    
    // Análise conta demo
    const demoCorrectCredits = demoResults.filter(r => r.isCorrect).length;
    const demoTotalPrizes = demoResults.reduce((sum, r) => sum + r.prizeValue, 0);
    const demoTotalSpent = demoResults.length * testCase.preco;
    
    console.log('\n🎯 CONTA DEMO:');
    console.log(`   - Creditações corretas: ${demoCorrectCredits}/${demoResults.length} (${(demoCorrectCredits/demoResults.length*100).toFixed(1)}%)`);
    console.log(`   - Total gasto: R$ ${demoTotalSpent.toFixed(2)}`);
    console.log(`   - Total ganho: R$ ${demoTotalPrizes.toFixed(2)}`);
    console.log(`   - Saldo líquido: R$ ${(demoTotalPrizes - demoTotalSpent).toFixed(2)}`);
    
    // Análise conta normal
    const normalCorrectCredits = normalResults.filter(r => r.isCorrect).length;
    const normalTotalPrizes = normalResults.reduce((sum, r) => sum + r.prizeValue, 0);
    const normalTotalSpent = normalResults.length * testCase.preco;
    
    console.log('\n👤 CONTA NORMAL:');
    console.log(`   - Creditações corretas: ${normalCorrectCredits}/${normalResults.length} (${(normalCorrectCredits/normalResults.length*100).toFixed(1)}%)`);
    console.log(`   - Total gasto: R$ ${normalTotalSpent.toFixed(2)}`);
    console.log(`   - Total ganho: R$ ${normalTotalPrizes.toFixed(2)}`);
    console.log(`   - Saldo líquido: R$ ${(normalTotalPrizes - normalTotalSpent).toFixed(2)}`);
    
    // Verificação se está funcionando
    console.log('\n✅ VERIFICAÇÃO DA CREDITAÇÃO:');
    if (demoCorrectCredits === demoResults.length) {
      console.log('   ✅ Contas demo: Creditação funcionando perfeitamente');
    } else {
      console.log('   ❌ Contas demo: Problemas na creditação detectados');
    }
    
    if (normalCorrectCredits === normalResults.length) {
      console.log('   ✅ Contas normais: Creditação funcionando perfeitamente');
    } else {
      console.log('   ❌ Contas normais: Problemas na creditação detectados');
    }
    
    // Verificar se contas demo ganham mais
    const demoNetGain = demoTotalPrizes - demoTotalSpent;
    const normalNetGain = normalTotalPrizes - normalTotalSpent;
    
    if (demoNetGain > normalNetGain) {
      console.log('   ✅ Contas demo ganham mais que contas normais (RTP alto funcionando)');
    } else {
      console.log('   ❌ Contas demo NÃO ganham mais que contas normais (RTP pode estar igual)');
    }
    
    console.log('\n🎯 TESTE DE CREDITAÇÃO CONCLUÍDO!');
    console.log('💡 Verifique se os prêmios estão sendo creditados corretamente no saldo.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📡 Data:', error.response.data);
    }
  }
}

// Executar teste
testPrizeCrediting();
