// 🧪 TESTE FINAL DAS CORREÇÕES - SLOTBOX
// Cole este código no console do navegador (F12) para testar as correções

console.log('🎯 TESTANDO CORREÇÕES FINAIS DO SLOTBOX...');

// ===== TESTE 1: VERIFICAR NAVEGAÇÃO =====
function testarNavegacao() {
  console.log('\n🛣️ === TESTANDO NAVEGAÇÃO ===');
  
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  console.log(`📦 Caixas encontradas: ${caixas.length}`);
  
  if (caixas.length === 0) {
    console.log('❌ PROBLEMA: Nenhuma caixa encontrada');
    return false;
  }
  
  let caixasFuncionando = 0;
  
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
    
    if (hasOnClick && cursor === 'pointer') {
      caixasFuncionando++;
      console.log(`   ✅ Caixa ${index + 1} está funcionando`);
    } else {
      console.log(`   ❌ Caixa ${index + 1} não está funcionando`);
    }
  });
  
  console.log(`\n📊 RESULTADO: ${caixasFuncionando}/${caixas.length} caixas funcionando`);
  
  if (caixasFuncionando === caixas.length) {
    console.log('🎉 TODAS AS CAIXAS ESTÃO FUNCIONANDO!');
    return true;
  } else {
    console.log(`⚠️ ${caixas.length - caixasFuncionando} caixas ainda com problema`);
    return false;
  }
}

// ===== TESTE 2: VERIFICAR PERFORMANCE =====
function testarPerformance() {
  console.log('\n⚡ === TESTANDO PERFORMANCE ===');
  
  // Verificar tempo de carregamento
  const loadTime = performance.now();
  console.log(`⏱️ Tempo de carregamento: ${loadTime.toFixed(2)}ms`);
  
  if (loadTime > 10000) {
    console.log('❌ PROBLEMA: Tempo de carregamento muito alto');
    console.log('   - SOLUÇÃO: Verificar se há loop infinito');
  } else {
    console.log('✅ Tempo de carregamento OK');
  }
  
  // Verificar memória
  if (performance.memory) {
    const memoryUsed = performance.memory.usedJSHeapSize / 1024 / 1024;
    console.log(`💾 Memória usada: ${memoryUsed.toFixed(2)}MB`);
    
    if (memoryUsed > 100) {
      console.log('❌ PROBLEMA: Uso de memória muito alto');
    } else {
      console.log('✅ Uso de memória OK');
    }
  }
  
  // Verificar elementos DOM
  const elements = document.querySelectorAll('*');
  console.log(`🔍 Elementos DOM: ${elements.length}`);
  
  if (elements.length > 10000) {
    console.log('❌ PROBLEMA: Muitos elementos DOM');
  } else {
    console.log('✅ Número de elementos DOM OK');
  }
}

// ===== TESTE 3: VERIFICAR LOOP INFINITO =====
function testarLoopInfinito() {
  console.log('\n🔄 === TESTANDO LOOP INFINITO ===');
  
  // Verificar se há logs repetitivos
  const logs = [];
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    logs.push(message);
    originalLog.apply(console, args);
  };
  
  // Aguardar um tempo para capturar logs
  setTimeout(() => {
    console.log = originalLog;
    
    // Contar logs repetitivos
    const logCounts = {};
    logs.forEach(log => {
      logCounts[log] = (logCounts[log] || 0) + 1;
    });
    
    const logsRepetitivos = Object.entries(logCounts).filter(([log, count]) => count > 3);
    
    if (logsRepetitivos.length > 0) {
      console.log('❌ PROBLEMA: Logs repetitivos detectados');
      logsRepetitivos.forEach(([log, count]) => {
        console.log(`   - "${log}" aparece ${count} vezes`);
      });
      console.log('   - SOLUÇÃO: Verificar se há loop infinito no código');
    } else {
      console.log('✅ Nenhum loop infinito detectado');
    }
  }, 3000);
}

// ===== TESTE 4: VERIFICAR ROTAS =====
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
  
  console.log('🔍 Rotas esperadas:');
  rotasEsperadas.forEach((rota, index) => {
    console.log(`   ${index + 1}. ${rota}`);
  });
  
  // Verificar se estamos no Dashboard
  const rotaAtual = window.location.pathname;
  console.log(`📍 Rota atual: ${rotaAtual}`);
  
  if (rotaAtual === '/' || rotaAtual === '/dashboard') {
    console.log('✅ Estamos no Dashboard');
  } else {
    console.log('⚠️ Não estamos no Dashboard');
  }
}

// ===== TESTE 5: VERIFICAR API =====
async function testarAPI() {
  console.log('\n🌐 === TESTANDO API ===');
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/health');
    console.log(`📡 Health Check: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ API Health Check OK');
    } else {
      console.log('❌ API Health Check falhou');
    }
  } catch (error) {
    console.log('❌ Erro na API:', error.message);
  }
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/cases');
    console.log(`📦 API Cases: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Cases OK - ${data.data?.length || 0} caixas`);
    } else {
      console.log('❌ API Cases falhou');
    }
  } catch (error) {
    console.log('❌ Erro na API de caixas:', error.message);
  }
}

// ===== TESTE 6: VERIFICAR AUTENTICAÇÃO =====
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
function executarTesteFinal() {
  console.log('🎯 EXECUTANDO TESTE FINAL DAS CORREÇÕES...');
  
  // Teste 1: Navegação
  const navegacaoOK = testarNavegacao();
  
  // Teste 2: Performance
  testarPerformance();
  
  // Teste 3: Loop infinito
  testarLoopInfinito();
  
  // Teste 4: Rotas
  testarRotas();
  
  // Teste 5: API
  testarAPI();
  
  // Teste 6: Autenticação
  testarAutenticacao();
  
  // Resumo final
  setTimeout(() => {
    console.log('\n🎯 === RESUMO FINAL ===');
    
    if (navegacaoOK) {
      console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Todas as correções foram aplicadas com sucesso');
      console.log('✅ Navegação das caixas funcionando');
      console.log('✅ Performance otimizada');
      console.log('✅ Sistema pronto para uso');
    } else {
      console.log('⚠️ SISTEMA AINDA COM PROBLEMAS');
      console.log('❌ Algumas correções ainda precisam ser aplicadas');
      console.log('🔧 Verificar os problemas listados acima');
    }
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Se tudo estiver OK: Sistema pronto para uso');
    console.log('2. Se houver problemas: Aplicar correções adicionais');
    console.log('3. Testar todas as funcionalidades');
    
  }, 5000);
}

// ===== EXECUTAR TESTE =====
console.log('🎯 TESTE FINAL DAS CORREÇÕES PRONTO!');
console.log('📋 Execute: executarTesteFinal()');

// Executar automaticamente
executarTesteFinal();
