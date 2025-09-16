// 🧪 TESTE ESPECÍFICO DE NAVEGAÇÃO DAS CAIXAS - SLOTBOX
// Cole este código no console do navegador (F12) para testar a navegação

console.log('🎯 TESTANDO NAVEGAÇÃO DAS CAIXAS...');

// ===== TESTE 1: VERIFICAR CAIXAS =====
function testarCaixas() {
  console.log('\n📦 === VERIFICANDO CAIXAS ===');
  
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  console.log(`📦 Caixas encontradas: ${caixas.length}`);
  
  if (caixas.length === 0) {
    console.log('❌ PROBLEMA: Nenhuma caixa encontrada');
    return false;
  }
  
  let caixasComProblema = 0;
  
  caixas.forEach((caixa, index) => {
    console.log(`\n🔍 Caixa ${index + 1}:`);
    
    // Verificar onClick
    const hasOnClick = caixa.onclick !== null;
    console.log(`   - onClick: ${hasOnClick ? '✅' : '❌'}`);
    
    // Verificar cursor
    const cursor = window.getComputedStyle(caixa).cursor;
    console.log(`   - cursor: ${cursor} ${cursor === 'pointer' ? '✅' : '❌'}`);
    
    // Verificar se tem classe cursor-pointer
    const hasCursorClass = caixa.classList.contains('cursor-pointer');
    console.log(`   - classe cursor-pointer: ${hasCursorClass ? '✅' : '❌'}`);
    
    // Verificar se tem transição
    const hasTransition = caixa.classList.toString().includes('transition');
    console.log(`   - transição: ${hasTransition ? '✅' : '❌'}`);
    
    // Verificar se tem hover
    const hasHover = caixa.classList.toString().includes('hover');
    console.log(`   - hover: ${hasHover ? '✅' : '❌'}`);
    
    if (!hasOnClick || cursor !== 'pointer') {
      caixasComProblema++;
      console.log(`   ❌ PROBLEMA: Caixa ${index + 1} não está clicável`);
    } else {
      console.log(`   ✅ Caixa ${index + 1} está funcionando`);
    }
  });
  
  if (caixasComProblema === 0) {
    console.log('\n✅ TODAS AS CAIXAS ESTÃO FUNCIONANDO!');
    return true;
  } else {
    console.log(`\n❌ ${caixasComProblema} CAIXAS COM PROBLEMA`);
    return false;
  }
}

// ===== TESTE 2: TESTAR CLIQUE MANUAL =====
function testarCliqueManual() {
  console.log('\n🖱️ === TESTANDO CLIQUE MANUAL ===');
  
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  
  if (caixas.length === 0) {
    console.log('❌ Nenhuma caixa para testar');
    return;
  }
  
  // Testar primeira caixa
  const primeiraCaixa = caixas[0];
  console.log('🎯 Testando clique na primeira caixa...');
  
  // Simular clique
  const evento = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  primeiraCaixa.dispatchEvent(evento);
  
  // Aguardar um pouco para ver se navegou
  setTimeout(() => {
    const rotaAtual = window.location.pathname;
    console.log(`📍 Rota atual após clique: ${rotaAtual}`);
    
    if (rotaAtual !== '/' && rotaAtual !== '/dashboard') {
      console.log('✅ NAVEGAÇÃO FUNCIONOU!');
      console.log('🔄 Voltando para o Dashboard...');
      window.location.href = '/';
    } else {
      console.log('❌ NAVEGAÇÃO NÃO FUNCIONOU');
    }
  }, 1000);
}

// ===== TESTE 3: VERIFICAR ROTAS =====
function testarRotas() {
  console.log('\n🛣️ === TESTANDO ROTAS ===');
  
  const rotasEsperadas = [
    '/weekend-case',
    '/nike-case',
    '/samsung-case',
    '/console-case',
    '/apple-case',
    '/premium-master-case'
  ];
  
  rotasEsperadas.forEach((rota, index) => {
    console.log(`🔍 Testando rota ${index + 1}: ${rota}`);
    
    // Navegar para a rota
    window.location.href = rota;
    
    // Aguardar carregamento
    setTimeout(() => {
      const rotaAtual = window.location.pathname;
      console.log(`   - Rota atual: ${rotaAtual}`);
      
      if (rotaAtual === rota) {
        console.log(`   ✅ Rota ${rota} funcionando!`);
      } else {
        console.log(`   ❌ Rota ${rota} não funcionou`);
      }
      
      // Voltar para o Dashboard
      setTimeout(() => {
        console.log(`   🔄 Voltando para o Dashboard...`);
        window.location.href = '/';
      }, 1000);
    }, 2000);
  });
}

// ===== TESTE 4: VERIFICAR API =====
async function testarAPI() {
  console.log('\n🌐 === TESTANDO API ===');
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/cases');
    console.log(`📡 Status da API: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando');
      console.log(`📦 ${data.data?.length || 0} caixas na API`);
      
      // Verificar se as caixas têm rotas
      if (data.data && data.data.length > 0) {
        data.data.forEach((caixa, index) => {
          console.log(`   - Caixa ${index + 1}: ${caixa.nome} (ID: ${caixa.id})`);
        });
      }
    } else {
      console.log('❌ API com problema');
    }
  } catch (error) {
    console.log('❌ Erro na API:', error.message);
  }
}

// ===== TESTE 5: VERIFICAR AUTENTICAÇÃO =====
function testarAutenticacao() {
  console.log('\n🔐 === TESTANDO AUTENTICAÇÃO ===');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log(`🔑 Token: ${token ? '✅ Presente' : '❌ Ausente'}`);
  console.log(`👤 Usuário: ${user ? '✅ Presente' : '❌ Ausente'}`);
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      console.log('✅ Dados do usuário válidos');
      console.log(`   - Nome: ${userData.nome}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Saldo: R$ ${userData.saldo_reais || 0}`);
    } catch (e) {
      console.log('❌ Dados do usuário corrompidos');
    }
  }
}

// ===== FUNÇÃO PRINCIPAL =====
function executarTesteNavegacao() {
  console.log('🎯 EXECUTANDO TESTE DE NAVEGAÇÃO DAS CAIXAS...');
  
  // Teste 1: Verificar caixas
  const caixasOK = testarCaixas();
  
  // Teste 2: Verificar autenticação
  testarAutenticacao();
  
  // Teste 3: Verificar API
  testarAPI();
  
  // Teste 4: Testar clique manual (apenas se as caixas estão OK)
  if (caixasOK) {
    setTimeout(() => {
      testarCliqueManual();
    }, 2000);
  }
  
  // Teste 5: Testar rotas (apenas se as caixas estão OK)
  if (caixasOK) {
    setTimeout(() => {
      testarRotas();
    }, 5000);
  }
  
  console.log('\n🎯 TESTE CONCLUÍDO!');
  console.log('📋 Verifique os resultados acima');
}

// ===== EXECUTAR TESTE =====
console.log('🎯 TESTE DE NAVEGAÇÃO DAS CAIXAS PRONTO!');
console.log('📋 Execute: executarTesteNavegacao()');

// Executar automaticamente
executarTesteNavegacao();
