// Teste completo de verificação de problemas
// Cole no console do navegador (F12)

console.log('🔍 VERIFICAÇÃO COMPLETA DE PROBLEMAS');
console.log('===================================');

async function comprehensiveCheck() {
  try {
    // 1. Verificar configurações básicas
    console.log('\n⚙️ VERIFICANDO CONFIGURAÇÕES BÁSICAS:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Status:', configResponse.status);
    console.log('Configurações:', configData);
    
    if (!configData.success) {
      console.log('❌ Backend com problema:', configData.message);
      return;
    }
    
    // 2. Verificar credenciais
    console.log('\n🔐 VERIFICANDO CREDENCIAIS:');
    console.log('Client ID:', configData.config.clientId);
    console.log('API URL:', configData.config.apiUrl);
    console.log('Serviço:', configData.service?.type);
    console.log('Credenciais:', configData.credentials);
    
    // Verificar se as credenciais estão corretas
    if (configData.credentials.clientIdLength !== 25) {
      console.log('❌ Client ID com tamanho incorreto:', configData.credentials.clientIdLength);
    }
    if (configData.credentials.clientSecretLength !== 64) {
      console.log('❌ Client Secret com tamanho incorreto:', configData.credentials.clientSecretLength);
    }
    if (configData.config.apiUrl !== 'https://api.pixupbr.com') {
      console.log('❌ URL incorreta:', configData.config.apiUrl);
    }
    
    // 3. Testar autenticação via backend
    console.log('\n🔑 TESTANDO AUTENTICAÇÃO VIA BACKEND:');
    const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const authData = await authResponse.json();
    console.log('Status:', authResponse.status);
    console.log('Resposta:', authData);
    
    if (authData.success) {
      console.log('✅ Autenticação funcionando!');
    } else {
      console.log('❌ Erro na autenticação:', authData.error);
      
      // Analisar o erro
      if (authData.error.includes('IP bloqueado')) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO: IP BLOQUEADO');
        console.log('💡 Possíveis causas:');
        console.log('   1. Conta Pixup com problema');
        console.log('   2. Credenciais incorretas');
        console.log('   3. Formato de autenticação');
        console.log('   4. API da Pixup com problema');
      } else if (authData.error.includes('Cannot read properties')) {
        console.log('\n🚨 PROBLEMA IDENTIFICADO: ERRO DE CÓDIGO');
        console.log('💡 Possíveis causas:');
        console.log('   1. Serviço não carregado corretamente');
        console.log('   2. Dependências faltando');
        console.log('   3. Erro de sintaxe');
      } else {
        console.log('\n🚨 PROBLEMA IDENTIFICADO: ERRO DESCONHECIDO');
        console.log('💡 Erro:', authData.error);
      }
    }
    
    // 4. Testar depósito se usuário estiver logado
    const token = localStorage.getItem('token');
    if (token) {
      console.log('\n💰 TESTANDO DEPÓSITO:');
      
      const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: '2a3eb9e5-5c7e-4602-bd06-4302dd47c75f',
          amount: 20
        })
      });
      
      const depositData = await depositResponse.json();
      console.log('Status:', depositResponse.status);
      console.log('Resposta:', depositData);
      
      if (depositData.success) {
        console.log('✅ Depósito funcionando!');
      } else {
        console.log('❌ Erro no depósito:', depositData.message);
      }
    } else {
      console.log('\n💡 Faça login para testar o depósito');
    }
    
    // 5. Resumo dos problemas encontrados
    console.log('\n📋 RESUMO DOS PROBLEMAS:');
    const problems = [];
    
    if (configData.credentials.clientIdLength !== 25) {
      problems.push('Client ID com tamanho incorreto');
    }
    if (configData.credentials.clientSecretLength !== 64) {
      problems.push('Client Secret com tamanho incorreto');
    }
    if (configData.config.apiUrl !== 'https://api.pixupbr.com') {
      problems.push('URL incorreta');
    }
    if (!authData.success) {
      problems.push('Autenticação falhando');
    }
    
    if (problems.length === 0) {
      console.log('✅ Nenhum problema encontrado!');
    } else {
      console.log('❌ Problemas encontrados:');
      problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar verificação completa
comprehensiveCheck();
