// 🔍 ANÁLISE DO SISTEMA DE COMPRA DAS CAIXAS - SLOTBOX
// Cole este código no console do navegador (F12) para analisar o sistema atual

console.log('🔍 INICIANDO ANÁLISE DO SISTEMA DE COMPRA DAS CAIXAS...');

// ===== ANÁLISE 1: VERIFICAR PÁGINAS DE CAIXAS =====
function analisarPaginasCaixas() {
  console.log('\n📦 === ANÁLISE DAS PÁGINAS DE CAIXAS ===');
  
  const rotasCaixas = [
    '/weekend-case',
    '/nike-case',
    '/samsung-case',
    '/console-case',
    '/apple-case',
    '/premium-master-case'
  ];
  
  console.log('🔍 Rotas de caixas disponíveis:');
  rotasCaixas.forEach((rota, index) => {
    console.log(`   ${index + 1}. ${rota}`);
  });
  
  const rotaAtual = window.location.pathname;
  console.log(`📍 Rota atual: ${rotaAtual}`);
  
  if (rotasCaixas.includes(rotaAtual)) {
    console.log('✅ Estamos em uma página de caixa');
    return rotaAtual;
  } else {
    console.log('⚠️ Não estamos em uma página de caixa');
    return null;
  }
}

// ===== ANÁLISE 2: VERIFICAR ELEMENTOS DA PÁGINA =====
function analisarElementosPagina() {
  console.log('\n🔍 === ANÁLISE DOS ELEMENTOS DA PÁGINA ===');
  
  // Verificar botão de abrir caixa
  const botoesAbrir = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  console.log(`🔘 Botões encontrados: ${botoesAbrir.length}`);
  
  let botaoAbrirCaixa = null;
  botoesAbrir.forEach((botao, index) => {
    const texto = botao.textContent?.toLowerCase() || '';
    const classes = botao.className?.toLowerCase() || '';
    
    console.log(`   Botão ${index + 1}: "${texto}" (classes: ${classes})`);
    
    if (texto.includes('abrir') || texto.includes('open') || texto.includes('comprar') || texto.includes('buy')) {
      botaoAbrirCaixa = botao;
      console.log(`   ✅ Botão "Abrir Caixa" encontrado: ${texto}`);
    }
  });
  
  // Verificar informações da caixa
  const precos = document.querySelectorAll('[class*="price"], [class*="preco"], [class*="valor"]');
  console.log(`💰 Elementos de preço encontrados: ${precos.length}`);
  precos.forEach((preco, index) => {
    console.log(`   Preço ${index + 1}: "${preco.textContent}"`);
  });
  
  // Verificar saldo do usuário
  const saldos = document.querySelectorAll('[class*="saldo"], [class*="balance"], [class*="wallet"]');
  console.log(`💳 Elementos de saldo encontrados: ${saldos.length}`);
  saldos.forEach((saldo, index) => {
    console.log(`   Saldo ${index + 1}: "${saldo.textContent}"`);
  });
  
  // Verificar área de prêmios
  const premios = document.querySelectorAll('[class*="premio"], [class*="prize"], [class*="reward"]');
  console.log(`🎁 Elementos de prêmio encontrados: ${premios.length}`);
  premios.forEach((premio, index) => {
    console.log(`   Prêmio ${index + 1}: "${premio.textContent}"`);
  });
  
  return {
    botaoAbrirCaixa,
    precos,
    saldos,
    premios
  };
}

// ===== ANÁLISE 3: VERIFICAR FUNÇÕES DE COMPRA =====
function analisarFuncoesCompra() {
  console.log('\n🛒 === ANÁLISE DAS FUNÇÕES DE COMPRA ===');
  
  // Verificar se há funções de compra no window
  const funcoesCompra = [];
  
  // Procurar por funções relacionadas a compra
  Object.keys(window).forEach(key => {
    if (key.toLowerCase().includes('buy') || 
        key.toLowerCase().includes('purchase') || 
        key.toLowerCase().includes('open') || 
        key.toLowerCase().includes('abrir') ||
        key.toLowerCase().includes('comprar')) {
      funcoesCompra.push(key);
    }
  });
  
  console.log(`🔧 Funções de compra encontradas: ${funcoesCompra.length}`);
  funcoesCompra.forEach(funcao => {
    console.log(`   - ${funcao}`);
  });
  
  // Verificar se há eventos de clique nos botões
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  let botoesComOnClick = 0;
  
  botoes.forEach((botao, index) => {
    if (botao.onclick) {
      botoesComOnClick++;
      console.log(`   Botão ${index + 1} tem onClick: ${botao.onclick.toString().substring(0, 100)}...`);
    }
  });
  
  console.log(`🔘 Botões com onClick: ${botoesComOnClick}/${botoes.length}`);
  
  return {
    funcoesCompra,
    botoesComOnClick
  };
}

// ===== ANÁLISE 4: VERIFICAR SISTEMA DE SALDO =====
function analisarSistemaSaldo() {
  console.log('\n💳 === ANÁLISE DO SISTEMA DE SALDO ===');
  
  // Verificar localStorage
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
async function analisarAPICompra() {
  console.log('\n🌐 === ANÁLISE DA API DE COMPRA ===');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Token não encontrado - pulando análise da API');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Testar endpoints relacionados a compra
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

// ===== ANÁLISE 6: VERIFICAR FLUXO DE COMPRA =====
function analisarFluxoCompra() {
  console.log('\n🔄 === ANÁLISE DO FLUXO DE COMPRA ===');
  
  // Verificar se há modais ou popups
  const modais = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="dialog"]');
  console.log(`🪟 Modais encontrados: ${modais.length}`);
  
  // Verificar se há animações ou transições
  const animacoes = document.querySelectorAll('[class*="animate"], [class*="transition"], [class*="animation"]');
  console.log(`🎬 Elementos com animação: ${animacoes.length}`);
  
  // Verificar se há loading ou spinners
  const loadings = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
  console.log(`⏳ Elementos de loading: ${loadings.length}`);
  
  // Verificar se há notificações ou toasts
  const notificacoes = document.querySelectorAll('[class*="toast"], [class*="notification"], [class*="alert"]');
  console.log(`🔔 Elementos de notificação: ${notificacoes.length}`);
  
  return {
    modais,
    animacoes,
    loadings,
    notificacoes
  };
}

// ===== ANÁLISE 7: VERIFICAR SISTEMA DE PRÊMIOS =====
function analisarSistemaPremios() {
  console.log('\n🎁 === ANÁLISE DO SISTEMA DE PRÊMIOS ===');
  
  // Verificar se há elementos de prêmio na página
  const elementosPremio = document.querySelectorAll('[class*="premio"], [class*="prize"], [class*="reward"], [class*="item"]');
  console.log(`🎁 Elementos de prêmio encontrados: ${elementosPremio.length}`);
  
  elementosPremio.forEach((elemento, index) => {
    const texto = elemento.textContent?.trim() || '';
    const classes = elemento.className || '';
    console.log(`   Prêmio ${index + 1}: "${texto}" (classes: ${classes})`);
  });
  
  // Verificar se há imagens de prêmios
  const imagensPremio = document.querySelectorAll('img[src*="premio"], img[src*="prize"], img[src*="item"]');
  console.log(`🖼️ Imagens de prêmio encontradas: ${imagensPremio.length}`);
  
  imagensPremio.forEach((img, index) => {
    console.log(`   Imagem ${index + 1}: ${img.src}`);
  });
  
  return {
    elementosPremio,
    imagensPremio
  };
}

// ===== ANÁLISE 8: VERIFICAR CONSOLE LOGS =====
function analisarConsoleLogs() {
  console.log('\n📋 === ANÁLISE DOS CONSOLE LOGS ===');
  
  // Verificar se há logs relacionados a compra
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
    
    const logsCompra = logs.filter(log => 
      log.toLowerCase().includes('compra') ||
      log.toLowerCase().includes('buy') ||
      log.toLowerCase().includes('purchase') ||
      log.toLowerCase().includes('abrir') ||
      log.toLowerCase().includes('open') ||
      log.toLowerCase().includes('debito') ||
      log.toLowerCase().includes('credito') ||
      log.toLowerCase().includes('saldo')
    );
    
    console.log(`📋 Logs relacionados a compra: ${logsCompra.length}`);
    logsCompra.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log}`);
    });
    
    if (logsCompra.length === 0) {
      console.log('⚠️ Nenhum log relacionado a compra encontrado');
    }
  }, 3000);
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarAnaliseSistemaCompra() {
  console.log('🔍 EXECUTANDO ANÁLISE COMPLETA DO SISTEMA DE COMPRA...');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    rotaAtual: null,
    elementos: null,
    funcoes: null,
    saldo: null,
    fluxo: null,
    premios: null
  };
  
  try {
    // Análise 1: Páginas de caixas
    resultados.rotaAtual = analisarPaginasCaixas();
    
    // Análise 2: Elementos da página
    resultados.elementos = analisarElementosPagina();
    
    // Análise 3: Funções de compra
    resultados.funcoes = analisarFuncoesCompra();
    
    // Análise 4: Sistema de saldo
    resultados.saldo = analisarSistemaSaldo();
    
    // Análise 5: API de compra
    await analisarAPICompra();
    
    // Análise 6: Fluxo de compra
    resultados.fluxo = analisarFluxoCompra();
    
    // Análise 7: Sistema de prêmios
    resultados.premios = analisarSistemaPremios();
    
    // Análise 8: Console logs
    analisarConsoleLogs();
    
    // Resumo final
    setTimeout(() => {
      console.log('\n🎯 === RESUMO DA ANÁLISE ===');
      
      console.log('📊 INFORMAÇÕES COLETADAS:');
      console.log(`   - Rota atual: ${resultados.rotaAtual || 'N/A'}`);
      console.log(`   - Botões encontrados: ${resultados.elementos?.precos?.length || 0}`);
      console.log(`   - Funções de compra: ${resultados.funcoes?.funcoesCompra?.length || 0}`);
      console.log(`   - Saldo do usuário: R$ ${resultados.saldo?.saldo_reais || 0}`);
      console.log(`   - Modais encontrados: ${resultados.fluxo?.modais?.length || 0}`);
      console.log(`   - Prêmios encontrados: ${resultados.premios?.elementosPremio?.length || 0}`);
      
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('1. Analisar o código das páginas de caixas');
      console.log('2. Implementar sistema de débito automático');
      console.log('3. Implementar sistema de crédito após prêmio');
      console.log('4. Testar fluxo completo de compra');
      
      // Salvar resultados para análise
      window.analiseSistemaCompra = resultados;
      console.log('\n💾 Resultados salvos em window.analiseSistemaCompra');
      
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  }
}

// ===== EXECUTAR ANÁLISE =====
console.log('🔍 ANÁLISE DO SISTEMA DE COMPRA PRONTA!');
console.log('📋 Execute: executarAnaliseSistemaCompra()');

// Executar automaticamente
executarAnaliseSistemaCompra();
