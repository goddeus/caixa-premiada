const axios = require('axios');

async function checkAPIRTP() {
  try {
    console.log('🔍 Verificando sistema de RTP via API...');
    
    // 1. Verificar health
    console.log('\n1. Health Check:');
    const healthResponse = await axios.get('https://slotbox-api.onrender.com/api/health');
    console.log('✅ API Status:', healthResponse.data);
    
    // 2. Verificar caixas
    console.log('\n2. Verificando caixas:');
    const casesResponse = await axios.get('https://slotbox-api.onrender.com/api/cases');
    const cases = casesResponse.data.data || casesResponse.data;
    
    console.log(`📦 Total de caixas: ${cases.length}`);
    
    cases.forEach(caseItem => {
      console.log(`\n📦 ${caseItem.nome} (ID: ${caseItem.id}):`);
      console.log(`   💰 Preço: R$ ${caseItem.preco}`);
      console.log(`   🎁 Prêmios: ${caseItem.prizes ? caseItem.prizes.length : 'N/A'}`);
      
      if (caseItem.prizes) {
        caseItem.prizes.forEach(prize => {
          const isZeroValue = prize.valor === 0;
          const isMotivational = isZeroValue ? '🎯 MOTIVACIONAL' : '💰 REAL';
          console.log(`     - ${prize.nome}: R$ ${prize.valor} (prob: ${prize.probabilidade}) ${isMotivational}`);
        });
      }
    });
    
    // 3. Verificar configuração de RTP (se disponível)
    console.log('\n3. Verificando configuração de RTP:');
    try {
      const rtpResponse = await axios.get('https://slotbox-api.onrender.com/api/admin/rtp-config');
      console.log('📊 RTP Config:', rtpResponse.data);
    } catch (rtpError) {
      console.log('⚠️ Endpoint de RTP não disponível ou requer autenticação');
    }
    
    // 4. Verificar estatísticas (se disponível)
    console.log('\n4. Verificando estatísticas:');
    try {
      const statsResponse = await axios.get('https://slotbox-api.onrender.com/api/admin/stats');
      console.log('📊 Estatísticas:', statsResponse.data);
    } catch (statsError) {
      console.log('⚠️ Endpoint de estatísticas não disponível ou requer autenticação');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar API:', error.message);
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📡 Data:', error.response.data);
    }
  }
}

checkAPIRTP();
