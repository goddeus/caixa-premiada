// TESTE DE AUDITORIA DA API EM PRODUÇÃO
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testApiAudit() {
  console.log('🔍 AUDITORIA DA API EM PRODUÇÃO');
  console.log('================================');
  
  try {
    // 1. TESTAR ENDPOINT /api/cases
    console.log('\n📦 1. TESTANDO ENDPOINT /api/cases');
    console.log('----------------------------------');
    
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    console.log('✅ Status:', casesResponse.status);
    console.log('📊 Estrutura da resposta:', Object.keys(casesResponse.data));
    
    if (casesResponse.data.success) {
      console.log('✅ Campo "success" presente');
    } else {
      console.log('❌ Campo "success" ausente');
    }
    
    if (casesResponse.data.data) {
      console.log('✅ Campo "data" presente');
      console.log(`📦 Total de caixas: ${casesResponse.data.data.length}`);
      
      casesResponse.data.data.forEach((caseItem, index) => {
        console.log(`\n📦 Caixa ${index + 1}:`);
        console.log(`   ID: ${caseItem.id}`);
        console.log(`   Nome: ${caseItem.nome}`);
        console.log(`   Preço: R$ ${caseItem.preco}`);
        console.log(`   Ativa: ${caseItem.ativo ? '✅' : '❌'}`);
        console.log(`   Prêmios: ${caseItem.prizes?.length || 0}`);
        
        if (caseItem.prizes && caseItem.prizes.length > 0) {
          console.log('   📋 Prêmios:');
          caseItem.prizes.forEach((prize, prizeIndex) => {
            console.log(`      ${prizeIndex + 1}. ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
          });
        } else {
          console.log('   ⚠️  NENHUM PRÊMIO CONFIGURADO!');
        }
      });
    } else {
      console.log('❌ Campo "data" ausente');
    }
    
    // 2. TESTAR ENDPOINT /api/cases/:id
    console.log('\n📦 2. TESTANDO ENDPOINT /api/cases/:id');
    console.log('--------------------------------------');
    
    if (casesResponse.data.data && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      const caseDetailResponse = await axios.get(`${API_BASE_URL}/cases/${firstCase.id}`);
      
      console.log('✅ Status:', caseDetailResponse.status);
      console.log('📊 Estrutura da resposta:', Object.keys(caseDetailResponse.data));
      
      if (caseDetailResponse.data.success) {
        console.log('✅ Campo "success" presente');
      } else {
        console.log('❌ Campo "success" ausente');
      }
      
      if (caseDetailResponse.data.data) {
        console.log('✅ Campo "data" presente');
        console.log(`📦 Caixa: ${caseDetailResponse.data.data.nome}`);
        console.log(`💰 Preço: R$ ${caseDetailResponse.data.data.preco}`);
      } else {
        console.log('❌ Campo "data" ausente');
      }
    }
    
    // 3. TESTAR ENDPOINT /api/cases/buy/:id (sem autenticação)
    console.log('\n🎯 3. TESTANDO ENDPOINT /api/cases/buy/:id (sem auth)');
    console.log('----------------------------------------------------');
    
    if (casesResponse.data.data && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      
      try {
        const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${firstCase.id}`);
        console.log('❌ Endpoint deveria exigir autenticação!');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Endpoint corretamente protegido (401 Unauthorized)');
        } else {
          console.log('❌ Erro inesperado:', error.response?.status, error.response?.data);
        }
      }
    }
    
    // 4. VERIFICAR INCONSISTÊNCIAS
    console.log('\n⚠️  4. VERIFICANDO INCONSISTÊNCIAS');
    console.log('----------------------------------');
    
    let inconsistencies = [];
    
    if (casesResponse.data.data) {
      // Verificar caixas sem prêmios
      const casesWithoutPrizes = casesResponse.data.data.filter(c => !c.prizes || c.prizes.length === 0);
      if (casesWithoutPrizes.length > 0) {
        inconsistencies.push(`❌ ${casesWithoutPrizes.length} caixas sem prêmios: ${casesWithoutPrizes.map(c => c.nome).join(', ')}`);
      }
      
      // Verificar preços inválidos
      const invalidPrices = casesResponse.data.data.filter(c => c.preco <= 0);
      if (invalidPrices.length > 0) {
        inconsistencies.push(`❌ ${invalidPrices.length} caixas com preço inválido: ${invalidPrices.map(c => c.nome).join(', ')}`);
      }
      
      // Verificar probabilidades
      casesResponse.data.data.forEach(caseItem => {
        if (caseItem.prizes && caseItem.prizes.length > 0) {
          const totalProbability = caseItem.prizes.reduce((sum, p) => sum + p.probabilidade, 0);
          if (totalProbability > 1.0) {
            inconsistencies.push(`❌ Caixa "${caseItem.nome}" tem probabilidade total > 100% (${(totalProbability * 100).toFixed(2)}%)`);
          }
        }
      });
    }
    
    if (inconsistencies.length > 0) {
      console.log('🚨 INCONSISTÊNCIAS ENCONTRADAS:');
      inconsistencies.forEach(inconsistency => {
        console.log(`   ${inconsistency}`);
      });
    } else {
      console.log('✅ Nenhuma inconsistência encontrada!');
    }
    
    // 5. RESUMO FINAL
    console.log('\n📊 RESUMO FINAL');
    console.log('===============');
    console.log(`📦 Total de caixas: ${casesResponse.data.data?.length || 0}`);
    console.log(`⚠️  Inconsistências: ${inconsistencies.length}`);
    console.log(`✅ API funcionando: ${casesResponse.status === 200 ? 'SIM' : 'NÃO'}`);
    
    if (inconsistencies.length > 0) {
      console.log('\n🔧 AÇÕES RECOMENDADAS:');
      console.log('   1. Corrigir caixas sem prêmios');
      console.log('   2. Verificar preços inválidos');
      console.log('   3. Ajustar probabilidades dos prêmios');
    }
    
  } catch (error) {
    console.error('❌ Erro na auditoria:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Dados:', error.response.data);
    }
  }
}

// Executar auditoria
testApiAudit();
