// 🔍 ANÁLISE DO SISTEMA DE COMPRA EM PÁGINA DE CAIXA - SLOTBOX
// Cole este código no console do navegador (F12) quando estiver em uma página de caixa específica

console.log('🔍 INICIANDO ANÁLISE DO SISTEMA DE COMPRA EM PÁGINA DE CAIXA...');

// ===== ANÁLISE 1: VERIFICAR SE ESTAMOS EM PÁGINA DE CAIXA =====
function verificarPaginaCaixa() {
  console.log('\n📦 === VERIFICANDO PÁGINA DE CAIXA ===');
  
  const rotaAtual = window.location.pathname;
  console.log(`📍 Rota atual: ${rotaAtual}`);
  
  if (!rotaAtual.includes('case')) {
    console.log('❌ Não estamos em uma página de caixa');
    console.log('💡 Navegue para uma página de caixa primeiro:');
    console.log('   - /weekend-case');
    console.log('   - /nike-case');
    console.log('   - /samsung-case');
    console.log('   - /console-case');
    console.log('   - /apple-case');
    console.log('   - /premium-master-case');
    return false;
  }
  
  console.log('✅ Estamos em uma página de caixa');
  return true;
}

// ===== ANÁLISE 2: ENCONTRAR BOTÃO DE ABRIR CAIXA =====
function encontrarBotaoAbrirCaixa() {
  console.log('\n🔘 === ENCONTRANDO BOTÃO DE ABRIR CAIXA ===');
  
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  console.log(`🔘 Total de botões encontrados: ${botoes.length}`);
  
  let botaoAbrirCaixa = null;
  const botoesRelevantes = [];
  
  botoes.forEach((botao, index) => {
    const texto = botao.textContent?.toLowerCase().trim() || '';
    const classes = botao.className?.toLowerCase() || '';
    const id = botao.id?.toLowerCase() || '';
    
    console.log(`   Botão ${index + 1}: "${texto}"`);
    
    // Verificar se é um botão relevante
    if (texto.includes('abrir') || 
        texto.includes('open') || 
        texto.includes('comprar') || 
        texto.includes('buy') ||
        classes.includes('open') ||
        classes.includes('buy') ||
        id.includes('open') ||
        id.includes('buy')) {
      
      botoesRelevantes.push({
        elemento: botao,
        texto: texto,
        classes: classes,
        id: id
      });
      
      console.log(`   ✅ Botão relevante: "${texto}"`);
      
      if (texto.includes('abrir') || texto.includes('open')) {
        botaoAbrirCaixa = botao;
        console.log(`   🎯 Botão "Abrir Caixa" identificado!`);
      }
    }
  });
  
  console.log(`🎯 Botões relevantes encontrados: ${botoesRelevantes.length}`);
  
  if (botaoAbrirCaixa) {
    console.log('✅ Botão "Abrir Caixa" encontrado');
    console.log(`   - Texto: "${botaoAbrirCaixa.textContent}"`);
    console.log(`   - Classes: "${botaoAbrirCaixa.className}"`);
    console.log(`   - ID: "${botaoAbrirCaixa.id}"`);
    console.log(`   - Disabled: ${botaoAbrirCaixa.disabled}`);
    console.log(`   - onClick: ${botaoAbrirCaixa.onclick ? 'Presente' : 'Ausente'}`);
  } else {
    console.log('❌ Botão "Abrir Caixa" não encontrado');
  }
  
  return {
    botaoAbrirCaixa,
    botoesRelevantes,
    totalBotoes: botoes.length
  };
}

// ===== ANÁLISE 3: VERIFICAR PREÇO DA CAIXA =====
function verificarPrecoCaixa() {
  console.log('\n💰 === VERIFICANDO PREÇO DA CAIXA ===');
  
  // Procurar por elementos que contenham preço
  const todosElementos = document.querySelectorAll('*');
  let precoCaixa = null;
  const elementosPreco = [];
  
  todosElementos.forEach(elemento => {
    const texto = elemento.textContent?.trim() || '';
    if (texto.match(/R\$\s*\d+/) && !texto.includes('saldo')) {
      elementosPreco.push({
        elemento: elemento,
        texto: texto,
        tagName: elemento.tagName,
        classes: elemento.className
      });
    }
  });
  
  console.log(`💰 Elementos com preço encontrados: ${elementosPreco.length}`);
  
  elementosPreco.forEach((item, index) => {
    console.log(`   ${index + 1}. "${item.texto}" (${item.tagName})`);
    if (item.classes) {
      console.log(`      Classes: ${item.classes}`);
    }
  });
  
  // Identificar preço da caixa
  if (elementosPreco.length > 0) {
    precoCaixa = elementosPreco[0].texto;
    console.log(`✅ Preço da caixa identificado: ${precoCaixa}`);
  } else {
    console.log('❌ Preço da caixa não encontrado');
  }
  
  return {
    precoCaixa,
    elementosPreco
  };
}

// ===== ANÁLISE 4: VERIFICAR SALDO DO USUÁRIO =====
function verificarSaldoUsuario() {
  console.log('\n💳 === VERIFICANDO SALDO DO USUÁRIO ===');
  
  const user = localStorage.getItem('user');
  if (!user) {
    console.log('❌ Dados do usuário não encontrados no localStorage');
    return null;
  }
  
  try {
    const userData = JSON.parse(user);
    console.log('👤 Dados do usuário:');
    console.log(`   - Nome: ${userData.nome}`);
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Saldo: R$ ${userData.saldo_reais || 0}`);
    console.log(`   - ID: ${userData.id}`);
    
    // Procurar por elementos que mostram o saldo na página
    const elementosSaldo = [];
    const todosElementos = document.querySelectorAll('*');
    
    todosElementos.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      if (texto.includes('saldo') || texto.includes('balance') || texto.includes('R$')) {
        elementosSaldo.push({
          elemento: elemento,
          texto: texto,
          tagName: elemento.tagName,
          classes: elemento.className
        });
      }
    });
    
    console.log(`💳 Elementos de saldo na página: ${elementosSaldo.length}`);
    elementosSaldo.forEach((item, index) => {
      console.log(`   ${index + 1}. "${item.texto}" (${item.tagName})`);
    });
    
    return {
      userData,
      elementosSaldo
    };
    
  } catch (e) {
    console.log('❌ Erro ao analisar dados do usuário:', e.message);
    return null;
  }
}

// ===== ANÁLISE 5: VERIFICAR SISTEMA DE PRÊMIOS =====
function verificarSistemaPremios() {
  console.log('\n🎁 === VERIFICANDO SISTEMA DE PRÊMIOS ===');
  
  // Procurar por elementos de prêmio
  const elementosPremio = [];
  const todosElementos = document.querySelectorAll('*');
  
  todosElementos.forEach(elemento => {
    const texto = elemento.textContent?.toLowerCase().trim() || '';
    const classes = elemento.className?.toLowerCase() || '';
    
    if (texto.includes('premio') || 
        texto.includes('prize') || 
        texto.includes('reward') ||
        texto.includes('item') ||
        classes.includes('premio') ||
        classes.includes('prize') ||
        classes.includes('reward') ||
        classes.includes('item')) {
      
      elementosPremio.push({
        elemento: elemento,
        texto: elemento.textContent?.trim() || '',
        classes: elemento.className,
        tagName: elemento.tagName
      });
    }
  });
  
  console.log(`🎁 Elementos de prêmio encontrados: ${elementosPremio.length}`);
  
  elementosPremio.forEach((item, index) => {
    console.log(`   ${index + 1}. "${item.texto}" (${item.tagName})`);
    if (item.classes) {
      console.log(`      Classes: ${item.classes}`);
    }
  });
  
  // Procurar por imagens de prêmios
  const imagensPremio = document.querySelectorAll('img');
  const imagensRelevantes = [];
  
  imagensPremio.forEach(img => {
    const src = img.src?.toLowerCase() || '';
    const alt = img.alt?.toLowerCase() || '';
    
    if (src.includes('premio') || 
        src.includes('prize') || 
        src.includes('item') ||
        alt.includes('premio') ||
        alt.includes('prize') ||
        alt.includes('item')) {
      
      imagensRelevantes.push({
        elemento: img,
        src: img.src,
        alt: img.alt
      });
    }
  });
  
  console.log(`🖼️ Imagens de prêmio encontradas: ${imagensRelevantes.length}`);
  imagensRelevantes.forEach((img, index) => {
    console.log(`   ${index + 1}. ${img.src} (alt: ${img.alt})`);
  });
  
  return {
    elementosPremio,
    imagensPremio: imagensRelevantes
  };
}

// ===== ANÁLISE 6: VERIFICAR FUNÇÕES JAVASCRIPT =====
function verificarFuncoesJavaScript() {
  console.log('\n🔧 === VERIFICANDO FUNÇÕES JAVASCRIPT ===');
  
  // Verificar funções no window
  const funcoesRelevantes = [];
  
  Object.keys(window).forEach(key => {
    if (key.toLowerCase().includes('buy') || 
        key.toLowerCase().includes('purchase') || 
        key.toLowerCase().includes('open') || 
        key.toLowerCase().includes('abrir') ||
        key.toLowerCase().includes('comprar') ||
        key.toLowerCase().includes('debito') ||
        key.toLowerCase().includes('credito') ||
        key.toLowerCase().includes('saldo')) {
      
      funcoesRelevantes.push(key);
    }
  });
  
  console.log(`🔧 Funções relevantes encontradas: ${funcoesRelevantes.length}`);
  funcoesRelevantes.forEach(funcao => {
    console.log(`   - ${funcao}`);
  });
  
  // Verificar se há React hooks ou componentes
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log(`⚛️ Elementos React encontrados: ${reactElements.length}`);
  
  // Verificar se há estado React
  if (window.React) {
    console.log('✅ React encontrado no window');
  }
  
  if (window.ReactDOM) {
    console.log('✅ ReactDOM encontrado no window');
  }
  
  return {
    funcoesRelevantes,
    reactElements
  };
}

// ===== ANÁLISE 7: VERIFICAR EVENTOS DE CLIQUE =====
function verificarEventosClique() {
  console.log('\n🖱️ === VERIFICANDO EVENTOS DE CLIQUE ===');
  
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  let botoesComEventos = 0;
  
  botoes.forEach((botao, index) => {
    if (botao.onclick) {
      botoesComEventos++;
      console.log(`   Botão ${index + 1} tem onClick: ${botao.onclick.toString().substring(0, 100)}...`);
    }
  });
  
  console.log(`🖱️ Botões com eventos de clique: ${botoesComEventos}/${botoes.length}`);
  
  // Verificar se há event listeners
  const elementosComListeners = [];
  botoes.forEach(botao => {
    // Verificar se há event listeners (aproximação)
    if (botao.onclick || botao.onmousedown || botao.onmouseup) {
      elementosComListeners.push(botao);
    }
  });
  
  console.log(`🎯 Elementos com event listeners: ${elementosComListeners.length}`);
  
  return {
    botoesComEventos,
    elementosComListeners
  };
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarAnaliseCompraPaginaCaixa() {
  console.log('🔍 EXECUTANDO ANÁLISE DO SISTEMA DE COMPRA EM PÁGINA DE CAIXA...');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    rotaAtual: window.location.pathname,
    estrutura: null,
    botao: null,
    preco: null,
    saldo: null,
    premios: null,
    funcoes: null,
    eventos: null
  };
  
  try {
    // Análise 1: Verificar se estamos em página de caixa
    const estaEmPaginaCaixa = verificarPaginaCaixa();
    if (!estaEmPaginaCaixa) {
      console.log('❌ Análise interrompida - não estamos em uma página de caixa');
      return;
    }
    
    // Análise 2: Encontrar botão de abrir caixa
    resultados.botao = encontrarBotaoAbrirCaixa();
    
    // Análise 3: Verificar preço da caixa
    resultados.preco = verificarPrecoCaixa();
    
    // Análise 4: Verificar saldo do usuário
    resultados.saldo = verificarSaldoUsuario();
    
    // Análise 5: Verificar sistema de prêmios
    resultados.premios = verificarSistemaPremios();
    
    // Análise 6: Verificar funções JavaScript
    resultados.funcoes = verificarFuncoesJavaScript();
    
    // Análise 7: Verificar eventos de clique
    resultados.eventos = verificarEventosClique();
    
    // Resumo final
    setTimeout(() => {
      console.log('\n🎯 === RESUMO DA ANÁLISE ===');
      
      console.log('📊 INFORMAÇÕES COLETADAS:');
      console.log(`   - Rota: ${resultados.rotaAtual}`);
      console.log(`   - Botão "Abrir Caixa": ${resultados.botao?.botaoAbrirCaixa ? '✅ Encontrado' : '❌ Não encontrado'}`);
      console.log(`   - Preço da caixa: ${resultados.preco?.precoCaixa || 'N/A'}`);
      console.log(`   - Saldo do usuário: R$ ${resultados.saldo?.userData?.saldo_reais || 0}`);
      console.log(`   - Prêmios encontrados: ${resultados.premios?.elementosPremio?.length || 0}`);
      console.log(`   - Funções relevantes: ${resultados.funcoes?.funcoesRelevantes?.length || 0}`);
      console.log(`   - Eventos de clique: ${resultados.eventos?.botoesComEventos || 0}`);
      
      console.log('\n🔧 PRÓXIMOS PASSOS PARA MELHORAR O SISTEMA:');
      console.log('1. Implementar débito automático ao clicar em "Abrir Caixa"');
      console.log('2. Implementar validação de saldo suficiente');
      console.log('3. Implementar sistema de crédito após mostrar prêmio');
      console.log('4. Implementar feedback visual durante o processo');
      console.log('5. Implementar tratamento de erros');
      
      // Salvar resultados para análise
      window.analiseCompraPaginaCaixa = resultados;
      console.log('\n💾 Resultados salvos em window.analiseCompraPaginaCaixa');
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  }
}

// ===== EXECUTAR ANÁLISE =====
console.log('🔍 ANÁLISE DO SISTEMA DE COMPRA EM PÁGINA DE CAIXA PRONTA!');
console.log('📋 Execute: executarAnaliseCompraPaginaCaixa()');
console.log('💡 Certifique-se de estar em uma página de caixa específica');

// Executar automaticamente
executarAnaliseCompraPaginaCaixa();
