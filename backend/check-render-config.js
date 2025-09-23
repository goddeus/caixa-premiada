// Script para verificar configurações do Render
// Cole no console do navegador (F12)

console.log('🔍 VERIFICANDO CONFIGURAÇÕES DO RENDER');
console.log('=====================================');

async function checkRenderConfig() {
  try {
    // 1. Verificar endpoint de teste
    console.log('\n⚙️ TESTANDO ENDPOINT DE CONFIGURAÇÃO:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Status:', configResponse.status);
    console.log('Configurações:', configData);
    
    if (configData.success) {
      console.log('\n📋 INFORMAÇÕES IMPORTANTES:');
      console.log('Client ID:', configData.config.clientId);
      console.log('API URL:', configData.config.apiUrl);
      console.log('Serviço usado:', configData.service?.type || 'N/A');
      console.log('Base URL:', configData.service?.baseUrl || 'N/A');
      
      // Verificar se a URL está correta
      if (configData.config.apiUrl === 'https://api.pixupbr.com') {
        console.log('✅ URL correta!');
      } else {
        console.log('❌ URL incorreta:', configData.config.apiUrl);
        console.log('💡 Deve ser: https://api.pixupbr.com');
      }
      
      // Verificar IPs
      console.log('\n🌐 INFORMAÇÕES DE IP:');
      console.log('Client IP:', configData.ipInfo?.clientIP);
      console.log('X-Forwarded-For:', configData.ipInfo?.xForwardedFor);
      console.log('CF-Connecting-IP:', configData.ipInfo?.cfConnectingIP);
      
    } else {
      console.log('❌ Backend com problema:', configData.message);
    }
    
    // 2. Testar autenticação direta se possível
    console.log('\n🔐 TESTANDO AUTENTICAÇÃO DIRETA:');
    try {
      const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const authData = await authResponse.json();
      
      if (authData.success) {
        console.log('✅ Endpoint de teste funcionando');
      }
    } catch (error) {
      console.log('❌ Erro no teste:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar verificação
checkRenderConfig();
