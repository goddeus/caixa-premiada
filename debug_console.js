// ========================================
// 🐛 DEBUG CONSOLE - CAIXA PREMIADA
// ========================================
// Cole este código no console do navegador (F12) para debugar o sistema

console.log('🔍 INICIANDO DEBUG DO SISTEMA CAIXA PREMIADA...');

// ========================================
// 1. VERIFICAR DADOS DO USUÁRIO
// ========================================
async function debugUserData() {
  console.log('\n📋 === VERIFICANDO DADOS DO USUÁRIO ===');
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Usuário logado:', userData);
      console.log('💰 Saldo Reais:', userData.saldo_reais);
      console.log('🎮 Saldo Demo:', userData.saldo_demo);
      console.log('👤 Tipo de Conta:', userData.tipo_conta);
      return userData;
    } else {
      console.error('❌ Erro ao buscar dados do usuário:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return null;
  }
}

// ========================================
// 2. VERIFICAR DADOS DAS CAIXAS
// ========================================
async function debugCaseData() {
  console.log('\n📦 === VERIFICANDO DADOS DAS CAIXAS ===');
  
  const cases = [
    { id: '1abd77cf-472b-473d-9af0-6cd47f9f1452', nome: 'CAIXA FINAL DE SEMANA' },
    { id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4', nome: 'CAIXA NIKE' },
    { id: '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415', nome: 'CAIXA SAMSUNG' },
    { id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd', nome: 'CAIXA CONSOLE' },
    { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE' },
    { id: 'db95bb2b-9b3e-444b-964f-547330010a59', nome: 'CAIXA PREMIUM MASTER' }
  ];
  
  for (const caseData of cases) {
    try {
      console.log(`\n🔍 Verificando ${caseData.nome}...`);
      
      const response = await fetch(`/api/cases/${caseData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${caseData.nome}:`, data);
        
        if (data.prizes) {
          console.log(`📋 Prêmios (${data.prizes.length}):`, data.prizes);
        }
      } else {
        console.error(`❌ Erro ao buscar ${caseData.nome}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Erro na requisição ${caseData.nome}:`, error);
    }
  }
}

// ========================================
// 3. TESTAR COMPRA DE CAIXA
// ========================================
async function debugBuyCase(caseId, caseName) {
  console.log(`\n🛒 === TESTANDO COMPRA DE ${caseName} ===`);
  
  try {
    const response = await fetch(`/api/cases/${caseId}/buy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Compra realizada com sucesso:`, data);
      
      if (data.premio) {
        console.log('🎁 Prêmio recebido:', data.premio);
        console.log('📊 Detalhes do prêmio:');
        console.log('  - Nome:', data.premio.nome);
        console.log('  - Valor:', data.premio.valor);
        console.log('  - Tipo:', data.premio.tipo);
        console.log('  - Sem Imagem:', data.premio.sem_imagem);
        console.log('  - Imagem URL:', data.premio.imagem);
        
        // Verificar se o prêmio tem imagem
        if (data.premio.sem_imagem) {
          console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
        } else {
          console.log('✅ Prêmio tem imagem configurada');
        }
      }
      
      return data;
    } else {
      const errorData = await response.json();
      console.error(`❌ Erro na compra:`, errorData);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro na requisição de compra:`, error);
    return null;
  }
}

// ========================================
// 4. VERIFICAR MAPEAMENTO DE IMAGENS
// ========================================
function debugImageMapping(prize) {
  console.log('\n🖼️ === VERIFICANDO MAPEAMENTO DE IMAGENS ===');
  console.log('Prêmio recebido:', prize);
  
  // Simular o mapeamento do frontend
  const mappedPrize = {
    name: prize.nome,
    value: `R$ ${parseFloat(prize.valor).toFixed(2).replace('.', ',')}`,
    rarity: 'rarity-1.png',
    image: prize.sem_imagem ? null : '/imagens/CAIXA TESTE/1.png',
    bgColor: 'rgb(176, 190, 197)',
    apiPrize: prize,
    sem_imagem: prize.sem_imagem || false
  };
  
  console.log('Prêmio mapeado:', mappedPrize);
  
  // Verificar se a imagem existe
  if (mappedPrize.image) {
    const img = new Image();
    img.onload = () => console.log('✅ Imagem carregada com sucesso:', mappedPrize.image);
    img.onerror = () => console.error('❌ Erro ao carregar imagem:', mappedPrize.image);
    img.src = mappedPrize.image;
  } else {
    console.log('⚠️ Prêmio sem imagem configurada');
  }
  
  return mappedPrize;
}

// ========================================
// 5. TESTAR MÚLTIPLAS COMPRAS
// ========================================
async function debugMultipleBuys(caseId, caseName, quantity = 5) {
  console.log(`\n🔄 === TESTANDO ${quantity} COMPRAS DE ${caseName} ===`);
  
  const results = [];
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    const result = await debugBuyCase(caseId, caseName);
    if (result && result.premio) {
      results.push(result.premio);
      
      // Verificar mapeamento de imagem
      debugImageMapping(result.premio);
    }
    
    // Delay entre compras
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 RESUMO DAS ${quantity} COMPRAS:`);
  results.forEach((prize, index) => {
    console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
  });
  
  return results;
}

// ========================================
// 6. VERIFICAR PROBLEMAS ESPECÍFICOS
// ========================================
async function debugSpecificIssues() {
  console.log('\n🔍 === VERIFICANDO PROBLEMAS ESPECÍFICOS ===');
  
  // Verificar se há prêmios com valores altos
  console.log('🎯 Testando prêmios de alto valor...');
  
  const highValueCases = [
    { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE' },
    { id: 'db95bb2b-9b3e-444b-964f-547330010a59', nome: 'CAIXA PREMIUM MASTER' }
  ];
  
  for (const caseData of highValueCases) {
    console.log(`\n🔍 Testando ${caseData.nome}...`);
    const results = await debugMultipleBuys(caseData.id, caseData.nome, 3);
    
    // Verificar se há prêmios de alto valor
    const highValuePrizes = results.filter(prize => prize.valor >= 1000);
    if (highValuePrizes.length > 0) {
      console.log('⚠️ PRÊMIOS DE ALTO VALOR ENCONTRADOS:');
      highValuePrizes.forEach(prize => {
        console.log(`  - ${prize.nome}: R$ ${prize.valor} (Sem Imagem: ${prize.sem_imagem})`);
      });
    }
  }
}

// ========================================
// 7. FUNÇÃO PRINCIPAL DE DEBUG
// ========================================
async function runFullDebug() {
  console.log('🚀 INICIANDO DEBUG COMPLETO...');
  
  // 1. Verificar dados do usuário
  const userData = await debugUserData();
  if (!userData) {
    console.error('❌ Não foi possível obter dados do usuário. Verifique se está logado.');
    return;
  }
  
  // 2. Verificar dados das caixas
  await debugCaseData();
  
  // 3. Testar compra de uma caixa específica
  console.log('\n🎯 Qual caixa você quer testar?');
  console.log('1. CAIXA FINAL DE SEMANA (1abd77cf-472b-473d-9af0-6cd47f9f1452)');
  console.log('2. CAIXA NIKE (0b5e9b8a-9d56-4769-a45a-55a3025640f4)');
  console.log('3. CAIXA SAMSUNG (3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415)');
  console.log('4. CAIXA CONSOLE (fb0c0175-b478-4fd5-9750-d673c0f374fd)');
  console.log('5. CAIXA APPLE (61a19df9-d011-429e-a9b5-d2c837551150)');
  console.log('6. CAIXA PREMIUM MASTER (db95bb2b-9b3e-444b-964f-547330010a59)');
  
  // Testar caixa console (que estava com problema)
  await debugMultipleBuys('fb0c0175-b478-4fd5-9750-d673c0f374fd', 'CAIXA CONSOLE', 5);
  
  // 4. Verificar problemas específicos
  await debugSpecificIssues();
  
  console.log('\n✅ DEBUG COMPLETO FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas.');
}

// ========================================
// 8. FUNÇÕES AUXILIARES
// ========================================

// Função para testar uma caixa específica
window.testCase = async function(caseId, caseName) {
  return await debugMultipleBuys(caseId, caseName, 3);
};

// Função para verificar dados do usuário
window.checkUser = debugUserData;

// Função para verificar dados das caixas
window.checkCases = debugCaseData;

// Função para testar compra única
window.buyCase = debugBuyCase;

// ========================================
// 9. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runFullDebug() - Executa debug completo');
console.log('- testCase(caseId, caseName) - Testa uma caixa específica');
console.log('- checkUser() - Verifica dados do usuário');
console.log('- checkCases() - Verifica dados das caixas');
console.log('- buyCase(caseId, caseName) - Testa compra única');
console.log('\n🚀 Execute runFullDebug() para começar!');

// Executar debug automaticamente
runFullDebug();
