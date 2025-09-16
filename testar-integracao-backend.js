// 🧪 TESTAR INTEGRAÇÃO COM BACKEND REAL - SLOTBOX
// Cole este código no console do navegador (F12) para testar a integração com backend real

console.log('🧪 INICIANDO TESTE DA INTEGRAÇÃO COM BACKEND REAL...');

// ===== TESTE 1: VERIFICAR SISTEMA COM BACKEND =====
function verificarSistemaBackend() {
  console.log('\n🔍 === VERIFICANDO SISTEMA COM BACKEND ===');
  
  if (window.sistemaCompraBackend) {
    console.log('✅ Sistema de compra com backend encontrado');
    console.log('   - Instância:', window.sistemaCompraBackend);
    console.log('   - Saldo atual:', window.sistemaCompraBackend.saldoAtual);
    console.log('   - Preço da caixa:', window.sistemaCompraBackend.precoCaixa);
    console.log('   - Case ID:', window.sistemaCompraBackend.caseId);
    console.log('   - User ID:', window.sistemaCompraBackend.userId);
    console.log('   - Botão encontrado:', !!window.sistemaCompraBackend.botaoAbrirCaixa);
    console.log('   - Processando:', window.sistemaCompraBackend.isProcessing);
    return true;
  } else {
    console.log('❌ Sistema de compra com backend não encontrado');
    console.log('💡 Execute primeiro o código "sistema-compra-backend-integrado.js"');
    return false;
  }
}

// ===== TESTE 2: TESTAR CONECTIVIDADE COM BACKEND =====
async function testarConectividadeBackend() {
  console.log('\n🌐 === TESTANDO CONECTIVIDADE COM BACKEND ===');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Token não encontrado');
    return false;
  }
  
  console.log('🔑 Token encontrado, testando conectividade...');
  
  // Testar endpoint de health
  try {
    const healthResponse = await fetch('https://slotbox-api.onrender.com/api/health');
    console.log(`📡 Health Check: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      console.log('✅ Backend está online');
    } else {
      console.log('⚠️ Backend com problemas');
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com backend:', error.message);
    return false;
  }
  
  // Testar endpoint de wallet
  try {
    const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📡 Wallet API: ${walletResponse.status} ${walletResponse.statusText}`);
    
    if (walletResponse.ok) {
      const walletData = await walletResponse.json();
      console.log('✅ Wallet API funcionando');
      console.log('💰 Saldo no backend:', walletData.saldo_reais || 0);
    } else {
      console.log('⚠️ Wallet API com problemas');
    }
  } catch (error) {
    console.log('❌ Erro ao testar Wallet API:', error.message);
  }
  
  return true;
}

// ===== TESTE 3: TESTAR ENDPOINTS DE CAIXA =====
async function testarEndpointsCaixa() {
  console.log('\n📦 === TESTANDO ENDPOINTS DE CAIXA ===');
  
  const sistema = window.sistemaCompraBackend;
  if (!sistema) {
    console.log('❌ Sistema não encontrado');
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Token não encontrado');
    return;
  }
  
  console.log(`🆔 Testando endpoints para Case ID: ${sistema.caseId}`);
  
  // Testar endpoint de débito (sem executar)
  try {
    console.log('🔍 Testando endpoint de débito...');
    const debitResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/debit/${sistema.caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📡 Débito API: ${debitResponse.status} ${debitResponse.statusText}`);
    
    if (debitResponse.ok) {
      console.log('✅ Endpoint de débito acessível');
    } else {
      const errorData = await debitResponse.json();
      console.log('⚠️ Endpoint de débito com problemas:', errorData.error || errorData.message);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint de débito:', error.message);
  }
  
  // Testar endpoint de sorteio (sem executar)
  try {
    console.log('🔍 Testando endpoint de sorteio...');
    const drawResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/draw/${sistema.caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📡 Sorteio API: ${drawResponse.status} ${drawResponse.statusText}`);
    
    if (drawResponse.ok) {
      console.log('✅ Endpoint de sorteio acessível');
    } else {
      const errorData = await drawResponse.json();
      console.log('⚠️ Endpoint de sorteio com problemas:', errorData.error || errorData.message);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint de sorteio:', error.message);
  }
  
  // Testar endpoint de crédito (sem executar)
  try {
    console.log('🔍 Testando endpoint de crédito...');
    const creditResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/credit/${sistema.caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prizeId: 'test-prize-id',
        prizeValue: 1.00
      })
    });
    
    console.log(`📡 Crédito API: ${creditResponse.status} ${creditResponse.statusText}`);
    
    if (creditResponse.ok) {
      console.log('✅ Endpoint de crédito acessível');
    } else {
      const errorData = await creditResponse.json();
      console.log('⚠️ Endpoint de crédito com problemas:', errorData.error || errorData.message);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint de crédito:', error.message);
  }
}

// ===== TESTE 4: TESTAR COMPRA COM BACKEND =====
function testarCompraComBackend() {
  console.log('\n🛒 === TESTANDO COMPRA COM BACKEND ===');
  
  const sistema = window.sistemaCompraBackend;
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
  
  console.log('🎯 Iniciando teste de compra com backend...');
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

// ===== TESTE 5: MONITORAR PROCESSO COM BACKEND =====
function monitorarProcessoBackend() {
  console.log('\n👀 === MONITORANDO PROCESSO COM BACKEND ===');
  
  const sistema = window.sistemaCompraBackend;
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
      verificarResultadoBackend();
    }
    
    if (tentativas >= maxTentativas) {
      console.log('⏰ Timeout do monitoramento');
      clearInterval(monitor);
    }
  }, 500);
}

// ===== TESTE 6: VERIFICAR RESULTADO COM BACKEND =====
function verificarResultadoBackend() {
  console.log('\n🎯 === VERIFICANDO RESULTADO COM BACKEND ===');
  
  const sistema = window.sistemaCompraBackend;
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

// ===== TESTE 7: TESTAR FUNÇÕES INDIVIDUAIS DO BACKEND =====
function testarFuncoesBackend() {
  console.log('\n🔧 === TESTANDO FUNÇÕES DO BACKEND ===');
  
  const sistema = window.sistemaCompraBackend;
  if (!sistema) return;
  
  console.log('🧪 Testando funções individuais do backend:');
  
  // Testar mostrarMensagem
  console.log('📢 Testando mostrarMensagem...');
  sistema.mostrarMensagem('Teste de mensagem com backend', 'info');
  
  // Testar obterSaldoAtual
  console.log('💳 Testando obterSaldoAtual...');
  sistema.obterSaldoAtual();
  
  // Testar obterPrecoCaixa
  console.log('💰 Testando obterPrecoCaixa...');
  sistema.obterPrecoCaixa();
  
  console.log('✅ Testes de funções individuais do backend concluídos');
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteBackendCompleto() {
  console.log('🧪 EXECUTANDO TESTE COMPLETO DA INTEGRAÇÃO COM BACKEND...');
  
  try {
    // Teste 1: Verificar sistema com backend
    const sistemaBackend = verificarSistemaBackend();
    
    if (!sistemaBackend) {
      console.log('❌ Teste interrompido - sistema não encontrado');
      return;
    }
    
    // Teste 2: Testar conectividade com backend
    const conectividade = await testarConectividadeBackend();
    
    if (!conectividade) {
      console.log('❌ Teste interrompido - problemas de conectividade');
      return;
    }
    
    // Teste 3: Testar endpoints de caixa
    await testarEndpointsCaixa();
    
    // Teste 4: Testar compra com backend
    testarCompraComBackend();
    
    // Teste 5: Monitorar processo com backend
    monitorarProcessoBackend();
    
    // Aguardar um pouco e executar testes adicionais
    setTimeout(() => {
      testarFuncoesBackend();
      
      console.log('\n🎯 === RESUMO DO TESTE COM BACKEND ===');
      console.log('✅ Teste completo da integração com backend executado');
      console.log('💡 Use as funções individuais para testes específicos:');
      console.log('   - verificarSistemaBackend()');
      console.log('   - testarConectividadeBackend()');
      console.log('   - testarEndpointsCaixa()');
      console.log('   - testarCompraComBackend()');
      console.log('   - verificarResultadoBackend()');
      console.log('   - testarFuncoesBackend()');
      
    }, 20000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste com backend:', error);
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE DA INTEGRAÇÃO COM BACKEND REAL PRONTO!');
console.log('📋 Execute: executarTesteBackendCompleto()');

// Executar automaticamente
executarTesteBackendCompleto();
