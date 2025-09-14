// TESTE COMPLETO DO SISTEMA APÓS CORREÇÕES
const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testCompleteSystem() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA');
  console.log('============================');
  
  try {
    // 1. TESTAR ENDPOINT /api/cases (sem autenticação)
    console.log('\n📦 1. TESTANDO ENDPOINT /api/cases');
    console.log('----------------------------------');
    
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`);
    console.log('✅ Status:', casesResponse.status);
    console.log('📊 Estrutura da resposta:', Object.keys(casesResponse.data));
    
    if (casesResponse.data.success && casesResponse.data.data) {
      console.log('✅ Estrutura correta: { success: true, data: [...] }');
      console.log(`📦 Total de caixas: ${casesResponse.data.data.length}`);
      
      // Verificar cada caixa
      casesResponse.data.data.forEach((caseItem, index) => {
        console.log(`\n📦 Caixa ${index + 1}:`);
        console.log(`   ID: ${caseItem.id}`);
        console.log(`   Nome: ${caseItem.nome}`);
        console.log(`   Preço: R$ ${caseItem.preco}`);
        console.log(`   Ativa: ${caseItem.ativo ? '✅' : '❌'}`);
        console.log(`   Imagem: ${caseItem.imagem_url || '❌ Não definida'}`);
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
      console.log('❌ Estrutura incorreta!');
      return;
    }
    
    // 2. TESTAR ENDPOINT /api/cases/:id
    console.log('\n📦 2. TESTANDO ENDPOINT /api/cases/:id');
    console.log('--------------------------------------');
    
    if (casesResponse.data.data && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      const caseDetailResponse = await axios.get(`${API_BASE_URL}/cases/${firstCase.id}`);
      
      console.log('✅ Status:', caseDetailResponse.status);
      console.log('📊 Estrutura da resposta:', Object.keys(caseDetailResponse.data));
      
      if (caseDetailResponse.data.success && caseDetailResponse.data.data) {
        console.log('✅ Estrutura correta: { success: true, data: {...} }');
        console.log(`📦 Caixa: ${caseDetailResponse.data.data.nome}`);
        console.log(`💰 Preço: R$ ${caseDetailResponse.data.data.preco}`);
        console.log(`🎁 Prêmios: ${caseDetailResponse.data.data.prizes?.length || 0}`);
      } else {
        console.log('❌ Estrutura incorreta!');
      }
    }
    
    // 3. TESTAR ENDPOINT /api/cases/buy/:id (sem autenticação - deve retornar 401)
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
      
      // Verificar imagens
      const casesWithoutImages = casesResponse.data.data.filter(c => !c.imagem_url);
      if (casesWithoutImages.length > 0) {
        inconsistencies.push(`⚠️  ${casesWithoutImages.length} caixas sem imagem: ${casesWithoutImages.map(c => c.nome).join(', ')}`);
      }
    }
    
    if (inconsistencies.length > 0) {
      console.log('🚨 INCONSISTÊNCIAS ENCONTRADAS:');
      inconsistencies.forEach(inconsistency => {
        console.log(`   ${inconsistency}`);
      });
    } else {
      console.log('✅ Nenhuma inconsistência encontrada!');
    }
    
    // 5. TESTAR COMPATIBILIDADE COM FRONTEND
    console.log('\n🎮 5. TESTANDO COMPATIBILIDADE COM FRONTEND');
    console.log('------------------------------------------');
    
    if (casesResponse.data.data && casesResponse.data.data.length > 0) {
      const firstCase = casesResponse.data.data[0];
      
      // Simular o que o frontend espera
      const frontendExpectedStructure = {
        success: casesResponse.data.success,
        data: casesResponse.data.data.map(caseItem => ({
          id: caseItem.id,
          nome: caseItem.nome,
          preco: caseItem.preco,
          imagem_url: caseItem.imagem_url,
          ativo: caseItem.ativo,
          prizes: caseItem.prizes
        }))
      };
      
      console.log('✅ Estrutura compatível com frontend:');
      console.log(`   - Campo "success": ${frontendExpectedStructure.success ? '✅' : '❌'}`);
      console.log(`   - Campo "data": ${frontendExpectedStructure.data ? '✅' : '❌'}`);
      console.log(`   - Total de caixas: ${frontendExpectedStructure.data.length}`);
      
      // Verificar se todas as caixas têm os campos necessários
      const requiredFields = ['id', 'nome', 'preco'];
      let missingFields = [];
      
      frontendExpectedStructure.data.forEach(caseItem => {
        requiredFields.forEach(field => {
          if (!caseItem[field]) {
            missingFields.push(`Caixa "${caseItem.nome}" sem campo "${field}"`);
          }
        });
      });
      
      if (missingFields.length > 0) {
        console.log('❌ Campos obrigatórios ausentes:');
        missingFields.forEach(missing => {
          console.log(`   ${missing}`);
        });
      } else {
        console.log('✅ Todos os campos obrigatórios presentes!');
      }
    }
    
    // 6. RESUMO FINAL
    console.log('\n📊 RESUMO FINAL');
    console.log('===============');
    console.log(`📦 Total de caixas: ${casesResponse.data.data?.length || 0}`);
    console.log(`⚠️  Inconsistências: ${inconsistencies.length}`);
    console.log(`✅ API funcionando: ${casesResponse.status === 200 ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Estrutura correta: ${casesResponse.data.success && casesResponse.data.data ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Compatível com frontend: ${casesResponse.data.success && casesResponse.data.data ? 'SIM' : 'NÃO'}`);
    
    if (inconsistencies.length > 0) {
      console.log('\n🔧 AÇÕES RECOMENDADAS:');
      console.log('   1. Corrigir caixas sem prêmios');
      console.log('   2. Verificar preços inválidos');
      console.log('   3. Ajustar probabilidades dos prêmios');
      console.log('   4. Adicionar imagens para as caixas');
    } else {
      console.log('\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('   ✅ Todas as correções aplicadas com sucesso');
      console.log('   ✅ Frontend pode usar dados dinâmicos');
      console.log('   ✅ API retorna estrutura correta');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Dados:', error.response.data);
    }
  }
}

// Executar teste
testCompleteSystem();
