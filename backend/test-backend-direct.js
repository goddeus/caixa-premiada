// Script para testar o backend diretamente
// Cole no console do navegador (F12)

console.log('🔍 TESTE DO BACKEND RENDER');
console.log('=========================');

async function testBackendDirect() {
  try {
    // 1. Verificar configurações
    console.log('\n⚙️ VERIFICANDO CONFIGURAÇÕES:');
    const configResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
    const configData = await configResponse.json();
    
    console.log('Configurações:', configData);
    
    if (!configData.success) {
      console.log('❌ Backend com problema');
      return;
    }
    
    // 2. Testar autenticação via backend
    console.log('\n🔐 TESTANDO AUTENTICAÇÃO VIA BACKEND:');
    
    // Criar endpoint de teste de autenticação
    const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Autenticação via backend:', authData);
    } else {
      console.log('❌ Erro na autenticação via backend:', authResponse.status);
    }
    
    // 3. Testar depósito se usuário estiver logado
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
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testBackendDirect();
