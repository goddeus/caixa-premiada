// 🔍 ANÁLISE SIMPLES DO SISTEMA DE COMPRA - SLOTBOX
// Cole este código no console do navegador (F12) para analisar o sistema atual

console.log('🔍 INICIANDO ANÁLISE SIMPLES DO SISTEMA DE COMPRA...');

// ===== ANÁLISE 1: VERIFICAR ESTADO ATUAL =====
function verificarEstadoAtual() {
  console.log('\n📋 === ESTADO ATUAL ===');
  
  // Verificar rota atual
  const rotaAtual = window.location.pathname;
  console.log(`📍 Rota atual: ${rotaAtual}`);
  
  // Verificar se estamos no dashboard
  if (rotaAtual === '/' || rotaAtual === '/dashboard') {
    console.log('✅ Estamos no Dashboard');
    console.log('💡 Para analisar o sistema de compra, navegue para uma página de caixa');
    console.log('   Exemplo: /weekend-case, /nike-case, /samsung-case');
    return false;
  } else if (rotaAtual.includes('case')) {
    console.log('✅ Estamos em uma página de caixa');
    return true;
  } else {
    console.log('⚠️ Rota não reconhecida');
    return false;
  }
}

// ===== ANÁLISE 2: VERIFICAR ELEMENTOS DA PÁGINA =====
function verificarElementosPagina() {
  console.log('\n🔍 === ELEMENTOS DA PÁGINA ===');
  
  // Verificar botões
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  console.log(`🔘 Total de botões: ${botoes.length}`);
  
  let botaoAbrirCaixa = null;
  botoes.forEach((botao, index) => {
    const texto = botao.textContent?.toLowerCase().trim() || '';
    console.log(`   Botão ${index + 1}: "${texto}"`);
    
    if (texto.includes('abrir') || texto.includes('open')) {
      botaoAbrirCaixa = botao;
      console.log(`   ✅ Botão "Abrir Caixa" encontrado!`);
    }
  });
  
  // Verificar preços
  const elementosPreco = document.querySelectorAll('*');
  let precoCaixa = null;
  elementosPreco.forEach(elemento => {
    const texto = elemento.textContent?.trim() || '';
    if (texto.match(/R\$\s*\d+/) && !texto.includes('saldo')) {
      precoCaixa = texto;
      console.log(`💰 Preço encontrado: ${texto}`);
    }
  });
  
  // Verificar saldo
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log(`💳 Saldo do usuário: R$ ${userData.saldo_reais || 0}`);
    } catch (e) {
      console.log('❌ Erro ao ler dados do usuário');
    }
  }
  
  return {
    botaoAbrirCaixa,
    precoCaixa,
    totalBotoes: botoes.length
  };
}

// ===== ANÁLISE 3: VERIFICAR FUNÇÕES DE COMPRA =====
function verificarFuncoesCompra() {
  console.log('\n🛒 === FUNÇÕES DE COMPRA ===');
  
  // Verificar se há API disponível
  if (window.api) {
    console.log('✅ API Service encontrado no window');
  } else {
    console.log('❌ API Service não encontrado no window');
  }
  
  // Verificar funções relacionadas a compra
  const funcoesCompra = [];
  Object.keys(window).forEach(key => {
    if (key.toLowerCase().includes('buy') || 
        key.toLowerCase().includes('purchase') || 
        key.toLowerCase().includes('open') || 
        key.toLowerCase().includes('abrir')) {
      funcoesCompra.push(key);
    }
  });
  
  console.log(`🔧 Funções de compra encontradas: ${funcoesCompra.length}`);
  funcoesCompra.forEach(funcao => {
    console.log(`   - ${funcao}`);
  });
  
  return funcoesCompra;
}

// ===== ANÁLISE 4: VERIFICAR SISTEMA DE SALDO =====
function verificarSistemaSaldo() {
  console.log('\n💳 === SISTEMA DE SALDO ===');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log(`🔑 Token: ${token ? '✅ Presente' : '❌ Ausente'}`);
  console.log(`👤 Usuário: ${user ? '✅ Presente' : '❌ Ausente'}`);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('👤 Dados do usuário:');
      console.log(`   - Nome: ${userData.nome}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Saldo: R$ ${userData.saldo_reais || 0}`);
      console.log(`   - ID: ${userData.id}`);
      
      return userData;
    } catch (e) {
      console.log('❌ Dados do usuário corrompidos');
      return null;
    }
  }
  
  return null;
}

// ===== ANÁLISE 5: VERIFICAR API DE COMPRA =====
async function verificarAPICompra() {
  console.log('\n🌐 === API DE COMPRA ===');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Token não encontrado - pulando verificação da API');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Testar endpoints
  const endpoints = [
    { endpoint: '/api/wallet/', name: 'Wallet/Saldo' },
    { endpoint: '/api/transactions', name: 'Transações' },
    { endpoint: '/api/cases', name: 'Caixas' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://slotbox-api.onrender.com${endpoint.endpoint}`, {
        headers: headers
      });
      
      console.log(`📡 ${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.name} funcionando`);
        
        if (endpoint.name === 'Wallet/Saldo') {
          console.log(`   💰 Saldo atual: R$ ${data.saldo_reais || 0}`);
        } else if (endpoint.name === 'Transações') {
          console.log(`   📊 Transações: ${data.length || 0} encontradas`);
        } else if (endpoint.name === 'Caixas') {
          console.log(`   📦 Caixas: ${data.data?.length || 0} encontradas`);
        }
      } else {
        console.log(`   ❌ ${endpoint.name} falhou`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao testar ${endpoint.name}: ${error.message}`);
    }
  }
}

// ===== ANÁLISE 6: VERIFICAR SISTEMA DE PRÊMIOS =====
function verificarSistemaPremios() {
  console.log('\n🎁 === SISTEMA DE PRÊMIOS ===');
  
  // Verificar elementos de prêmio
  const elementosPremio = document.querySelectorAll('[class*="premio"], [class*="prize"], [class*="reward"], [class*="item"]');
  console.log(`🎁 Elementos de prêmio encontrados: ${elementosPremio.length}`);
  
  elementosPremio.forEach((elemento, index) => {
    const texto = elemento.textContent?.trim() || '';
    console.log(`   Prêmio ${index + 1}: "${texto}"`);
  });
  
  // Verificar imagens de prêmios
  const imagensPremio = document.querySelectorAll('img[src*="premio"], img[src*="prize"], img[src*="item"]');
  console.log(`🖼️ Imagens de prêmio encontradas: ${imagensPremio.length}`);
  
  return {
    elementosPremio: elementosPremio.length,
    imagensPremio: imagensPremio.length
  };
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarAnaliseSimples() {
  console.log('🔍 EXECUTANDO ANÁLISE SIMPLES DO SISTEMA DE COMPRA...');
  
  try {
    // Análise 1: Estado atual
    const estaEmPaginaCaixa = verificarEstadoAtual();
    
    // Análise 2: Elementos da página
    const elementos = verificarElementosPagina();
    
    // Análise 3: Funções de compra
    const funcoes = verificarFuncoesCompra();
    
    // Análise 4: Sistema de saldo
    const saldo = verificarSistemaSaldo();
    
    // Análise 5: API de compra
    await verificarAPICompra();
    
    // Análise 6: Sistema de prêmios
    const premios = verificarSistemaPremios();
    
    // Resumo final
    setTimeout(() => {
      console.log('\n🎯 === RESUMO DA ANÁLISE ===');
      
      console.log('📊 INFORMAÇÕES COLETADAS:');
      console.log(`   - Rota atual: ${window.location.pathname}`);
      console.log(`   - Em página de caixa: ${estaEmPaginaCaixa ? '✅' : '❌'}`);
      console.log(`   - Botões encontrados: ${elementos.totalBotoes}`);
      console.log(`   - Botão "Abrir Caixa": ${elementos.botaoAbrirCaixa ? '✅' : '❌'}`);
      console.log(`   - Preço da caixa: ${elementos.precoCaixa || 'N/A'}`);
      console.log(`   - Saldo do usuário: R$ ${saldo?.saldo_reais || 0}`);
      console.log(`   - Funções de compra: ${funcoes.length}`);
      console.log(`   - Prêmios encontrados: ${premios.elementosPremio}`);
      
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      if (!estaEmPaginaCaixa) {
        console.log('1. Navegar para uma página de caixa específica');
        console.log('2. Executar este script novamente');
      } else {
        console.log('1. Analisar o código da página de caixa');
        console.log('2. Implementar sistema de débito automático');
        console.log('3. Implementar sistema de crédito após prêmio');
        console.log('4. Testar fluxo completo de compra');
      }
      
      // Salvar resultados
      window.analiseSimplesCompra = {
        rotaAtual: window.location.pathname,
        estaEmPaginaCaixa,
        elementos,
        funcoes,
        saldo,
        premios,
        timestamp: new Date().toISOString()
      };
      
      console.log('\n💾 Resultados salvos em window.analiseSimplesCompra');
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  }
}

// ===== EXECUTAR ANÁLISE =====
console.log('🔍 ANÁLISE SIMPLES DO SISTEMA DE COMPRA PRONTA!');
console.log('📋 Execute: executarAnaliseSimples()');

// Executar automaticamente
executarAnaliseSimples();
