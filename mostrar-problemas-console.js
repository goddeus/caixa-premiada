// 🚨 MOSTRAR TODOS OS PROBLEMAS - SLOTBOX
// Cole este código no console do navegador (F12) para ver exatamente o que está errado

console.log('🚨 INICIANDO ANÁLISE DE PROBLEMAS DO SLOTBOX...');

// ===== ANÁLISE 1: PROBLEMAS DE NAVEGAÇÃO =====
function analisarProblemasNavegacao() {
  console.log('\n🚨 === PROBLEMAS DE NAVEGAÇÃO ===');
  
  const problemas = [];
  
  // Verificar se estamos no Dashboard
  if (window.location.pathname !== '/' && window.location.pathname !== '/dashboard') {
    problemas.push('❌ PROBLEMA: Não estamos no Dashboard');
    problemas.push(`   - Rota atual: ${window.location.pathname}`);
    problemas.push('   - SOLUÇÃO: Navegar para / ou /dashboard');
  }
  
  // Verificar se as caixas têm onClick
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  if (caixas.length === 0) {
    problemas.push('❌ PROBLEMA: Nenhuma caixa encontrada na página');
    problemas.push('   - SOLUÇÃO: Verificar se as caixas estão sendo renderizadas');
  } else {
    caixas.forEach((caixa, index) => {
      if (!caixa.onclick) {
        problemas.push(`❌ PROBLEMA: Caixa ${index + 1} não tem onClick`);
        problemas.push('   - SOLUÇÃO: Adicionar onClick à caixa');
      }
      
      const cursor = window.getComputedStyle(caixa).cursor;
      if (cursor !== 'pointer') {
        problemas.push(`❌ PROBLEMA: Caixa ${index + 1} não tem cursor pointer`);
        problemas.push('   - SOLUÇÃO: Adicionar cursor: pointer ao CSS');
      }
    });
  }
  
  return problemas;
}

// ===== ANÁLISE 2: PROBLEMAS DE CONECTIVIDADE =====
async function analisarProblemasConectividade() {
  console.log('\n🚨 === PROBLEMAS DE CONECTIVIDADE ===');
  
  const problemas = [];
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/health');
    if (!response.ok) {
      problemas.push('❌ PROBLEMA: API Health Check falhou');
      problemas.push(`   - Status: ${response.status} ${response.statusText}`);
      problemas.push('   - SOLUÇÃO: Verificar se o backend está online');
    }
  } catch (error) {
    problemas.push('❌ PROBLEMA: Erro de conectividade com a API');
    problemas.push(`   - Erro: ${error.message}`);
    problemas.push('   - SOLUÇÃO: Verificar conexão com a internet');
  }
  
  try {
    const response = await fetch('https://slotbox-api.onrender.com/api/cases');
    if (!response.ok) {
      problemas.push('❌ PROBLEMA: API de caixas falhou');
      problemas.push(`   - Status: ${response.status} ${response.statusText}`);
      problemas.push('   - SOLUÇÃO: Verificar se o backend está funcionando');
    }
  } catch (error) {
    problemas.push('❌ PROBLEMA: Erro ao carregar caixas');
    problemas.push(`   - Erro: ${error.message}`);
    problemas.push('   - SOLUÇÃO: Verificar API de caixas');
  }
  
  return problemas;
}

// ===== ANÁLISE 3: PROBLEMAS DE AUTENTICAÇÃO =====
function analisarProblemasAutenticacao() {
  console.log('\n🚨 === PROBLEMAS DE AUTENTICAÇÃO ===');
  
  const problemas = [];
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token) {
    problemas.push('❌ PROBLEMA: Token não encontrado no localStorage');
    problemas.push('   - SOLUÇÃO: Fazer login novamente');
  } else {
    try {
      const userData = JSON.parse(user);
      if (!userData.id) {
        problemas.push('❌ PROBLEMA: Dados do usuário incompletos');
        problemas.push('   - SOLUÇÃO: Fazer login novamente');
      }
    } catch (e) {
      problemas.push('❌ PROBLEMA: Dados do usuário corrompidos');
      problemas.push('   - SOLUÇÃO: Limpar localStorage e fazer login novamente');
    }
  }
  
  return problemas;
}

// ===== ANÁLISE 4: PROBLEMAS DE FRONTEND =====
function analisarProblemasFrontend() {
  console.log('\n🚨 === PROBLEMAS DE FRONTEND ===');
  
  const problemas = [];
  
  // Verificar se está no domínio correto
  if (window.location.hostname !== 'slotbox.shop') {
    problemas.push('❌ PROBLEMA: Domínio incorreto');
    problemas.push(`   - Domínio atual: ${window.location.hostname}`);
    problemas.push('   - Domínio esperado: slotbox.shop');
    problemas.push('   - SOLUÇÃO: Acessar https://slotbox.shop');
  }
  
  // Verificar se as imagens estão carregando
  const imagens = document.querySelectorAll('img');
  let imagensComErro = 0;
  
  imagens.forEach(img => {
    if (img.complete && img.naturalHeight === 0) {
      imagensComErro++;
    }
  });
  
  if (imagensComErro > 0) {
    problemas.push(`❌ PROBLEMA: ${imagensComErro} imagens com erro de carregamento`);
    problemas.push('   - SOLUÇÃO: Verificar se as imagens existem no servidor');
  }
  
  // Verificar se há erros no console
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
      problemas.push(`❌ PROBLEMA: ${errors.length} erros no console`);
      errors.forEach(error => {
        problemas.push(`   - Erro: ${error}`);
      });
      problemas.push('   - SOLUÇÃO: Verificar código JavaScript');
    }
  }, 1000);
  
  return problemas;
}

// ===== ANÁLISE 5: PROBLEMAS DE PERFORMANCE =====
function analisarProblemasPerformance() {
  console.log('\n🚨 === PROBLEMAS DE PERFORMANCE ===');
  
  const problemas = [];
  
  // Verificar tempo de carregamento
  const loadTime = performance.now();
  if (loadTime > 5000) {
    problemas.push('❌ PROBLEMA: Tempo de carregamento muito alto');
    problemas.push(`   - Tempo: ${loadTime.toFixed(2)}ms`);
    problemas.push('   - SOLUÇÃO: Otimizar carregamento de recursos');
  }
  
  // Verificar memória
  if (performance.memory) {
    const memoryUsed = performance.memory.usedJSHeapSize / 1024 / 1024;
    if (memoryUsed > 100) {
      problemas.push('❌ PROBLEMA: Uso de memória muito alto');
      problemas.push(`   - Memória: ${memoryUsed.toFixed(2)}MB`);
      problemas.push('   - SOLUÇÃO: Verificar vazamentos de memória');
    }
  }
  
  // Verificar elementos DOM
  const elements = document.querySelectorAll('*');
  if (elements.length > 10000) {
    problemas.push('❌ PROBLEMA: Muitos elementos DOM');
    problemas.push(`   - Elementos: ${elements.length}`);
    problemas.push('   - SOLUÇÃO: Otimizar renderização');
  }
  
  return problemas;
}

// ===== ANÁLISE 6: PROBLEMAS DE SISTEMA =====
function analisarProblemasSistema() {
  console.log('\n🚨 === PROBLEMAS DE SISTEMA ===');
  
  const problemas = [];
  
  // Verificar se a API está configurada
  if (!window.api) {
    problemas.push('❌ PROBLEMA: API Service não encontrado');
    problemas.push('   - SOLUÇÃO: Verificar se o arquivo api.js está carregado');
  }
  
  // Verificar se React Router está funcionando
  if (!window.ReactRouterDOM) {
    problemas.push('❌ PROBLEMA: React Router DOM não encontrado');
    problemas.push('   - SOLUÇÃO: Verificar se o React Router está instalado');
  }
  
  // Verificar se há erros de JavaScript
  const jsErrors = [];
  window.addEventListener('error', (e) => {
    jsErrors.push(e.message);
  });
  
  setTimeout(() => {
    if (jsErrors.length > 0) {
      problemas.push(`❌ PROBLEMA: ${jsErrors.length} erros de JavaScript`);
      jsErrors.forEach(error => {
        problemas.push(`   - Erro: ${error}`);
      });
      problemas.push('   - SOLUÇÃO: Verificar código JavaScript');
    }
  }, 1000);
  
  return problemas;
}

// ===== FUNÇÃO PRINCIPAL =====
async function mostrarTodosOsProblemas() {
  console.log('🚨 ANALISANDO TODOS OS PROBLEMAS DO SLOTBOX...');
  
  const todosOsProblemas = [];
  
  // Análise 1: Navegação
  const problemasNavegacao = analisarProblemasNavegacao();
  todosOsProblemas.push(...problemasNavegacao);
  
  // Análise 2: Conectividade
  const problemasConectividade = await analisarProblemasConectividade();
  todosOsProblemas.push(...problemasConectividade);
  
  // Análise 3: Autenticação
  const problemasAutenticacao = analisarProblemasAutenticacao();
  todosOsProblemas.push(...problemasAutenticacao);
  
  // Análise 4: Frontend
  const problemasFrontend = analisarProblemasFrontend();
  todosOsProblemas.push(...problemasFrontend);
  
  // Análise 5: Performance
  const problemasPerformance = analisarProblemasPerformance();
  todosOsProblemas.push(...problemasPerformance);
  
  // Análise 6: Sistema
  const problemasSistema = analisarProblemasSistema();
  todosOsProblemas.push(...problemasSistema);
  
  // Aguardar um pouco para capturar erros
  setTimeout(() => {
    console.log('\n🎯 === RESUMO DE TODOS OS PROBLEMAS ===');
    
    if (todosOsProblemas.length === 0) {
      console.log('🎉 NENHUM PROBLEMA ENCONTRADO!');
      console.log('✅ O sistema está funcionando perfeitamente!');
    } else {
      console.log(`🚨 ${todosOsProblemas.length} PROBLEMAS ENCONTRADOS:`);
      console.log('\n📋 LISTA COMPLETA DE PROBLEMAS:');
      
      todosOsProblemas.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema}`);
      });
      
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Corrigir os problemas listados acima');
      console.log('2. Testar cada correção individualmente');
      console.log('3. Executar este script novamente para verificar');
    }
    
    // Salvar problemas para análise
    window.todosOsProblemas = todosOsProblemas;
    console.log('\n💾 Problemas salvos em window.todosOsProblemas');
    
  }, 2000);
}

// ===== EXECUTAR ANÁLISE =====
console.log('🚨 ANÁLISE DE PROBLEMAS DO SLOTBOX PRONTA!');
console.log('📋 Execute: mostrarTodosOsProblemas()');

// Executar automaticamente
mostrarTodosOsProblemas();
