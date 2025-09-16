// 🧪 TESTAR SISTEMA DE COMPRA IMPLEMENTADO - SLOTBOX
// Cole este código no console do navegador (F12) para testar o sistema implementado

console.log('🧪 INICIANDO TESTE DO SISTEMA DE COMPRA IMPLEMENTADO...');

// ===== TESTE 1: VERIFICAR SE O SISTEMA FOI IMPLEMENTADO =====
function verificarSistemaImplementado() {
  console.log('\n🔍 === VERIFICANDO SISTEMA IMPLEMENTADO ===');
  
  if (window.sistemaCompraMelhorado) {
    console.log('✅ Sistema de compra melhorado encontrado');
    console.log('   - Instância:', window.sistemaCompraMelhorado);
    console.log('   - Saldo atual:', window.sistemaCompraMelhorado.saldoAtual);
    console.log('   - Preço da caixa:', window.sistemaCompraMelhorado.precoCaixa);
    console.log('   - Botão encontrado:', !!window.sistemaCompraMelhorado.botaoAbrirCaixa);
    return true;
  } else {
    console.log('❌ Sistema de compra melhorado não encontrado');
    console.log('💡 Execute primeiro o código "implementar-sistema-compra-melhorado.js"');
    return false;
  }
}

// ===== TESTE 2: VERIFICAR ESTADO ATUAL =====
function verificarEstadoAtual() {
  console.log('\n📊 === VERIFICANDO ESTADO ATUAL ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  console.log('📋 Estado atual do sistema:');
  console.log(`   - Saldo atual: R$ ${sistema.saldoAtual.toFixed(2)}`);
  console.log(`   - Preço da caixa: R$ ${sistema.precoCaixa.toFixed(2)}`);
  console.log(`   - Botão encontrado: ${sistema.botaoAbrirCaixa ? '✅' : '❌'}`);
  console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
  
  // Verificar se há saldo suficiente
  if (sistema.saldoAtual >= sistema.precoCaixa) {
    console.log('✅ Saldo suficiente para compra');
  } else {
    console.log('❌ Saldo insuficiente para compra');
    console.log(`   - Necessário: R$ ${sistema.precoCaixa.toFixed(2)}`);
    console.log(`   - Disponível: R$ ${sistema.saldoAtual.toFixed(2)}`);
  }
}

// ===== TESTE 3: SIMULAR COMPRA =====
function simularCompra() {
  console.log('\n🛒 === SIMULANDO COMPRA ===');
  
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
    return;
  }
  
  console.log('🎯 Simulando clique no botão "Abrir Caixa"...');
  
  // Simular clique
  if (sistema.botaoAbrirCaixa) {
    sistema.botaoAbrirCaixa.click();
    console.log('✅ Clique simulado com sucesso');
  } else {
    console.log('❌ Botão não encontrado');
  }
}

// ===== TESTE 4: MONITORAR PROCESSO =====
function monitorarProcesso() {
  console.log('\n👀 === MONITORANDO PROCESSO ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  let tentativas = 0;
  const maxTentativas = 20; // 10 segundos
  
  const monitor = setInterval(() => {
    tentativas++;
    
    console.log(`📊 Monitoramento ${tentativas}/${maxTentativas}:`);
    console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
    console.log(`   - Saldo atual: R$ ${sistema.saldoAtual.toFixed(2)}`);
    
    if (!sistema.isProcessing && tentativas > 1) {
      console.log('✅ Processo concluído');
      clearInterval(monitor);
    }
    
    if (tentativas >= maxTentativas) {
      console.log('⏰ Timeout do monitoramento');
      clearInterval(monitor);
    }
  }, 500);
}

// ===== TESTE 5: VERIFICAR RESULTADO =====
function verificarResultado() {
  console.log('\n🎯 === VERIFICANDO RESULTADO ===');
  
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

// ===== TESTE 6: TESTE DE MÚLTIPLAS COMPRAS =====
function testarMultiplasCompras() {
  console.log('\n🔄 === TESTANDO MÚLTIPLAS COMPRAS ===');
  
  const sistema = window.sistemaCompraMelhorado;
  if (!sistema) return;
  
  const saldoInicial = sistema.saldoAtual;
  const precoCaixa = sistema.precoCaixa;
  const maxCompras = Math.floor(saldoInicial / precoCaixa);
  
  console.log(`💰 Saldo inicial: R$ ${saldoInicial.toFixed(2)}`);
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

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteCompleto() {
  console.log('🧪 EXECUTANDO TESTE COMPLETO DO SISTEMA...');
  
  try {
    // Teste 1: Verificar se o sistema foi implementado
    const sistemaImplementado = verificarSistemaImplementado();
    
    if (!sistemaImplementado) {
      console.log('❌ Teste interrompido - sistema não implementado');
      return;
    }
    
    // Teste 2: Verificar estado atual
    verificarEstadoAtual();
    
    // Teste 3: Simular compra
    simularCompra();
    
    // Teste 4: Monitorar processo
    monitorarProcesso();
    
    // Aguardar um pouco e verificar resultado
    setTimeout(() => {
      verificarResultado();
      testarMultiplasCompras();
      
      console.log('\n🎯 === RESUMO DO TESTE ===');
      console.log('✅ Teste completo executado');
      console.log('💡 Use as funções individuais para testes específicos:');
      console.log('   - verificarSistemaImplementado()');
      console.log('   - verificarEstadoAtual()');
      console.log('   - simularCompra()');
      console.log('   - verificarResultado()');
      console.log('   - testarMultiplasCompras()');
      
    }, 12000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE DO SISTEMA DE COMPRA IMPLEMENTADO PRONTO!');
console.log('📋 Execute: executarTesteCompleto()');

// Executar automaticamente
executarTesteCompleto();
