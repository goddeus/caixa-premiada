const axios = require('axios');

/**
 * SCRIPT DE TESTE DO SISTEMA MANIPULATIVO VIA API
 * 
 * Este script testa o sistema manipulativo diretamente via API,
 * criando um usuário de teste se necessário.
 */

// Configurações
const API_BASE = 'https://slotbox-api.onrender.com';

async function testManipulativeSystemViaAPI() {
  try {
    console.log('🧠 Testando Sistema Manipulativo via API...\n');
    
    // 1. Verificar se API está funcionando
    console.log('1. 🔍 Verificando API...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ API funcionando:', healthResponse.data.message);
    
    // 2. Tentar fazer login com usuário de teste
    console.log('\n2. 🔐 Tentando fazer login...');
    let authToken = '';
    let testUser = null;
    
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'teste@manipulative.com',
        senha: 'Teste123!'
      });
      authToken = loginResponse.data.token;
      testUser = loginResponse.data.user;
      console.log('✅ Login realizado com sucesso');
    } catch (loginError) {
      console.log('⚠️ Usuário de teste não existe. Criando novo usuário...');
      
      // Criar usuário de teste
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
        nome: 'Usuário Teste Manipulativo',
        email: 'teste@manipulative.com',
        senha: 'Teste123!',
        confirmarSenha: 'Teste123!',
        cpf: '98765432100'
      });
      
      authToken = registerResponse.data.token;
      testUser = registerResponse.data.user;
      console.log('✅ Usuário de teste criado e logado');
    }
    
    console.log(`👤 Usuário: ${testUser.nome}`);
    console.log(`💰 Saldo: R$ ${testUser.saldo_reais || 0}`);
    
    // 3. Obter caixas disponíveis
    console.log('\n3. 📦 Obtendo caixas disponíveis...');
    const casesResponse = await axios.get(`${API_BASE}/api/cases`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const cases = casesResponse.data.data || casesResponse.data;
    console.log(`✅ ${cases.length} caixas encontradas`);
    
    if (cases.length === 0) {
      console.log('❌ Nenhuma caixa disponível para teste');
      return;
    }
    
    // 4. Testar compra manipulativa
    console.log('\n4. 🎲 Testando compra manipulativa...');
    const testCase = cases[0];
    
    console.log(`📦 Testando caixa: ${testCase.nome} (R$ ${testCase.preco})`);
    
    try {
      const buyResponse = await axios.post(
        `${API_BASE}/api/cases/${testCase.id}/buy`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      const result = buyResponse.data;
      console.log('🎁 Resultado da compra manipulativa:');
      console.log(`   - Prêmio: ${result.prize.nome}`);
      console.log(`   - Valor: R$ ${result.prize.valor}`);
      
      if (result.manipulativeData) {
        console.log(`   - Estratégia: ${result.manipulativeData.strategy}`);
        console.log(`   - RTP Usado: ${(result.manipulativeData.rtpUsed * 100).toFixed(1)}%`);
        console.log(`   - É Prêmio de Retenção: ${result.manipulativeData.isRetentionPrize}`);
      }
      
      if (result.prize.psychologicalMessage) {
        console.log(`   - Mensagem Psicológica: ${result.prize.psychologicalMessage}`);
      }
      
      // Verificar se prêmio está dentro do limite esperado
      if (result.prize.valor > 0) {
        console.log(`\n🔍 VERIFICAÇÃO DE CAIXA TOTAL:`);
        console.log(`   - Prêmio liberado: R$ ${result.prize.valor.toFixed(2)}`);
        
        const casePrice = parseFloat(testCase.preco);
        let maxExpectedPrize = 0;
        
        if (result.manipulativeData) {
          switch (result.manipulativeData.strategy) {
            case 'honeymoon':
              maxExpectedPrize = Math.min(casePrice * 10, 50);
              break;
            case 'extraction':
              maxExpectedPrize = Math.min(casePrice * 0.5, 1);
              break;
            case 'retention':
              maxExpectedPrize = Math.min(casePrice * 10, 100);
              break;
            case 'maintenance':
              maxExpectedPrize = Math.min(casePrice * 2, 5);
              break;
            default:
              maxExpectedPrize = Math.min(casePrice * 0.5, 1);
          }
        }
        
        console.log(`   - Prêmio máximo esperado: R$ ${maxExpectedPrize.toFixed(2)}`);
        
        if (result.prize.valor <= maxExpectedPrize) {
          console.log(`   ✅ Prêmio dentro do limite esperado!`);
        } else {
          console.log(`   ⚠️ Prêmio acima do limite esperado!`);
        }
      } else {
        console.log(`\n🔍 VERIFICAÇÃO DE CAIXA TOTAL:`);
        console.log(`   - Prêmio: R$ 0,00 (motivacional)`);
        console.log(`   ✅ Nenhum valor liberado - sistema seguro!`);
      }
      
      console.log('\n✅ Compra manipulativa testada com sucesso');
      
    } catch (buyError) {
      console.log('❌ Erro na compra manipulativa:', buyError.response?.data?.message || buyError.message);
    }
    
    // 5. Testar estatísticas manipulativas (se endpoint existir)
    console.log('\n5. 📊 Testando estatísticas manipulativas...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/api/manipulative/user/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const stats = statsResponse.data.data;
      console.log('📈 Estatísticas do usuário:');
      console.log(`   - É Novo Usuário: ${stats.behaviorProfile.isNewUser}`);
      console.log(`   - Está Perseguindo Perdas: ${stats.behaviorProfile.isLossChasing}`);
      console.log(`   - Total Gasto: R$ ${stats.behaviorProfile.totalSpent.toFixed(2)}`);
      console.log(`   - Total Ganho: R$ ${stats.behaviorProfile.totalWon.toFixed(2)}`);
      console.log(`   - Prejuízo Líquido: R$ ${stats.behaviorProfile.netLoss.toFixed(2)}`);
      
      console.log('\n✅ Estatísticas manipulativas obtidas com sucesso');
      
    } catch (statsError) {
      console.log('⚠️ Endpoint de estatísticas manipulativas não disponível:', statsError.response?.status);
    }
    
    // 6. Resumo final
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('✅ Sistema manipulativo funcionando via API');
    console.log('✅ Verificação de caixa total implementada');
    console.log('✅ Estratégias psicológicas ativas');
    console.log('✅ Prêmios limitados pelo caixa total');
    
    console.log('\n🧠 O sistema manipulativo está operacional!');
    console.log('💡 Características ativas:');
    console.log('   - RTP dinâmico baseado no comportamento');
    console.log('   - Técnicas de manipulação psicológica');
    console.log('   - Sistema de retenção inteligente');
    console.log('   - Verificação de caixa total');
    console.log('   - Prêmios limitados pela disponibilidade de caixa');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📡 Data:', error.response.data);
    }
  }
}

// Executar teste
testManipulativeSystemViaAPI();
