// TESTE DA API CORRIGIDA V2 - COLE NO CONSOLE DO NAVEGADOR
(async function() {
  console.log('🎯 TESTE DA API CORRIGIDA V2');
  console.log('============================');
  
  const token = localStorage.getItem('token');
  const baseURL = 'https://slotbox-api.onrender.com/api';
  
  if (!token) {
    console.log('❌ Token não encontrado. Faça login primeiro.');
    return;
  }
  
  try {
    // 1. BUSCAR CAIXA
    const casesResponse = await fetch(`${baseURL}/cases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const casesData = await casesResponse.json();
    const weekendCase = casesData.data?.find(c => 
      c.nome === 'CAIXA FINAL DE SEMANA' || c.nome.includes('FINAL DE SEMANA')
    );
    
    if (!weekendCase) {
      console.log('❌ Caixa não encontrada');
      return;
    }
    
    console.log('✅ Caixa encontrada:', weekendCase.nome);
    console.log('💰 Preço:', weekendCase.preco);
    
    // 2. TESTAR ABERTURA
    console.log('🎯 Testando abertura da caixa...');
    const buyResponse = await fetch(`${baseURL}/cases/buy/${weekendCase.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const buyData = await buyResponse.json();
    console.log('📦 Resposta completa:', buyData);
    console.log('📊 Status HTTP:', buyResponse.status);
    
    // 3. VERIFICAR SE HOUVE ERRO
    if (buyResponse.status !== 200) {
      console.log('❌ Erro na API:', buyData);
      return;
    }
    
    // 4. VERIFICAR ESTRUTURA CORRETA
    console.log('\n🔍 VERIFICANDO ESTRUTURA:');
    console.log('- Tem success?', !!buyData.success);
    console.log('- Tem data?', !!buyData.data);
    console.log('- Tem data.ganhou?', !!(buyData.data && buyData.data.ganhou !== undefined));
    console.log('- Tem data.premio?', !!(buyData.data && buyData.data.premio));
    console.log('- Tem data.saldo_restante?', !!(buyData.data && buyData.data.saldo_restante));
    
    // 5. SIMULAR PROCESSAMENTO DO FRONTEND
    console.log('\n🎮 SIMULANDO FRONTEND:');
    const response = buyData; // Como o API service retorna response.data
    
    if (response && response.data && response.data.premio) {
      console.log('✅ Frontend encontraria o prêmio em response.data.premio');
      console.log('🎁 Prêmio:', response.data.premio);
      console.log('🎯 Ganhou:', response.data.ganhou);
      console.log('💸 Saldo restante:', response.data.saldo_restante);
    } else {
      console.log('❌ Frontend NÃO encontraria o prêmio');
      console.log('🔍 Estrutura:', Object.keys(response));
      if (response.data) {
        console.log('🔍 Data keys:', Object.keys(response.data));
      }
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO!');
    
    if (response && response.data && response.data.premio) {
      console.log('🎉 TUDO FUNCIONANDO! Agora teste no frontend!');
    } else {
      console.log('❌ Ainda há problemas para resolver');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
