// 🔍 ANÁLISE DETALHADA DO FLUXO DE COMPRA - SLOTBOX
// Cole este código no console do navegador (F12) em uma página de caixa específica

console.log('🔍 INICIANDO ANÁLISE DETALHADA DO FLUXO DE COMPRA...');

// ===== ANÁLISE 1: VERIFICAR ESTRUTURA DA PÁGINA =====
function analisarEstruturaPagina() {
  console.log('\n📋 === ESTRUTURA DA PÁGINA ===');
  
  // Verificar se estamos em uma página de caixa
  const rotaAtual = window.location.pathname;
  console.log(`📍 Rota atual: ${rotaAtual}`);
  
  if (!rotaAtual.includes('case')) {
    console.log('⚠️ Não estamos em uma página de caixa');
    console.log('💡 Navegue para uma página de caixa primeiro');
    return false;
  }
  
  console.log('✅ Estamos em uma página de caixa');
  
  // Analisar estrutura HTML
  const elementos = {
    botoes: document.querySelectorAll('button'),
    inputs: document.querySelectorAll('input'),
    selects: document.querySelectorAll('select'),
    divs: document.querySelectorAll('div'),
    spans: document.querySelectorAll('span'),
    imgs: document.querySelectorAll('img')
  };
  
  console.log('📊 Elementos encontrados:');
  Object.entries(elementos).forEach(([tipo, lista]) => {
    console.log(`   - ${tipo}: ${lista.length}`);
  });
  
  return true;
}

// ===== ANÁLISE 2: VERIFICAR BOTÃO DE ABRIR CAIXA =====
function analisarBotaoAbrirCaixa() {
  console.log('\n🔘 === ANÁLISE DO BOTÃO DE ABRIR CAIXA ===');
  
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  console.log(`🔘 Total de botões: ${botoes.length}`);
  
  let botaoAbrirCaixa = null;
  const botoesRelevantes = [];
  
  botoes.forEach((botao, index) => {
    const texto = botao.textContent?.toLowerCase().trim() || '';
    const classes = botao.className?.toLowerCase() || '';
    const id = botao.id?.toLowerCase() || '';
    
    // Verificar se é um botão relevante
    if (texto.includes('abrir') || 
        texto.includes('open') || 
        texto.includes('comprar') || 
        texto.includes('buy') ||
        texto.includes('caixa') ||
        texto.includes('case') ||
        classes.includes('open') ||
        classes.includes('buy') ||
        classes.includes('purchase') ||
        id.includes('open') ||
        id.includes('buy')) {
      
      botoesRelevantes.push({
        elemento: botao,
        texto: texto,
        classes: classes,
        id: id,
        index: index
      });
      
      console.log(`   ✅ Botão relevante ${index + 1}: "${texto}"`);
      console.log(`      - Classes: ${classes}`);
      console.log(`      - ID: ${id}`);
      console.log(`      - onClick: ${botao.onclick ? 'Presente' : 'Ausente'}`);
      
      if (texto.includes('abrir') || texto.includes('open')) {
        botaoAbrirCaixa = botao;
      }
    }
  });
  
  console.log(`🎯 Botões relevantes encontrados: ${botoesRelevantes.length}`);
  
  if (botaoAbrirCaixa) {
    console.log('✅ Botão "Abrir Caixa" identificado');
    
    // Analisar o botão em detalhes
    console.log('🔍 Análise detalhada do botão:');
    console.log(`   - Texto: "${botaoAbrirCaixa.textContent}"`);
    console.log(`   - Classes: "${botaoAbrirCaixa.className}"`);
    console.log(`   - ID: "${botaoAbrirCaixa.id}"`);
    console.log(`   - Disabled: ${botaoAbrirCaixa.disabled}`);
    console.log(`   - onClick: ${botaoAbrirCaixa.onclick ? 'Presente' : 'Ausente'}`);
    
    if (botaoAbrirCaixa.onclick) {
      console.log(`   - Função onClick: ${botaoAbrirCaixa.onclick.toString().substring(0, 200)}...`);
    }
  } else {
    console.log('❌ Botão "Abrir Caixa" não encontrado');
  }
  
  return {
    botaoAbrirCaixa,
    botoesRelevantes
  };
}

// ===== ANÁLISE 3: VERIFICAR INFORMAÇÕES DE PREÇO =====
function analisarInformacoesPreco() {
  console.log('\n💰 === ANÁLISE DAS INFORMAÇÕES DE PREÇO ===');
  
  // Procurar por elementos que contenham preço
  const elementosPreco = [];
  
  // Procurar por texto que contenha R$, $, ou números
  const todosElementos = document.querySelectorAll('*');
  todosElementos.forEach(elemento => {
    const texto = elemento.textContent?.trim() || '';
    if (texto.match(/R\$\s*\d+|\$\s*\d+|\d+,\d+|\d+\.\d+/)) {
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
  
  // Procurar especificamente por preço da caixa
  let precoCaixa = null;
  elementosPreco.forEach(item => {
    if (item.texto.includes('R$') && !item.texto.includes('saldo')) {
      precoCaixa = item;
    }
  });
  
  if (precoCaixa) {
    console.log('✅ Preço da caixa identificado:');
    console.log(`   - Valor: ${precoCaixa.texto}`);
    console.log(`   - Elemento: ${precoCaixa.tagName}`);
    console.log(`   - Classes: ${precoCaixa.classes}`);
  } else {
    console.log('❌ Preço da caixa não encontrado');
  }
  
  return {
    elementosPreco,
    precoCaixa
  };
}

// ===== ANÁLISE 4: VERIFICAR SALDO DO USUÁRIO =====
function analisarSaldoUsuario() {
  console.log('\n💳 === ANÁLISE DO SALDO DO USUÁRIO ===');
  
  // Verificar localStorage
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
function analisarSistemaPremios() {
  console.log('\n🎁 === ANÁLISE DO SISTEMA DE PRÊMIOS ===');
  
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
function analisarFuncoesJavaScript() {
  console.log('\n🔧 === ANÁLISE DAS FUNÇÕES JAVASCRIPT ===');
  
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
function analisarEventosClique() {
  console.log('\n🖱️ === ANÁLISE DOS EVENTOS DE CLIQUE ===');
  
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
async function executarAnaliseDetalhada() {
  console.log('🔍 EXECUTANDO ANÁLISE DETALHADA DO FLUXO DE COMPRA...');
  
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
    // Análise 1: Estrutura da página
    const estruturaOK = analisarEstruturaPagina();
    if (!estruturaOK) {
      console.log('❌ Análise interrompida - não estamos em uma página de caixa');
      return;
    }
    
    // Análise 2: Botão de abrir caixa
    resultados.botao = analisarBotaoAbrirCaixa();
    
    // Análise 3: Informações de preço
    resultados.preco = analisarInformacoesPreco();
    
    // Análise 4: Saldo do usuário
    resultados.saldo = analisarSaldoUsuario();
    
    // Análise 5: Sistema de prêmios
    resultados.premios = analisarSistemaPremios();
    
    // Análise 6: Funções JavaScript
    resultados.funcoes = analisarFuncoesJavaScript();
    
    // Análise 7: Eventos de clique
    resultados.eventos = analisarEventosClique();
    
    // Resumo final
    setTimeout(() => {
      console.log('\n🎯 === RESUMO DA ANÁLISE DETALHADA ===');
      
      console.log('📊 INFORMAÇÕES COLETADAS:');
      console.log(`   - Rota: ${resultados.rotaAtual}`);
      console.log(`   - Botão "Abrir Caixa": ${resultados.botao?.botaoAbrirCaixa ? '✅ Encontrado' : '❌ Não encontrado'}`);
      console.log(`   - Preço da caixa: ${resultados.preco?.precoCaixa ? '✅ Encontrado' : '❌ Não encontrado'}`);
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
      window.analiseDetalhadaCompra = resultados;
      console.log('\n💾 Resultados salvos em window.analiseDetalhadaCompra');
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro durante a análise detalhada:', error);
  }
}

// ===== EXECUTAR ANÁLISE =====
console.log('🔍 ANÁLISE DETALHADA DO FLUXO DE COMPRA PRONTA!');
console.log('📋 Execute: executarAnaliseDetalhada()');
console.log('💡 Certifique-se de estar em uma página de caixa específica');

// Executar automaticamente
executarAnaliseDetalhada();
