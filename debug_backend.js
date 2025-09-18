// ========================================
// 🔧 DEBUG ESPECÍFICO DO BACKEND
// ========================================
// Cole este código no console do navegador para debugar problemas do backend

console.log('🔧 INICIANDO DEBUG DO BACKEND...');

// ========================================
// 1. VERIFICAR ENDPOINTS DO BACKEND
// ========================================
async function debugBackendEndpoints() {
  console.log('\n🌐 === VERIFICANDO ENDPOINTS DO BACKEND ===');
  
  const endpoints = [
    { url: '/api/auth/me', method: 'GET', description: 'Dados do usuário' },
    { url: '/api/cases', method: 'GET', description: 'Lista de caixas' },
    { url: '/api/cases/1abd77cf-472b-473d-9af0-6cd47f9f1452', method: 'GET', description: 'Dados da caixa Weekend' },
    { url: '/api/cases/0b5e9b8a-9d56-4769-a45a-55a3025640f4', method: 'GET', description: 'Dados da caixa Nike' },
    { url: '/api/cases/3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415', method: 'GET', description: 'Dados da caixa Samsung' },
    { url: '/api/cases/fb0c0175-b478-4fd5-9750-d673c0f374fd', method: 'GET', description: 'Dados da caixa Console' },
    { url: '/api/cases/61a19df9-d011-429e-a9b5-d2c837551150', method: 'GET', description: 'Dados da caixa Apple' },
    { url: '/api/cases/db95bb2b-9b3e-444b-964f-547330010a59', method: 'GET', description: 'Dados da caixa Premium Master' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testando ${endpoint.description}...`);
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.description}:`, data);
        
        // Verificar estrutura dos dados
        if (data.prizes) {
          console.log(`📋 Prêmios encontrados: ${data.prizes.length}`);
          data.prizes.forEach((prize, index) => {
            console.log(`  ${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem || false}`);
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error(`❌ ${endpoint.description}:`, response.status, errorData);
      }
    } catch (error) {
      console.error(`❌ Erro na requisição ${endpoint.description}:`, error);
    }
  }
}

// ========================================
// 2. TESTAR COMPRA E SORTEIO
// ========================================
async function debugBuyAndDraw(caseId, caseName) {
  console.log(`\n🛒 === TESTANDO COMPRA E SORTEIO DE ${caseName} ===`);
  
  try {
    // 1. Fazer compra
    console.log('1️⃣ Fazendo compra...');
    const buyResponse = await fetch(`/api/cases/${caseId}/buy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    if (!buyResponse.ok) {
      const errorData = await buyResponse.json();
      console.error('❌ Erro na compra:', errorData);
      return null;
    }
    
    const buyData = await buyResponse.json();
    console.log('✅ Compra realizada:', buyData);
    
    // 2. Fazer sorteio
    console.log('2️⃣ Fazendo sorteio...');
    const drawResponse = await fetch(`/api/cases/${caseId}/draw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!drawResponse.ok) {
      const errorData = await drawResponse.json();
      console.error('❌ Erro no sorteio:', errorData);
      return null;
    }
    
    const drawData = await drawResponse.json();
    console.log('✅ Sorteio realizado:', drawData);
    
    // 3. Verificar prêmio
    if (drawData.premio) {
      console.log('🎁 Prêmio recebido:');
      console.log('  - Nome:', drawData.premio.nome);
      console.log('  - Valor:', drawData.premio.valor);
      console.log('  - Tipo:', drawData.premio.tipo);
      console.log('  - Sem Imagem:', drawData.premio.sem_imagem);
      console.log('  - Imagem URL:', drawData.premio.imagem);
      
      // Verificar se o prêmio tem imagem
      if (drawData.premio.sem_imagem) {
        console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
      } else {
        console.log('✅ Prêmio tem imagem configurada');
      }
    }
    
    return drawData;
  } catch (error) {
    console.error('❌ Erro no processo de compra/sorteio:', error);
    return null;
  }
}

// ========================================
// 3. VERIFICAR DADOS ESTÁTICOS
// ========================================
async function debugStaticData() {
  console.log('\n📊 === VERIFICANDO DADOS ESTÁTICOS ===');
  
  const cases = [
    { id: '1abd77cf-472b-473d-9af0-6cd47f9f1452', nome: 'CAIXA FINAL DE SEMANA' },
    { id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4', nome: 'CAIXA NIKE' },
    { id: '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415', nome: 'CAIXA SAMSUNG' },
    { id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd', nome: 'CAIXA CONSOLE' },
    { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE' },
    { id: 'db95bb2b-9b3e-444b-964f-547330010a59', nome: 'CAIXA PREMIUM MASTER' }
  ];
  
  for (const caseData of cases) {
    console.log(`\n📦 ${caseData.nome}:`);
    
    try {
      const response = await fetch(`/api/cases/${caseData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados da caixa:', data);
        
        if (data.prizes) {
          console.log('📋 Prêmios estáticos:');
          data.prizes.forEach((prize, index) => {
            console.log(`  ${index + 1}. ${prize.nome} - R$ ${prize.valor} - Probabilidade: ${prize.probabilidade}`);
          });
        }
      } else {
        console.error('❌ Erro ao buscar dados da caixa:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  }
}

// ========================================
// 4. VERIFICAR SISTEMA DE PRÊMIOS CONTROLADOS
// ========================================
async function debugControlledPrizes() {
  console.log('\n🎯 === VERIFICANDO SISTEMA DE PRÊMIOS CONTROLADOS ===');
  
  // Verificar se o usuário é demo ou normal
  const userResponse = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!userResponse.ok) {
    console.error('❌ Erro ao buscar dados do usuário');
    return;
  }
  
  const userData = await userResponse.json();
  console.log('👤 Tipo de conta:', userData.tipo_conta);
  
  // Testar compras para verificar se os prêmios estão sendo controlados
  const testCases = [
    { id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd', nome: 'CAIXA CONSOLE' },
    { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE' }
  ];
  
  for (const caseData of testCases) {
    console.log(`\n🔍 Testando ${caseData.nome}...`);
    
    const results = [];
    for (let i = 0; i < 3; i++) {
      const result = await debugBuyAndDraw(caseData.id, caseData.nome);
      if (result && result.premio) {
        results.push(result.premio);
      }
      
      // Delay entre compras
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 RESUMO DAS COMPRAS DE ${caseData.nome}:`);
    results.forEach((prize, index) => {
      console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
    });
    
    // Verificar se os prêmios estão sendo controlados
    const highValuePrizes = results.filter(prize => prize.valor >= 1000);
    if (highValuePrizes.length > 0 && userData.tipo_conta === 'normal') {
      console.log('⚠️ ATENÇÃO: Conta normal recebeu prêmios de alto valor!');
    } else if (highValuePrizes.length > 0 && userData.tipo_conta === 'demo') {
      console.log('✅ Conta demo recebeu prêmios de alto valor (esperado)');
    }
  }
}

// ========================================
// 5. VERIFICAR PROBLEMAS ESPECÍFICOS
// ========================================
async function debugSpecificIssues() {
  console.log('\n🔍 === VERIFICANDO PROBLEMAS ESPECÍFICOS ===');
  
  // Verificar se há prêmios com valores altos que não têm imagem
  console.log('🎯 Testando prêmios de alto valor...');
  
  const highValueCases = [
    { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE' },
    { id: 'db95bb2b-9b3e-444b-964f-547330010a59', nome: 'CAIXA PREMIUM MASTER' }
  ];
  
  for (const caseData of highValueCases) {
    console.log(`\n🔍 Testando ${caseData.nome}...`);
    
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = await debugBuyAndDraw(caseData.id, caseData.nome);
      if (result && result.premio) {
        results.push(result.premio);
      }
      
      // Delay entre compras
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 RESUMO DAS COMPRAS DE ${caseData.nome}:`);
    results.forEach((prize, index) => {
      console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
    });
    
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
// 6. FUNÇÃO PRINCIPAL DE DEBUG DO BACKEND
// ========================================
async function runBackendDebug() {
  console.log('🔧 INICIANDO DEBUG DO BACKEND...');
  
  // 1. Verificar endpoints do backend
  await debugBackendEndpoints();
  
  // 2. Verificar dados estáticos
  await debugStaticData();
  
  // 3. Verificar sistema de prêmios controlados
  await debugControlledPrizes();
  
  // 4. Verificar problemas específicos
  await debugSpecificIssues();
  
  console.log('\n✅ DEBUG DO BACKEND FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas do backend.');
}

// ========================================
// 7. FUNÇÕES AUXILIARES
// ========================================

// Função para testar uma caixa específica
window.testCaseBackend = async function(caseId, caseName) {
  return await debugBuyAndDraw(caseId, caseName);
};

// Função para verificar endpoints
window.checkEndpoints = debugBackendEndpoints;

// Função para verificar dados estáticos
window.checkStaticData = debugStaticData;

// Função para verificar prêmios controlados
window.checkControlledPrizes = debugControlledPrizes;

// ========================================
// 8. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runBackendDebug() - Executa debug completo do backend');
console.log('- testCaseBackend(caseId, caseName) - Testa uma caixa específica');
console.log('- checkEndpoints() - Verifica endpoints do backend');
console.log('- checkStaticData() - Verifica dados estáticos');
console.log('- checkControlledPrizes() - Verifica prêmios controlados');
console.log('\n🚀 Execute runBackendDebug() para começar!');

// Executar debug automaticamente
runBackendDebug();
