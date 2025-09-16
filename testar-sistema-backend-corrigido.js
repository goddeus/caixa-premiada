// 🧪 TESTAR SISTEMA BACKEND CORRIGIDO - SLOTBOX
// Cole este código no console do navegador (F12) para testar o sistema corrigido

console.log('🧪 INICIANDO TESTE DO SISTEMA BACKEND CORRIGIDO...');

// ===== TESTE 1: VERIFICAR SISTEMA CORRIGIDO =====
function verificarSistemaCorrigido() {
  console.log('\n🔍 === VERIFICANDO SISTEMA CORRIGIDO ===');
  
  if (window.sistemaCompraBackendCorrigido) {
    console.log('✅ Sistema de compra corrigido encontrado');
    console.log('   - Instância:', window.sistemaCompraBackendCorrigido);
    console.log('   - Saldo atual:', window.sistemaCompraBackendCorrigido.saldoAtual);
    console.log('   - Preço da caixa:', window.sistemaCompraBackendCorrigido.precoCaixa);
    console.log('   - Case ID:', window.sistemaCompraBackendCorrigido.caseId);
    console.log('   - User ID:', window.sistemaCompraBackendCorrigido.userId);
    console.log('   - Botão encontrado:', !!window.sistemaCompraBackendCorrigido.botaoAbrirCaixa);
    console.log('   - Processando:', window.sistemaCompraBackendCorrigido.isProcessing);
    return true;
  } else {
    console.log('❌ Sistema de compra corrigido não encontrado');
    console.log('💡 Execute primeiro o código "sistema-compra-backend-corrigido.js"');
    return false;
  }
}

// ===== TESTE 2: TESTAR ENDPOINT UNIFICADO =====
async function testarEndpointUnificado() {
  console.log('\n🌐 === TESTANDO ENDPOINT UNIFICADO ===');
  
  const sistema = window.sistemaCompraBackendCorrigido;
  if (!sistema) {
    console.log('❌ Sistema não encontrado');
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Token não encontrado');
    return;
  }
  
  console.log(`🆔 Testando endpoint unificado para Case ID: ${sistema.caseId}`);
  
  // Testar endpoint de compra unificada (buyCase)
  try {
    console.log('🔍 Testando endpoint de compra unificada...');
    const buyResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${sistema.caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📡 Compra Unificada API: ${buyResponse.status} ${buyResponse.statusText}`);
    
    if (buyResponse.ok) {
      const data = await buyResponse.json();
      console.log('✅ Endpoint de compra unificada funcionando');
      console.log('📊 Resposta:', data);
    } else {
      const errorData = await buyResponse.json();
      console.log('⚠️ Endpoint de compra unificada com problemas:', errorData.error || errorData.message);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint de compra unificada:', error.message);
  }
}

// ===== TESTE 3: TESTAR COMPRA CORRIGIDA =====
function testarCompraCorrigida() {
  console.log('\n🛒 === TESTANDO COMPRA CORRIGIDA ===');
  
  const sistema = window.sistemaCompraBackendCorrigido;
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
  
  console.log('🎯 Iniciando teste de compra corrigida...');
  console.log(`   - Saldo antes: R$ ${sistema.saldoAtual.toFixed(2)}`);
  console.log(`   - Preço da caixa: R$ ${sistema.precoCaixa.toFixed(2)}`);
  console.log(`   - Case ID: ${sistema.caseId}`);
  console.log(`   - User ID: ${sistema.userId}`);
  
  // Simular clique
  if (sistema.botaoAbrirCaixa) {
    sistema.botaoAbrirCaixa.click();
    console.log('✅ Clique simulado com sucesso');
  } else {
    console.log('❌ Botão não encontrado');
  }
}

// ===== TESTE 4: MONITORAR PROCESSO CORRIGIDO =====
function monitorarProcessoCorrigido() {
  console.log('\n👀 === MONITORANDO PROCESSO CORRIGIDO ===');
  
  const sistema = window.sistemaCompraBackendCorrigido;
  if (!sistema) return;
  
  let tentativas = 0;
  const maxTentativas = 40; // 20 segundos
  
  const monitor = setInterval(() => {
    tentativas++;
    
    console.log(`📊 Monitoramento ${tentativas}/${maxTentativas}:`);
    console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
    console.log(`   - Saldo atual: R$ ${sistema.saldoAtual.toFixed(2)}`);
    
    if (!sistema.isProcessing && tentativas > 1) {
      console.log('✅ Processo concluído');
      clearInterval(monitor);
      
      // Verificar resultado final
      verificarResultadoCorrigido();
    }
    
    if (tentativas >= maxTentativas) {
      console.log('⏰ Timeout do monitoramento');
      clearInterval(monitor);
    }
  }, 500);
}

// ===== TESTE 5: VERIFICAR RESULTADO CORRIGIDO =====
function verificarResultadoCorrigido() {
  console.log('\n🎯 === VERIFICANDO RESULTADO CORRIGIDO ===');
  
  const sistema = window.sistemaCompraBackendCorrigido;
  if (!sistema) return;
  
  console.log('📊 Resultado final:');
  console.log(`   - Saldo final: R$ ${sistema.saldoAtual.toFixed(2)}`);
  console.log(`   - Processando: ${sistema.isProcessing ? '✅' : '❌'}`);
  console.log(`   - Case ID: ${sistema.caseId}`);
  console.log(`   - User ID: ${sistema.userId}`);
  
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

// ===== TESTE 6: COMPARAR SISTEMAS =====
function compararSistemas() {
  console.log('\n🔄 === COMPARANDO SISTEMAS ===');
  
  const sistemaOriginal = window.sistemaCompraBackend;
  const sistemaCorrigido = window.sistemaCompraBackendCorrigido;
  
  console.log('📊 Comparação dos sistemas:');
  console.log(`   - Sistema original: ${sistemaOriginal ? '✅' : '❌'}`);
  console.log(`   - Sistema corrigido: ${sistemaCorrigido ? '✅' : '❌'}`);
  
  if (sistemaOriginal && sistemaCorrigido) {
    console.log('🔍 Diferenças principais:');
    console.log('   - Original: Usa 3 endpoints separados (debit, draw, credit)');
    console.log('   - Corrigido: Usa 1 endpoint unificado (buyCase)');
    console.log('   - Original: Pode falhar no endpoint de draw (erro 500)');
    console.log('   - Corrigido: Evita problemas de sessão do backend');
  }
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteCorrigidoCompleto() {
  console.log('🧪 EXECUTANDO TESTE COMPLETO DO SISTEMA CORRIGIDO...');
  
  try {
    // Teste 1: Verificar sistema corrigido
    const sistemaCorrigido = verificarSistemaCorrigido();
    
    if (!sistemaCorrigido) {
      console.log('❌ Teste interrompido - sistema não encontrado');
      return;
    }
    
    // Teste 2: Testar endpoint unificado
    await testarEndpointUnificado();
    
    // Teste 3: Testar compra corrigida
    testarCompraCorrigida();
    
    // Teste 4: Monitorar processo corrigido
    monitorarProcessoCorrigido();
    
    // Aguardar um pouco e executar testes adicionais
    setTimeout(() => {
      compararSistemas();
      
      console.log('\n🎯 === RESUMO DO TESTE CORRIGIDO ===');
      console.log('✅ Teste completo do sistema corrigido executado');
      console.log('💡 Use as funções individuais para testes específicos:');
      console.log('   - verificarSistemaCorrigido()');
      console.log('   - testarEndpointUnificado()');
      console.log('   - testarCompraCorrigida()');
      console.log('   - verificarResultadoCorrigido()');
      console.log('   - compararSistemas()');
      
    }, 20000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste corrigido:', error);
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE DO SISTEMA BACKEND CORRIGIDO PRONTO!');
console.log('📋 Execute: executarTesteCorrigidoCompleto()');

// Executar automaticamente
executarTesteCorrigidoCompleto();
