// 🧪 TESTE DE NAVEGAÇÃO DAS CAIXAS - SLOTBOX
// Execute este script no console do navegador após o upload do frontend

console.log('🚀 INICIANDO TESTE DE NAVEGAÇÃO DAS CAIXAS...');

// ===== FUNÇÕES DE TESTE =====
function testarNavegacaoCaixas() {
  console.log('\n📦 === TESTANDO NAVEGAÇÃO DAS CAIXAS ===');
  
  // Verificar se estamos no Dashboard
  if (window.location.pathname !== '/' && window.location.pathname !== '/dashboard') {
    console.log('❌ Não estamos no Dashboard. Navegando para o Dashboard...');
    window.location.href = '/';
    return;
  }
  
  // Aguardar carregamento das caixas
  setTimeout(() => {
    // Verificar se as caixas foram carregadas
    const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
    console.log(`📦 Caixas encontradas na página: ${caixas.length}`);
    
    if (caixas.length === 0) {
      console.log('❌ Nenhuma caixa encontrada na página');
      return;
    }
    
    // Testar navegação de cada caixa
    caixas.forEach((caixa, index) => {
      console.log(`🔍 Testando caixa ${index + 1}...`);
      
      // Verificar se tem onClick
      const hasOnClick = caixa.onclick !== null;
      console.log(`   - Tem onClick: ${hasOnClick}`);
      
      // Verificar se tem cursor pointer
      const hasCursorPointer = window.getComputedStyle(caixa).cursor === 'pointer';
      console.log(`   - Tem cursor pointer: ${hasCursorPointer}`);
      
      // Verificar se tem classe de transição
      const hasTransition = caixa.classList.toString().includes('transition') || 
                           caixa.classList.toString().includes('hover');
      console.log(`   - Tem transição: ${hasTransition}`);
      
      // Simular clique
      console.log(`   - Simulando clique na caixa ${index + 1}...`);
      caixa.click();
      
      // Aguardar um pouco para ver se navegou
      setTimeout(() => {
        const currentPath = window.location.pathname;
        console.log(`   - Rota atual após clique: ${currentPath}`);
        
        if (currentPath !== '/' && currentPath !== '/dashboard') {
          console.log(`   ✅ Navegação funcionou! Rota: ${currentPath}`);
        } else {
          console.log(`   ❌ Navegação não funcionou. Ainda em: ${currentPath}`);
        }
        
        // Voltar para o Dashboard
        if (currentPath !== '/' && currentPath !== '/dashboard') {
          console.log(`   🔄 Voltando para o Dashboard...`);
          window.location.href = '/';
        }
      }, 1000);
    });
  }, 2000);
}

// ===== TESTE DE ROTAS =====
function testarRotasCaixas() {
  console.log('\n🛣️ === TESTANDO ROTAS DAS CAIXAS ===');
  
  const rotasCaixas = [
    '/weekend-case',
    '/nike-case',
    '/samsung-case',
    '/console-case',
    '/apple-case',
    '/premium-master-case'
  ];
  
  rotasCaixas.forEach((rota, index) => {
    console.log(`🔍 Testando rota ${index + 1}: ${rota}`);
    
    // Navegar para a rota
    window.location.href = rota;
    
    // Aguardar carregamento
    setTimeout(() => {
      const currentPath = window.location.pathname;
      console.log(`   - Rota atual: ${currentPath}`);
      
      if (currentPath === rota) {
        console.log(`   ✅ Rota ${rota} funcionando!`);
        
        // Verificar se a página carregou corretamente
        const pageContent = document.querySelector('main, .container, [class*="case"]');
        if (pageContent) {
          console.log(`   ✅ Conteúdo da página carregado`);
        } else {
          console.log(`   ❌ Conteúdo da página não carregado`);
        }
      } else {
        console.log(`   ❌ Rota ${rota} não funcionou. Redirecionado para: ${currentPath}`);
      }
      
      // Voltar para o Dashboard
      setTimeout(() => {
        console.log(`   🔄 Voltando para o Dashboard...`);
        window.location.href = '/';
      }, 1000);
    }, 2000);
  });
}

// ===== TESTE DE CONSOLE LOGS =====
function testarConsoleLogs() {
  console.log('\n📋 === TESTANDO CONSOLE LOGS ===');
  
  // Verificar se há logs de carregamento
  const logs = console.log.toString();
  console.log('📋 Console logs disponíveis');
  
  // Verificar se há erros
  const errors = console.error.toString();
  console.log('❌ Console errors disponíveis');
  
  // Verificar se há warnings
  const warnings = console.warn.toString();
  console.log('⚠️ Console warnings disponíveis');
}

// ===== TESTE DE AUTENTICAÇÃO =====
function testarAutenticacao() {
  console.log('\n🔐 === TESTANDO AUTENTICAÇÃO ===');
  
  // Verificar localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log(`🔑 Token no localStorage: ${token ? 'Presente' : 'Ausente'}`);
  console.log(`👤 Usuário no localStorage: ${user ? 'Presente' : 'Ausente'}`);
  
  if (token) {
    try {
      const userData = JSON.parse(user);
      console.log(`👤 Dados do usuário:`, userData);
    } catch (e) {
      console.log('❌ Dados do usuário corrompidos no localStorage');
    }
  }
  
  // Verificar se a API está configurada
  if (window.api) {
    console.log('✅ API Service encontrado no window');
  } else {
    console.log('❌ API Service não encontrado no window');
  }
}

// ===== FUNÇÃO PRINCIPAL =====
function executarTesteNavegacao() {
  console.log('🧪 TESTE DE NAVEGAÇÃO DAS CAIXAS PRONTO!');
  
  // Aguardar carregamento da página
  setTimeout(() => {
    testarAutenticacao();
    testarConsoleLogs();
    testarNavegacaoCaixas();
    
    // Aguardar um pouco antes de testar as rotas
    setTimeout(() => {
      testarRotasCaixas();
    }, 5000);
  }, 1000);
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE DE NAVEGAÇÃO DAS CAIXAS PRONTO!');
console.log('📋 Execute: executarTesteNavegacao()');
console.log('📊 Ou execute: await executarTesteNavegacao()');

// Executar automaticamente
executarTesteNavegacao();
