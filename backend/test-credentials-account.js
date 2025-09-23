// Teste para verificar se é problema de credenciais ou conta
// Cole no console do navegador (F12)

console.log('🔍 TESTE DE CREDENCIAIS E CONTA PIXUP');
console.log('====================================');

async function testCredentialsAndAccount() {
  try {
    // 1. Verificar configurações
    console.log('\n⚙️ VERIFICANDO CONFIGURAÇÕES:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Configurações:', configData);
    
    // 2. Verificar se as credenciais estão corretas
    console.log('\n🔐 VERIFICANDO CREDENCIAIS:');
    const credentials = configData.credentials;
    
    console.log('Client ID Length:', credentials.clientIdLength);
    console.log('Client Secret Length:', credentials.clientSecretLength);
    console.log('Client ID Start:', credentials.clientIdStart);
    console.log('Client Secret Start:', credentials.clientSecretStart);
    
    // Verificar se os tamanhos estão corretos
    if (credentials.clientIdLength !== 25) {
      console.log('❌ Client ID com tamanho incorreto!');
    } else {
      console.log('✅ Client ID com tamanho correto');
    }
    
    if (credentials.clientSecretLength !== 64) {
      console.log('❌ Client Secret com tamanho incorreto!');
    } else {
      console.log('✅ Client Secret com tamanho correto');
    }
    
    // 3. Verificar se a URL está correta
    if (configData.config.apiUrl !== 'https://api.pixupbr.com') {
      console.log('❌ URL incorreta:', configData.config.apiUrl);
    } else {
      console.log('✅ URL correta');
    }
    
    // 4. Testar autenticação
    console.log('\n🔑 TESTANDO AUTENTICAÇÃO:');
    const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const authData = await authResponse.json();
    console.log('Status:', authResponse.status);
    console.log('Resposta:', authData);
    
    // 5. Análise do problema
    if (!authData.success) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('Erro:', authData.error);
      
      if (authData.error.includes('IP bloqueado')) {
        console.log('\n💡 ANÁLISE DO PROBLEMA "IP BLOQUEADO":');
        console.log('Se o gerente disse que depósito não deveria bloquear IP, então:');
        console.log('   1. A conta pode estar suspensa ou bloqueada');
        console.log('   2. As credenciais podem estar incorretas na Pixup');
        console.log('   3. A conta pode não ter permissão para depósitos');
        console.log('   4. Pode haver um problema na API da Pixup');
        
        console.log('\n🔧 SOLUÇÕES SUGERIDAS:');
        console.log('   1. Contatar o gerente Pixup novamente');
        console.log('   2. Verificar se a conta está ativa');
        console.log('   3. Confirmar se as credenciais estão corretas');
        console.log('   4. Verificar se há algum bloqueio na conta');
        console.log('   5. Testar com credenciais de teste');
        
      } else {
        console.log('\n💡 OUTRO TIPO DE ERRO:', authData.error);
      }
    } else {
      console.log('\n✅ Autenticação funcionando!');
    }
    
    // 6. Verificar IPs do Render
    console.log('\n🌐 IPs DO RENDER:');
    console.log('Client IP:', configData.ipInfo?.clientIP);
    console.log('X-Forwarded-For:', configData.ipInfo?.xForwardedFor);
    console.log('CF-Connecting-IP:', configData.ipInfo?.cfConnectingIP);
    
    // 7. Resumo final
    console.log('\n📋 RESUMO FINAL:');
    console.log('Configurações:', configData.success ? '✅ OK' : '❌ Problema');
    console.log('Credenciais:', credentials.clientIdLength === 25 && credentials.clientSecretLength === 64 ? '✅ OK' : '❌ Problema');
    console.log('URL:', configData.config.apiUrl === 'https://api.pixupbr.com' ? '✅ OK' : '❌ Problema');
    console.log('Autenticação:', authData.success ? '✅ OK' : '❌ Problema');
    
    if (!authData.success) {
      console.log('\n🎯 CONCLUSÃO:');
      console.log('O problema não é técnico - é de configuração da conta Pixup.');
      console.log('Contate o gerente Pixup para verificar:');
      console.log('   - Status da conta');
      console.log('   - Credenciais corretas');
      console.log('   - Permissões de depósito');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testCredentialsAndAccount();
