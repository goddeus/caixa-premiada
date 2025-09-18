/**
 * SCRIPT PARA TESTAR AS CORREÇÕES VIA API
 * 
 * Execute este script localmente para testar as correções
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testFixAPI() {
  try {
    console.log('🔧 TESTANDO CORREÇÕES VIA API...\n');
    
    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    const statusResponse = await axios.get(`${API_BASE_URL}/fix/status`);
    console.log('✅ Status:', JSON.stringify(statusResponse.data, null, 2));
    
    // 2. Executar correção forçada
    console.log('\n2️⃣ Executando correção forçada...');
    const fixResponse = await axios.post(`${API_BASE_URL}/fix/force-all`);
    console.log('✅ Correção:', JSON.stringify(fixResponse.data, null, 2));
    
    // 3. Verificar status após correção
    console.log('\n3️⃣ Verificando status após correção...');
    const finalStatusResponse = await axios.get(`${API_BASE_URL}/fix/status`);
    console.log('✅ Status final:', JSON.stringify(finalStatusResponse.data, null, 2));
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testFixAPI();
