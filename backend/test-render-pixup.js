// Teste direto no Render para verificar IP bloqueado
const axios = require('axios');

async function testRenderPixup() {
  try {
    console.log('🔍 TESTANDO PIXUP NO RENDER');
    console.log('============================');
    
    // Testar endpoint de teste do Render
    const response = await axios.get('https://slotbox-api.onrender.com/api/pixup-test');
    console.log('✅ Render respondendo:', response.data);
    
    // Testar endpoint de depósito no Render
    const depositResponse = await axios.post('https://slotbox-api.onrender.com/api/pixup/deposit', {
      userId: 'test-user-id',
      amount: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Depósito no Render funcionou!');
    
  } catch (error) {
    console.log('❌ Erro no Render:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.message?.includes('IP bloqueado')) {
      console.log('\n🚨 CONFIRMADO: IP do Render está bloqueado!');
      console.log('💡 SOLUÇÃO: Adicionar IPs do Render na whitelist da Pixup');
    }
  }
}

testRenderPixup();
