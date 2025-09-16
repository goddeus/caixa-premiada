const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function checkViaAPI() {
  try {
    console.log('🔍 Verificando dados via API...\n');
    
    // 1. Verificar health
    console.log('1. Health Check:');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log(`   ✅ Status: ${healthResponse.status}`);
    console.log(`   📊 Response: ${JSON.stringify(healthResponse.data)}\n`);
    
    // 2. Verificar caixas (sem autenticação)
    console.log('2. Caixas disponíveis:');
    const casesResponse = await axios.get(`${API_BASE}/cases`);
    console.log(`   ✅ Status: ${casesResponse.status}`);
    console.log(`   📊 Response structure:`, JSON.stringify(casesResponse.data, null, 2));
    
    const casesData = casesResponse.data.data || casesResponse.data;
    console.log(`   📦 Total de caixas: ${Array.isArray(casesData) ? casesData.length : 'N/A'}\n`);
    
    if (Array.isArray(casesData)) {
      casesData.forEach((caseItem, index) => {
      console.log(`   ${index + 1}. ${caseItem.nome}`);
      console.log(`      💰 Preço: R$ ${caseItem.preco}`);
      console.log(`      📝 Descrição: ${caseItem.descricao || 'N/A'}`);
      console.log(`      🖼️ Imagem: ${caseItem.imagem}`);
      console.log(`      🎁 Prêmios: ${caseItem.prizes ? caseItem.prizes.length : 'N/A'}`);
      
      if (caseItem.prizes && caseItem.prizes.length > 0) {
        console.log('      📋 Lista de prêmios:');
        caseItem.prizes.forEach(prize => {
          console.log(`         - ${prize.nome}: R$ ${prize.valor} (${prize.probabilidade * 100}%)`);
          if (prize.imagem) {
            console.log(`           🖼️ ${prize.imagem}`);
          }
        });
      }
        console.log('');
      });
    }
    
    // 3. Verificar inconsistências
    console.log('3. Verificação de inconsistências:\n');
    
    const expectedImages = {
      'CAIXA FINAL DE SEMANA': ['1.png', '2.png', '5.png', '10.png', '100.png', '500.webp'],
      'CAIXA APPLE': ['1.png', '2.png', '5.png', '10.png', '500.webp', 'air pods.png', 'iphone 16 pro max.png', 'macbook.png'],
      'CAIXA SAMSUNG': ['1.png', '2.png', '5.png', '10.png', '100.png', '500.webp', 'fone samsung.png', 'notebook samsung.png', 's25.png'],
      'CAIXA KIT NIKE': ['1.png', '2.png', '5.png', '10.png', 'airforce.webp', 'boné nike.png', 'camisa nike.webp', 'jordan.png', 'nike dunk.webp'],
      'CAIXA PREMIUM MASTER!': ['2.png', '5.png', '10.png', '20.png', '500.webp', 'airpods.png', 'honda cg fan.webp', 'ipad.png', 'iphone 16 pro max.png', 'macbook.png', 'samsung s25.png'],
      'CAIXA CONSOLE DOS SONHOS': ['1real.png', '2reais.png', '5reais.png', '10reais.png', '100reais.png', 'ps5.png', 'steamdeck.png', 'xboxone.webp']
    };
    
    if (Array.isArray(casesData)) {
      casesData.forEach(caseItem => {
      const caseName = caseItem.nome;
      const expected = expectedImages[caseName] || [];
      
      console.log(`🎯 ${caseName}:`);
      console.log(`   📁 Imagens esperadas: ${expected.length}`);
      console.log(`   🎁 Prêmios no DB: ${caseItem.prizes ? caseItem.prizes.length : 0}`);
      
      if (caseItem.prizes) {
        caseItem.prizes.forEach(prize => {
          if (prize.imagem) {
            const imageName = prize.imagem.split('/').pop();
            const isExpected = expected.some(expectedImg => expectedImg.includes(imageName));
            console.log(`      ${isExpected ? '✅' : '❌'} ${prize.nome}: ${prize.imagem}`);
          } else {
            console.log(`      ⚠️ ${prize.nome}: SEM IMAGEM`);
          }
        });
      }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

checkViaAPI();
