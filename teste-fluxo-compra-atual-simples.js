// 🧪 TESTE SIMPLES DO FLUXO DE COMPRA ATUAL - SLOTBOX
// Cole este código no console do navegador (F12) em uma página de caixa para testar o fluxo atual

console.log('🧪 INICIANDO TESTE SIMPLES DO FLUXO DE COMPRA ATUAL...');

// ===== TESTE 1: VERIFICAR ESTADO INICIAL =====
function verificarEstadoInicial() {
  console.log('\n📋 === VERIFICANDO ESTADO INICIAL ===');
  
  // Verificar saldo inicial
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log(`💰 Saldo inicial: R$ ${userData.saldo_reais || 0}`);
      return userData.saldo_reais || 0;
    } catch (e) {
      console.log('❌ Erro ao ler dados do usuário');
      return 0;
    }
  } else {
    console.log('❌ Usuário não encontrado');
    return 0;
  }
}

// ===== TESTE 2: ENCONTRAR BOTÃO DE ABRIR CAIXA =====
function encontrarBotaoAbrirCaixa() {
  console.log('\n🔘 === ENCONTRANDO BOTÃO DE ABRIR CAIXA ===');
  
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  let botaoAbrirCaixa = null;
  
  botoes.forEach((botao, index) => {
    const texto = botao.textContent?.toLowerCase().trim() || '';
    
    if (texto.includes('abrir') || texto.includes('open')) {
      botaoAbrirCaixa = botao;
      console.log(`✅ Botão "Abrir Caixa" encontrado: "${texto}"`);
      console.log(`   - Classes: ${botao.className}`);
      console.log(`   - ID: ${botao.id}`);
      console.log(`   - Disabled: ${botao.disabled}`);
    }
  });
  
  if (!botaoAbrirCaixa) {
    console.log('❌ Botão "Abrir Caixa" não encontrado');
    console.log('🔍 Botões disponíveis:');
    botoes.forEach((botao, index) => {
      console.log(`   ${index + 1}. "${botao.textContent?.trim()}"`);
    });
  }
  
  return botaoAbrirCaixa;
}

// ===== TESTE 3: VERIFICAR PREÇO DA CAIXA =====
function verificarPrecoCaixa() {
  console.log('\n💰 === VERIFICANDO PREÇO DA CAIXA ===');
  
  // Procurar por elementos que contenham preço
  const todosElementos = document.querySelectorAll('*');
  let precoCaixa = null;
  
  todosElementos.forEach(elemento => {
    const texto = elemento.textContent?.trim() || '';
    if (texto.match(/R\$\s*\d+/) && !texto.includes('saldo')) {
      precoCaixa = texto;
      console.log(`✅ Preço da caixa encontrado: ${texto}`);
    }
  });
  
  if (!precoCaixa) {
    console.log('❌ Preço da caixa não encontrado');
  }
  
  return precoCaixa;
}

// ===== TESTE 4: SIMULAR CLIQUE NO BOTÃO =====
function simularCliqueBotao(botao) {
  console.log('\n🖱️ === SIMULANDO CLIQUE NO BOTÃO ===');
  
  if (!botao) {
    console.log('❌ Botão não encontrado para simular clique');
    return false;
  }
  
  console.log('🎯 Simulando clique no botão...');
  
  // Verificar se o botão está habilitado
  if (botao.disabled) {
    console.log('❌ Botão está desabilitado');
    return false;
  }
  
  // Simular clique
  try {
    botao.click();
    console.log('✅ Clique simulado com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao simular clique:', error.message);
    return false;
  }
}

// ===== TESTE 5: MONITORAR MUDANÇAS NO SALDO =====
function monitorarMudancasSaldo(saldoInicial) {
  console.log('\n👀 === MONITORANDO MUDANÇAS NO SALDO ===');
  
  let saldoAtual = saldoInicial;
  let mudancasDetectadas = 0;
  
  const verificarSaldo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const novoSaldo = userData.saldo_reais || 0;
        
        if (novoSaldo !== saldoAtual) {
          mudancasDetectadas++;
          const diferenca = novoSaldo - saldoAtual;
          console.log(`💰 Mudança no saldo detectada!`);
          console.log(`   - Saldo anterior: R$ ${saldoAtual}`);
          console.log(`   - Saldo atual: R$ ${novoSaldo}`);
          console.log(`   - Diferença: R$ ${diferenca > 0 ? '+' : ''}${diferenca}`);
          
          if (diferenca < 0) {
            console.log('   ✅ Débito detectado (compra realizada)');
          } else if (diferenca > 0) {
            console.log('   ✅ Crédito detectado (prêmio recebido)');
          }
          
          saldoAtual = novoSaldo;
        }
      } catch (e) {
        console.log('❌ Erro ao verificar saldo:', e.message);
      }
    }
  };
  
  // Verificar saldo a cada 500ms por 10 segundos
  const interval = setInterval(verificarSaldo, 500);
  
  setTimeout(() => {
    clearInterval(interval);
    console.log(`\n📊 Monitoramento concluído:`);
    console.log(`   - Mudanças detectadas: ${mudancasDetectadas}`);
    console.log(`   - Saldo final: R$ ${saldoAtual}`);
    
    if (mudancasDetectadas === 0) {
      console.log('⚠️ Nenhuma mudança no saldo detectada');
      console.log('   - Possível problema: Sistema não está debitando/c creditando');
    }
  }, 10000);
  
  return interval;
}

// ===== TESTE 6: MONITORAR REQUISIÇÕES DE REDE =====
function monitorarRequisicoesRede() {
  console.log('\n🌐 === MONITORANDO REQUISIÇÕES DE REDE ===');
  
  const requisicoes = [];
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    console.log(`📡 Requisição: ${options.method || 'GET'} ${url}`);
    
    if (url.includes('api') && (options.method === 'POST' || options.method === 'PUT')) {
      console.log(`   - Body: ${options.body || 'N/A'}`);
      requisicoes.push({
        url,
        method: options.method,
        body: options.body,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalFetch.apply(this, args);
  };
  
  return requisicoes;
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteFluxoCompraSimples() {
  console.log('🧪 EXECUTANDO TESTE SIMPLES DO FLUXO DE COMPRA ATUAL...');
  
  // Verificar se estamos em uma página de caixa
  const rotaAtual = window.location.pathname;
  if (!rotaAtual.includes('case')) {
    console.log('❌ Não estamos em uma página de caixa');
    console.log('💡 Navegue para uma página de caixa primeiro');
    return;
  }
  
  console.log(`✅ Estamos na página: ${rotaAtual}`);
  
  try {
    // Teste 1: Verificar estado inicial
    const saldoInicial = verificarEstadoInicial();
    
    // Teste 2: Encontrar botão de abrir caixa
    const botaoAbrirCaixa = encontrarBotaoAbrirCaixa();
    
    // Teste 3: Verificar preço da caixa
    const precoCaixa = verificarPrecoCaixa();
    
    // Teste 4: Monitorar requisições de rede
    const requisicoes = monitorarRequisicoesRede();
    
    // Teste 5: Monitorar mudanças no saldo
    const monitorSaldo = monitorarMudancasSaldo(saldoInicial);
    
    // Aguardar um pouco antes de simular clique
    setTimeout(() => {
      if (botaoAbrirCaixa) {
        console.log('\n🎯 === INICIANDO TESTE DE COMPRA ===');
        
        // Verificar se há saldo suficiente
        if (precoCaixa) {
          const precoNumerico = parseFloat(precoCaixa.replace(/[^\d,]/g, '').replace(',', '.'));
          if (saldoInicial < precoNumerico) {
            console.log('❌ Saldo insuficiente para compra');
            console.log(`   - Saldo atual: R$ ${saldoInicial}`);
            console.log(`   - Preço da caixa: ${precoCaixa}`);
            return;
          }
        }
        
        // Simular clique no botão
        const cliqueSucesso = simularCliqueBotao(botaoAbrirCaixa);
        
        if (cliqueSucesso) {
          console.log('✅ Teste de compra iniciado');
          console.log('👀 Monitorando mudanças no sistema...');
        } else {
          console.log('❌ Falha ao iniciar teste de compra');
        }
      } else {
        console.log('❌ Não foi possível testar - botão não encontrado');
      }
    }, 3000);
    
    // Resumo final
    setTimeout(() => {
      console.log('\n🎯 === RESUMO DO TESTE ===');
      
      console.log('📊 RESULTADOS:');
      console.log(`   - Saldo inicial: R$ ${saldoInicial}`);
      console.log(`   - Preço da caixa: ${precoCaixa || 'N/A'}`);
      console.log(`   - Botão encontrado: ${botaoAbrirCaixa ? '✅' : '❌'}`);
      console.log(`   - Requisições monitoradas: ${requisicoes.length}`);
      
      console.log('\n🔧 ANÁLISE DO SISTEMA ATUAL:');
      if (requisicoes.length === 0) {
        console.log('❌ PROBLEMA: Nenhuma requisição de compra detectada');
        console.log('   - O sistema pode não estar fazendo requisições para o backend');
        console.log('   - Possível problema: Botão não está conectado à API');
      } else {
        console.log('✅ Requisições de compra detectadas');
        requisicoes.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.method} ${req.url}`);
        });
      }
      
      console.log('\n💡 PRÓXIMOS PASSOS:');
      console.log('1. Analisar o código da página de caixa');
      console.log('2. Implementar sistema de débito automático');
      console.log('3. Implementar sistema de crédito após prêmio');
      console.log('4. Testar fluxo completo');
      
      // Salvar resultados
      window.testeFluxoCompraSimples = {
        saldoInicial,
        precoCaixa,
        botaoEncontrado: !!botaoAbrirCaixa,
        requisicoes,
        timestamp: new Date().toISOString()
      };
      
      console.log('\n💾 Resultados salvos em window.testeFluxoCompraSimples');
      
    }, 15000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE SIMPLES DO FLUXO DE COMPRA ATUAL PRONTO!');
console.log('📋 Execute: executarTesteFluxoCompraSimples()');
console.log('💡 Certifique-se de estar em uma página de caixa específica');

// Executar automaticamente
executarTesteFluxoCompraSimples();
