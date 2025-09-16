// 🔧 DEBUG RÁPIDO - SLOTBOX
// Cole este código no console do navegador (F12) para debug rápido

console.log('🔧 INICIANDO DEBUG RÁPIDO DO SLOTBOX...');

// ===== DEBUG 1: VERIFICAR ESTADO ATUAL =====
function debugEstadoAtual() {
  console.log('\n📋 === ESTADO ATUAL ===');
  
  console.log('🌐 URL:', window.location.href);
  console.log('🛣️ Rota:', window.location.pathname);
  console.log('🔑 Token:', localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente');
  console.log('👤 Usuário:', localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente');
  
  if (localStorage.getItem('token')) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('👤 Dados do usuário:', user);
    } catch (e) {
      console.log('❌ Dados do usuário corrompidos');
    }
  }
}

// ===== DEBUG 2: VERIFICAR CAIXAS =====
function debugCaixas() {
  console.log('\n📦 === DEBUG DAS CAIXAS ===');
  
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  console.log(`📦 Caixas encontradas: ${caixas.length}`);
  
  if (caixas.length > 0) {
    caixas.forEach((caixa, index) => {
      console.log(`\n🔍 Caixa ${index + 1}:`);
      console.log('   - Elemento:', caixa);
      console.log('   - Classes:', caixa.className);
      console.log('   - onClick:', caixa.onclick ? '✅ Presente' : '❌ Ausente');
      console.log('   - Cursor:', window.getComputedStyle(caixa).cursor);
      console.log('   - Display:', window.getComputedStyle(caixa).display);
      console.log('   - Visibility:', window.getComputedStyle(caixa).visibility);
      
      // Verificar se tem imagem
      const img = caixa.querySelector('img');
      if (img) {
        console.log('   - Imagem:', img.src);
        console.log('   - Imagem carregada:', img.complete && img.naturalHeight !== 0);
      } else {
        console.log('   - Imagem: ❌ Não encontrada');
      }
    });
  } else {
    console.log('❌ Nenhuma caixa encontrada na página');
  }
}

// ===== DEBUG 3: VERIFICAR NAVEGAÇÃO =====
function debugNavegacao() {
  console.log('\n🛣️ === DEBUG DE NAVEGAÇÃO ===');
  
  // Verificar se React Router está funcionando
  if (window.ReactRouterDOM) {
    console.log('✅ React Router DOM encontrado');
  } else {
    console.log('❌ React Router DOM não encontrado');
  }
  
  // Verificar se useNavigate está disponível
  if (window.navigate) {
    console.log('✅ Função navigate encontrada');
  } else {
    console.log('❌ Função navigate não encontrada');
  }
  
  // Verificar se há erros de navegação
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Restaurar após um tempo
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ Nenhum erro de navegação encontrado');
    }
  }, 1000);
}

// ===== DEBUG 4: VERIFICAR API =====
async function debugAPI() {
  console.log('\n🌐 === DEBUG DA API ===');
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/health');
    console.log('✅ API Health Check:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dados da API:', data);
    }
  } catch (error) {
    console.log('❌ Erro na API:', error.message);
  }
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/cases');
    console.log('✅ API Cases:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Caixas da API:', data);
    }
  } catch (error) {
    console.log('❌ Erro na API de caixas:', error.message);
  }
}

// ===== DEBUG 5: VERIFICAR CONSOLE LOGS =====
function debugConsoleLogs() {
  console.log('\n📋 === DEBUG DE CONSOLE LOGS ===');
  
  // Verificar se há logs de carregamento
  const logs = [];
  const originalLog = console.log;
  console.log = function(...args) {
    logs.push(args.join(' '));
    originalLog.apply(console, args);
  };
  
  // Restaurar após um tempo
  setTimeout(() => {
    console.log = originalLog;
    if (logs.length > 0) {
      console.log('📋 Logs encontrados:');
      logs.forEach(log => console.log(`   - ${log}`));
    } else {
      console.log('✅ Nenhum log encontrado');
    }
  }, 1000);
}

// ===== DEBUG 6: VERIFICAR ERROS =====
function debugErros() {
  console.log('\n❌ === DEBUG DE ERROS ===');
  
  // Verificar se há erros no console
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Verificar se há warnings no console
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = function(...args) {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };
  
  // Restaurar após um tempo
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ Nenhum erro encontrado');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ Warnings encontrados:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    } else {
      console.log('✅ Nenhum warning encontrado');
    }
  }, 1000);
}

// ===== DEBUG 7: VERIFICAR PERFORMANCE =====
function debugPerformance() {
  console.log('\n⚡ === DEBUG DE PERFORMANCE ===');
  
  // Verificar tempo de carregamento
  const loadTime = performance.now();
  console.log(`⏱️ Tempo de carregamento: ${loadTime.toFixed(2)}ms`);
  
  // Verificar memória
  if (performance.memory) {
    console.log('💾 Memória usada:', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('💾 Memória total:', (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
  }
  
  // Verificar se há vazamentos de memória
  const elements = document.querySelectorAll('*');
  console.log(`🔍 Elementos DOM: ${elements.length}`);
  
  // Verificar se há event listeners
  const eventListeners = [];
  elements.forEach(element => {
    if (element.onclick) {
      eventListeners.push('onclick');
    }
    if (element.onmouseover) {
      eventListeners.push('onmouseover');
    }
    if (element.onmouseout) {
      eventListeners.push('onmouseout');
    }
  });
  
  console.log(`🎯 Event listeners encontrados: ${eventListeners.length}`);
}

// ===== FUNÇÃO PRINCIPAL =====
function executarDebugRapido() {
  console.log('🔧 EXECUTANDO DEBUG RÁPIDO...');
  
  debugEstadoAtual();
  debugCaixas();
  debugNavegacao();
  debugAPI();
  debugConsoleLogs();
  debugErros();
  debugPerformance();
  
  console.log('\n🎯 DEBUG RÁPIDO CONCLUÍDO!');
  console.log('📋 Verifique os resultados acima para identificar problemas');
}

// ===== EXECUTAR DEBUG =====
console.log('🔧 DEBUG RÁPIDO DO SLOTBOX PRONTO!');
console.log('📋 Execute: executarDebugRapido()');

// Executar automaticamente
executarDebugRapido();
