// Teste do endpoint atualizado com informações de IP
const axios = require('axios');

async function testUpdatedEndpoint() {
  try {
    console.log('🔍 TESTANDO ENDPOINT ATUALIZADO COM INFORMAÇÕES DE IP');
    console.log('====================================================');
    
    const response = await axios.get('https://slotbox-api.onrender.com/api/pixup-test');
    
    console.log('✅ Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.ipInfo) {
      console.log('\n🌐 INFORMAÇÕES DE IP DETALHADAS:');
      console.log('================================');
      console.log('Client IP:', response.data.ipInfo.clientIP);
      console.log('X-Forwarded-For:', response.data.ipInfo.xForwardedFor);
      console.log('X-Real-IP:', response.data.ipInfo.xRealIP);
      console.log('CF-Connecting-IP:', response.data.ipInfo.cfConnectingIP);
      console.log('CF-Ray:', response.data.ipInfo.cfRay);
      console.log('User-Agent:', response.data.ipInfo.userAgent);
      
      console.log('\n📋 TODOS OS HEADERS:');
      console.log('===================');
      for (const [key, value] of Object.entries(response.data.ipInfo.allHeaders)) {
        if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('cf-') || key.toLowerCase().includes('x-')) {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testUpdatedEndpoint();
