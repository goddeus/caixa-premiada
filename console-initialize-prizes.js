// CÓDIGO PARA INICIALIZAR PRÊMIOS - COLE NO CONSOLE DO NAVEGADOR
// Este código vai chamar o endpoint do backend para inicializar os prêmios das caixas

(async function() {
  console.log('🎁 INICIALIZANDO PRÊMIOS DAS CAIXAS');
  console.log('===================================');
  
  // Verificar token
  const token = localStorage.getItem('token');
  console.log('Token:', token ? '✅ Encontrado' : '❌ Não encontrado');
  
  if (!token) {
    console.log('❌ Faça login primeiro!');
    return;
  }
  
  // URL da API
  const baseURL = 'https://slotbox-api.onrender.com/api';
  
  try {
    console.log('📡 Chamando endpoint de inicialização de prêmios...');
    console.log('URL:', baseURL + '/seed/initialize-prizes');
    
    const response = await fetch(`${baseURL}/seed/initialize-prizes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📡 Resposta da API:', data);
    
    if (data.success) {
      console.log('✅ SUCESSO! Prêmios inicializados com sucesso!');
      console.log(`📊 ${data.message}`);
      
      if (data.data && data.data.summary) {
        console.log('\n📋 RESUMO:');
        console.log(`📦 Caixas processadas: ${data.data.summary.processed}/${data.data.summary.total_cases}`);
        console.log(`🎁 Total de prêmios criados: ${data.data.summary.total_prizes}`);
        console.log(`❌ Erros: ${data.data.summary.errors}`);
        
        if (data.data.processed && data.data.processed.length > 0) {
          console.log('\n🎁 PRÊMIOS CRIADOS POR CAIXA:');
          data.data.processed.forEach(caseData => {
            console.log(`\n📦 ${caseData.case}:`);
            console.log(`   Prêmios: ${caseData.prizes_count}`);
            caseData.prizes.forEach(prize => {
              const tipo = prize.sorteavel ? 'REAL' : 'ILUSTRATIVO';
              console.log(`   - ${prize.nome} (R$ ${prize.valor}) [${tipo}]`);
            });
          });
        }
        
        if (data.data.errors && data.data.errors.length > 0) {
          console.log('\n❌ ERROS ENCONTRADOS:');
          data.data.errors.forEach(error => {
            console.log(`   - ${error.case}: ${error.error}`);
          });
        }
      }
      
      console.log('\n🎉 INICIALIZAÇÃO CONCLUÍDA!');
      console.log('Agora você pode testar as caixas - elas devem ter prêmios!');
      
    } else {
      console.log('❌ ERRO na inicialização:', data.message);
      if (data.error) {
        console.log('Detalhes:', data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('🔍 Detalhes do erro:', error);
  }
})();
