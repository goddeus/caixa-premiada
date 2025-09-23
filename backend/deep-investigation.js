// Script para investigar o problema real
// Cole no console do navegador (F12)

console.log('🔍 INVESTIGAÇÃO PROFUNDA DO PROBLEMA');
console.log('===================================');

async function deepInvestigation() {
  try {
    // 1. Verificar configurações detalhadas
    console.log('\n⚙️ CONFIGURAÇÕES DETALHADAS:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Configurações completas:', configData);
    
    // 2. Verificar se as credenciais estão realmente corretas
    console.log('\n🔐 VERIFICAÇÃO DAS CREDENCIAIS:');
    console.log('Client ID:', configData.config.clientId);
    console.log('API URL:', configData.config.apiUrl);
    console.log('Credenciais:', configData.credentials);
    
    // 3. Testar com diferentes abordagens
    console.log('\n🧪 TESTANDO DIFERENTES ABORDAGENS:');
    
    // Teste 1: Verificar se é problema de timeout
    console.log('Teste 1: Verificando timeout...');
    const startTime = Date.now();
    
    const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const authData = await authResponse.json();
    
    console.log('Tempo de resposta:', endTime - startTime, 'ms');
    console.log('Status:', authResponse.status);
    console.log('Resposta:', authData);
    
    // 4. Analisar o erro específico
    if (!authData.success && authData.error.includes('IP bloqueado')) {
      console.log('\n🚨 ANÁLISE DO ERRO "IP BLOQUEADO":');
      console.log('💡 Possíveis causas:');
      console.log('   1. Conta Pixup com problema (mesmo que gerente diga que não)');
      console.log('   2. Credenciais incorretas na Pixup');
      console.log('   3. Conta suspensa ou bloqueada');
      console.log('   4. Problema na API da Pixup');
      console.log('   5. Render usando IP diferente do esperado');
      
      // 5. Verificar IPs do Render
      console.log('\n🌐 VERIFICANDO IPs DO RENDER:');
      console.log('Client IP:', configData.ipInfo?.clientIP);
      console.log('X-Forwarded-For:', configData.ipInfo?.xForwardedFor);
      console.log('CF-Connecting-IP:', configData.ipInfo?.cfConnectingIP);
      
      // 6. Sugestões de solução
      console.log('\n💡 SUGESTÕES DE SOLUÇÃO:');
      console.log('   1. Verificar com o gerente Pixup se a conta está ativa');
      console.log('   2. Confirmar se as credenciais estão corretas na Pixup');
      console.log('   3. Verificar se há algum bloqueio na conta');
      console.log('   4. Testar com credenciais de teste (se disponíveis)');
      console.log('   5. Verificar se a conta tem permissão para depósitos');
      
    } else if (!authData.success) {
      console.log('\n🚨 OUTRO TIPO DE ERRO:', authData.error);
    } else {
      console.log('\n✅ Autenticação funcionando!');
    }
    
    // 7. Teste adicional: verificar se é problema de rede
    console.log('\n🌐 TESTE DE CONECTIVIDADE:');
    try {
      const pingResponse = await fetch('https://api.pixupbr.com/v2/oauth/token', {
        method: 'OPTIONS'
      });
      console.log('Conectividade com Pixup:', pingResponse.status);
    } catch (error) {
      console.log('Erro de conectividade:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erro na investigação:', error.message);
  }
}

// Executar investigação
deepInvestigation();
