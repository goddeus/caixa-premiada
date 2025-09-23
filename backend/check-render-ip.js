// Teste para verificar IP do Render e testar Pixup
const axios = require('axios');

async function checkRenderIPAndPixup() {
  try {
    console.log('🔍 VERIFICANDO IP DO RENDER E PIXUP');
    console.log('===================================');
    
    // 1. Verificar IP do Render via endpoint de teste
    console.log('\n🌐 TESTE 1: Verificar IP do Render');
    try {
      const ipResponse = await axios.get('https://slotbox-api.onrender.com/api/pixup-test');
      console.log('✅ Render respondendo:', ipResponse.data);
      
      // Verificar headers para IP
      console.log('📡 Headers da resposta:');
      for (const [key, value] of Object.entries(ipResponse.headers)) {
        if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('x-')) {
          console.log(`  ${key}: ${value}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar Render:', error.message);
    }
    
    // 2. Testar endpoint que pode revelar IP
    console.log('\n🔍 TESTE 2: Endpoint que revela IP');
    try {
      const response = await axios.get('https://slotbox-api.onrender.com/api/pixup-test', {
        headers: {
          'User-Agent': 'SlotBox-Test/1.0'
        }
      });
      console.log('✅ Resposta:', response.data);
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
    
    // 3. Verificar se há endpoint de debug no backend
    console.log('\n🔧 TESTE 3: Verificar endpoints disponíveis');
    const endpoints = [
      '/api/pixup-test',
      '/api/health',
      '/api/pixup/deposit',
      '/api/pixup/withdraw'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://slotbox-api.onrender.com${endpoint}`, {
          timeout: 5000
        });
        console.log(`✅ ${endpoint}: Status ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
      }
    }
    
    // 4. Testar com método HEAD para ver headers
    console.log('\n📡 TESTE 4: Headers via HEAD request');
    try {
      const response = await axios.head('https://slotbox-api.onrender.com/api/pixup-test');
      console.log('📋 Headers da resposta:');
      for (const [key, value] of Object.entries(response.headers)) {
        console.log(`  ${key}: ${value}`);
      }
    } catch (error) {
      console.log('❌ Erro no HEAD request:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkRenderIPAndPixup();
