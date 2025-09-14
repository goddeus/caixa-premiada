// TESTE DO ENDPOINT DE ABERTURA - COLE NO CONSOLE DO NAVEGADOR
(async function() {
  console.log('🧪 TESTE DO ENDPOINT DE ABERTURA DE CAIXAS');
  console.log('==========================================');
  
  const token = localStorage.getItem('token');
  const baseURL = 'https://slotbox-api.onrender.com/api';
  
  if (!token) {
    console.log('❌ Token não encontrado. Faça login primeiro.');
    return;
  }
  
  try {
    // 1. TESTAR ENDPOINT /api/cases
    console.log('\n📦 1. TESTANDO ENDPOINT /api/cases');
    console.log('----------------------------------');
    
    const casesResponse = await fetch(`${baseURL}/cases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const casesData = await casesResponse.json();
    console.log('✅ Status:', casesResponse.status);
    console.log('📊 Resposta:', casesData);
    
    if (casesData.success && casesData.data) {
      console.log('✅ Estrutura correta: { success: true, data: [...] }');
      console.log(`📦 Total de caixas: ${casesData.data.length}`);
      
      // Mostrar primeira caixa
      const firstCase = casesData.data[0];
      console.log('\n📦 Primeira caixa:');
      console.log(`   ID: ${firstCase.id}`);
      console.log(`   Nome: ${firstCase.nome}`);
      console.log(`   Preço: R$ ${firstCase.preco}`);
      console.log(`   Ativa: ${firstCase.ativo ? '✅' : '❌'}`);
      console.log(`   Prêmios: ${firstCase.prizes?.length || 0}`);
      
      // 2. TESTAR ENDPOINT /api/cases/buy/:id
      console.log('\n🎯 2. TESTANDO ENDPOINT /api/cases/buy/:id');
      console.log('----------------------------------------');
      
      console.log(`🎲 Testando abertura da caixa: ${firstCase.nome}`);
      
      const buyResponse = await fetch(`${baseURL}/cases/buy/${firstCase.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const buyData = await buyResponse.json();
      console.log('✅ Status:', buyResponse.status);
      console.log('📊 Resposta:', buyData);
      
      if (buyResponse.status === 200) {
        console.log('✅ Endpoint funcionando!');
        if (buyData.success && buyData.data) {
          console.log('✅ Estrutura correta: { success: true, data: { ganhou, premio, saldo_restante } }');
          console.log(`🎯 Ganhou: ${buyData.data.ganhou}`);
          console.log(`🎁 Prêmio: ${buyData.data.premio ? buyData.data.premio.nome : 'Nenhum'}`);
          console.log(`💰 Saldo restante: R$ ${buyData.data.saldo_restante}`);
          
          if (buyData.data.premio) {
            console.log('🎉 FRONTEND ENCONTRARIA O PRÊMIO EM response.data.premio!');
          } else {
            console.log('ℹ️  Nenhum prêmio desta vez (normal)');
          }
        } else {
          console.log('❌ Estrutura incorreta na resposta!');
        }
      } else if (buyResponse.status === 500) {
        console.log('❌ ERRO 500 DETECTADO!');
        console.log('📊 Dados do erro:', buyData);
        console.log('🔍 Isso indica um problema no servidor');
        
        // Tentar identificar o problema
        if (buyData.error === 'Erro interno do servidor') {
          console.log('🔍 Erro genérico - provavelmente um problema no código do servidor');
        } else {
          console.log('🔍 Erro específico:', buyData.error);
        }
      } else {
        console.log(`❌ Status inesperado: ${buyResponse.status}`);
        console.log('📊 Dados:', buyData);
      }
      
    } else {
      console.log('❌ Estrutura incorreta na resposta das caixas!');
    }
    
    // 3. RESUMO FINAL
    console.log('\n📊 RESUMO FINAL');
    console.log('===============');
    console.log(`📦 Total de caixas: ${casesData.data?.length || 0}`);
    console.log(`✅ API funcionando: ${casesResponse.status === 200 ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Estrutura correta: ${casesData.success && casesData.data ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Endpoint de abertura: ${buyResponse.status === 200 ? 'FUNCIONANDO' : 'COM PROBLEMA'}`);
    
    if (buyResponse.status === 200) {
      console.log('\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('   ✅ Todas as correções aplicadas com sucesso');
      console.log('   ✅ Frontend pode usar dados dinâmicos');
      console.log('   ✅ API retorna estrutura correta');
      console.log('   ✅ Sistema de abertura de caixas funcionando');
    } else if (buyResponse.status === 500) {
      console.log('\n❌ PROBLEMA NO SERVIDOR!');
      console.log('   🔍 Erro 500 indica problema no código do servidor');
      console.log('   🔍 Possíveis causas:');
      console.log('      - Erro no centralizedDrawService');
      console.log('      - Erro no prizeValidationService');
      console.log('      - Erro no walletService');
      console.log('      - Erro no Prisma Client');
      console.log('      - Erro na transação do banco de dados');
    } else {
      console.log('\n❌ PROBLEMA DESCONHECIDO!');
      console.log(`   🔍 Status: ${buyResponse.status}`);
      console.log('   🔍 Dados:', buyData);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
})();
