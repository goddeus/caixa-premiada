/**
 * CÓDIGO SIMPLES PARA CONSOLE DO NAVEGADOR
 * 
 * Cole este código no console do navegador (F12 > Console)
 * e pressione Enter para executar
 */

(async function() {
  console.log('🔧 CORREÇÃO SIMPLES VIA CONSOLE...\n');
  
  try {
    // Tentar diferentes URLs
    const urls = [
      'https://slotbox-api.onrender.com/api/status-now',
      'https://slotbox-api.onrender.com/api/fix/status',
      'https://slotbox-api.onrender.com/api/health'
    ];
    
    console.log('1️⃣ Testando conectividade...');
    
    for (const url of urls) {
      try {
        console.log(`   Testando: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`   ✅ ${url} - Status: ${response.status}`);
        console.log(`   Resposta:`, data);
        break;
      } catch (error) {
        console.log(`   ❌ ${url} - Erro: ${error.message}`);
      }
    }
    
    console.log('\n2️⃣ Tentando executar correção...');
    
    const fixUrls = [
      'https://slotbox-api.onrender.com/api/fix-now',
      'https://slotbox-api.onrender.com/api/fix/force-all'
    ];
    
    for (const url of fixUrls) {
      try {
        console.log(`   Tentando: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log(`   ✅ ${url} - Status: ${response.status}`);
        console.log(`   Resposta:`, data);
        break;
      } catch (error) {
        console.log(`   ❌ ${url} - Erro: ${error.message}`);
      }
    }
    
    console.log('\n3️⃣ Verificação final...');
    
    // Tentar verificar status novamente
    try {
      const response = await fetch('https://slotbox-api.onrender.com/api/status-now');
      const data = await response.json();
      console.log('✅ Status final:', data);
    } catch (error) {
      console.log('❌ Erro na verificação final:', error.message);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('\n💡 Se as rotas não funcionaram:');
    console.log('   - O servidor pode estar reiniciando');
    console.log('   - Aguarde 2-3 minutos e tente novamente');
    console.log('   - A correção automática deve executar na inicialização');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
})();
