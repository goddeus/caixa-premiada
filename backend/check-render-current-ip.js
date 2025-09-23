// Teste para verificar IP atual do Render em tempo real
const axios = require('axios');

async function checkRenderCurrentIP() {
  try {
    console.log('🔍 VERIFICANDO IP ATUAL DO RENDER');
    console.log('=================================');
    
    // Testar endpoint atualizado
    const response = await axios.get('https://slotbox-api.onrender.com/api/pixup-test');
    
    console.log('✅ Resposta do Render:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.ipInfo) {
      console.log('\n🌐 IPs ATUAIS DO RENDER:');
      console.log('========================');
      console.log('Client IP:', response.data.ipInfo.clientIP);
      console.log('X-Forwarded-For:', response.data.ipInfo.xForwardedFor);
      console.log('CF-Connecting-IP:', response.data.ipInfo.cfConnectingIP);
      console.log('True-Client-IP:', response.data.ipInfo.allHeaders['true-client-ip']);
      
      // Verificar se há novos IPs
      const forwardedIPs = response.data.ipInfo.xForwardedFor?.split(',') || [];
      console.log('\n📋 TODOS OS IPs NA CADEIA:');
      forwardedIPs.forEach((ip, index) => {
        console.log(`  ${index + 1}. ${ip.trim()}`);
      });
      
      // Verificar headers específicos do Cloudflare
      console.log('\n☁️ HEADERS DO CLOUDFLARE:');
      for (const [key, value] of Object.entries(response.data.ipInfo.allHeaders)) {
        if (key.toLowerCase().includes('cf-') || key.toLowerCase().includes('cloudflare')) {
          console.log(`  ${key}: ${value}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

checkRenderCurrentIP();
