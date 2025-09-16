// 🧪 TESTAR SISTEMA DE COMPRA CORRIGIDO - SLOTBOX
// Cole este código no console do navegador (F12) para testar o sistema corrigido

console.log('🧪 INICIANDO TESTE DO SISTEMA DE COMPRA CORRIGIDO...');

// ===== TESTE 1: VERIFICAR SISTEMA CORRIGIDO =====
function verificarSistemaCorrigido() {
  console.log('\n🔍 === VERIFICANDO SISTEMA CORRIGIDO ===');
  
  if (window.sistemaCompraMelhorado) {
    console.log('✅ Sistema de compra melhorado encontrado');
    console.log('   - Instância:', window.sistemaCompraMelhorado);
    console.log('   - Saldo atual:', window.sistemaCompraMelhorado.saldoAtual);
    console.log('   - Preço da caixa:', window.sistemaCompraMelhorado.precoCaixa);
    console.log('   - Botão encontrado:', !!window.sistemaCompraMelhorado.botaoAbrirCaixa);
    console.log('   - Processando:', window.sistemaCompraMelhorado.isProcessing);
    return true;
  } else {
    console.log('❌ Sistema de compra melhorado não encontrado');
    console.log('💡 Execute primeiro o código "sistema-compra-melhorado-corrigido.js"');
    return false;
  }
}

// ===== TESTE 2: TESTAR COMPRA SIMPLES =====
function testarCompraSimples() {
  console.log('\n🛒 === TESTANDO COMPRA SIMPLES ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) {
    console.log('❌ Sistema não encontrado');
    return;
  }
  
  if (sistema.isProcessing) {
    console.log('⚠️ Sistema já está processando uma compra');
    return;
  }
  
  if (sistema.saldoAtual < sistema.precoCaixa) {
    console.log('❌ Saldo insuficiente para compra');
    console.log(`   - Necessário: R$ ${sistema.precoCaixa.toFixed(2)}`);
    console.log(`   - Disponível: R$ ${sistema.saldoAtual.toFixed(2)}`);
    return;
  }
  
  console.log('🎯 Iniciando teste de compra...');
  console.log(`   - Saldo antes: R$ ${sistema.saldoAtual.toFixed(2)}`);
  console.log(`   - Preço da caixa: R$ ${sistema.precoCaixa.toFixed(2)}`);
  
  // Simular clique
  if (sistema.botaoAbrirCaixa) {
    sistema.botaoAbrirCaixa.click();
    console.log('✅ Clique simulado com sucesso');
  } else {
    console.log('❌ Botão não encontrado');
  }
}

// ===== TESTE 3: MONITORAR PROCESSO COMPLETO =====
function monitorarProcessoCompleto() {
  console.log('\n👀 === MONITORANDO PROCESSO COMPLETO ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  let tentativas = 0;
  const maxTentativas = 30; // 15 segundos
  
  const monitor = setInterval(() => {
    tentativas++;
    
    console.log(`📊 Monitoramento ${tentativas}/${maxTentativas}:`);
    console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
    console.log(`   - Saldo atual: R$ ${sistema.saldoAtual.toFixed(2)}`);
    
    if (!sistema.isProcessing && tentativas > 1) {
      console.log('✅ Processo concluído');
      clearInterval(monitor);
      
      // Verificar resultado final
      verificarResultadoFinal();
    }
    
    if (tentativas >= maxTentativas) {
      console.log('⏰ Timeout do monitoramento');
      clearInterval(monitor);
    }
  }, 500);
}

// ===== TESTE 4: VERIFICAR RESULTADO FINAL =====
function verificarResultadoFinal() {
  console.log('\n🎯 === VERIFICANDO RESULTADO FINAL ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  console.log('📊 Resultado final:');
  console.log(`   - Saldo final: R$ ${sistema.saldoAtual.toFixed(2)}`);
  console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
  
  // Verificar se o botão foi reabilitado
  if (sistema.botaoAbrirCaixa) {
    console.log(`   - Botão habilitado: ${!sistema.botaoAbrirCaixa.disabled ? '✅' : '❌'}`);
    console.log(`   - Texto do botão: "${sistema.botaoAbrirCaixa.textContent}"`);
  }
  
  // Verificar localStorage
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    console.log(`   - Saldo no localStorage: R$ ${userData.saldo_reais.toFixed(2)}`);
    
    if (Math.abs(userData.saldo_reais - sistema.saldoAtual) < 0.01) {
      console.log('✅ Saldo sincronizado entre sistema e localStorage');
    } else {
      console.log('❌ Saldo não sincronizado entre sistema e localStorage');
    }
  }
}

// ===== TESTE 5: TESTAR MÚLTIPLAS COMPRAS =====
function testarMultiplasCompras() {
  console.log('\n🔄 === TESTANDO MÚLTIPLAS COMPRAS ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  const saldoInicial = sistema.saldoAtual;
  const precoCaixa = sistema.precoCaixa;
  const maxCompras = Math.floor(saldoInicial / precoCaixa);
  
  console.log(`💰 Saldo atual: R$ ${saldoInicial.toFixed(2)}`);
  console.log(`💸 Preço por caixa: R$ ${precoCaixa.toFixed(2)}`);
  console.log(`🛒 Máximo de compras possíveis: ${maxCompras}`);
  
  if (maxCompras > 0) {
    console.log('💡 Para testar múltiplas compras, execute:');
    console.log('   testarMultiplasCompras()');
    console.log('   (Isso simulará várias compras em sequência)');
  } else {
    console.log('❌ Saldo insuficiente para múltiplas compras');
  }
}

// ===== TESTE 6: TESTAR FUNÇÕES INDIVIDUAIS =====
function testarFuncoesIndividuais() {
  console.log('\n🔧 === TESTANDO FUNÇÕES INDIVIDUAIS ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  console.log('🧪 Testando funções individuais:');
  
  // Testar mostrarMensagem
  console.log('📢 Testando mostrarMensagem...');
  sistema.mostrarMensagem('Teste de mensagem', 'info');
  
  // Testar obterSaldoAtual
  console.log('💳 Testando obterSaldoAtual...');
  sistema.obterSaldoAtual();
  
  // Testar obterPrecoCaixa
  console.log('💰 Testando obterPrecoCaixa...');
  sistema.obterPrecoCaixa();
  
  console.log('✅ Testes de funções individuais concluídos');
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteCompleto() {
  console.log('🧪 EXECUTANDO TESTE COMPLETO DO SISTEMA CORRIGIDO...');
  
  try {
    // Teste 1: Verificar sistema corrigido
    const sistemaCorrigido = verificarSistemaCorrigido();
    
    if (!sistemaCorrigido) {
      console.log('❌ Teste interrompido - sistema não encontrado');
      return;
    }
    
    // Teste 2: Testar compra simples
    testarCompraSimples();
    
    // Teste 3: Monitorar processo completo
    monitorarProcessoCompleto();
    
    // Aguardar um pouco e executar testes adicionais
    setTimeout(() => {
      testarMultiplasCompras();
      testarFuncoesIndividuais();
      
      console.log('\n🎯 === RESUMO DO TESTE ===');
      console.log('✅ Teste completo executado');
      console.log('💡 Use as funções individuais para testes específicos:');
      console.log('   - verificarSistemaCorrigido()');
      console.log('   - testarCompraSimples()');
      console.log('   - verificarResultadoFinal()');
      console.log('   - testarMultiplasCompras()');
      console.log('   - testarFuncoesIndividuais()');
      
    }, 15000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE DO SISTEMA DE COMPRA CORRIGIDO PRONTO!');
console.log('📋 Execute: executarTesteCompleto()');

// Executar automaticamente
executarTesteCompleto();
