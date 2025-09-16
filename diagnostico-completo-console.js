// 🔍 DIAGNÓSTICO COMPLETO DO SLOTBOX - CONSOLE DO NAVEGADOR
// Cole este código no console do navegador (F12) para diagnosticar todos os problemas

console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DO SLOTBOX...');

// ===== CONFIGURAÇÕES =====
const API_BASE = 'https://slotbox-api.onrender.com';
const FRONTEND_BASE = window.location.origin;

// ===== FUNÇÕES DE DIAGNÓSTICO =====
async function diagnosticarAPI(endpoint, method = 'GET', data = null, headers = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const result = {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    };
    
    try {
      const text = await response.text();
      result.responseText = text;
      
      try {
        result.data = JSON.parse(text);
      } catch {
        result.data = text;
      }
    } catch (e) {
      result.error = e.message;
    }
    
    return result;
  } catch (error) {
    return {
      endpoint,
      method,
      error: error.message,
      status: 'NETWORK_ERROR'
    };
  }
}

// ===== DIAGNÓSTICO 1: INFORMAÇÕES BÁSICAS =====
function diagnosticarInformacoesBasicas() {
  console.log('\n📋 === INFORMAÇÕES BÁSICAS ===');
  
  const info = {
    url: window.location.href,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    localStorage: {
      token: !!localStorage.getItem('token'),
      user: !!localStorage.getItem('user'),
      tokenValue: localStorage.getItem('token'),
      userValue: localStorage.getItem('user')
    },
    sessionStorage: {
      keys: Object.keys(sessionStorage),
      values: Object.values(sessionStorage)
    }
  };
  
  console.log('🌐 URL atual:', info.url);
  console.log('🏠 Hostname:', info.hostname);
  console.log('🛣️ Pathname:', info.pathname);
  console.log('🔑 Token no localStorage:', info.localStorage.token ? '✅ Presente' : '❌ Ausente');
  console.log('👤 Usuário no localStorage:', info.localStorage.user ? '✅ Presente' : '❌ Ausente');
  
  if (info.localStorage.token) {
    try {
      const userData = JSON.parse(info.localStorage.userValue);
      console.log('👤 Dados do usuário:', userData);
    } catch (e) {
      console.log('❌ Dados do usuário corrompidos:', e.message);
    }
  }
  
  return info;
}

// ===== DIAGNÓSTICO 2: CONECTIVIDADE =====
async function diagnosticarConectividade() {
  console.log('\n🌐 === DIAGNÓSTICO DE CONECTIVIDADE ===');
  
  const testes = [
    { endpoint: '/api/health', name: 'Health Check', expected: 200 },
    { endpoint: '/api/cases', name: 'Lista de Caixas', expected: 200 },
    { endpoint: '/api/auth/me', name: 'Auth Me (sem token)', expected: 401 },
    { endpoint: '/api/wallet/', name: 'Wallet (sem token)', expected: 401 },
    { endpoint: '/api/transactions', name: 'Transactions (sem token)', expected: 401 },
    { endpoint: '/api/admin/dashboard/stats', name: 'Admin Stats (sem token)', expected: 401 },
    { endpoint: '/api/affiliate/me', name: 'Affiliate Me (sem token)', expected: 401 },
    { endpoint: '/api/payments/history', name: 'Payments History (sem token)', expected: 401 }
  ];
  
  const resultados = [];
  
  for (const teste of testes) {
    console.log(`🔍 Testando: ${teste.name} (${teste.endpoint})`);
    const resultado = await diagnosticarAPI(teste.endpoint);
    resultados.push({ ...teste, ...resultado });
    
    if (resultado.ok) {
      console.log(`✅ ${teste.name}: ${resultado.status} - OK`);
    } else if (resultado.status === 401) {
      console.log(`🔒 ${teste.name}: ${resultado.status} - UNAUTHORIZED (esperado sem token)`);
    } else if (resultado.status === 404) {
      console.log(`❌ ${teste.name}: ${resultado.status} - NOT FOUND`);
    } else if (resultado.status === 'NETWORK_ERROR') {
      console.log(`❌ ${teste.name}: ERRO DE REDE - ${resultado.error}`);
    } else {
      console.log(`⚠️ ${teste.name}: ${resultado.status} - ${resultado.statusText}`);
    }
  }
  
  return resultados;
}

// ===== DIAGNÓSTICO 3: FRONTEND =====
function diagnosticarFrontend() {
  console.log('\n🖥️ === DIAGNÓSTICO DO FRONTEND ===');
  
  const problemas = [];
  const sucessos = [];
  
  // Verificar se está no domínio correto
  if (window.location.hostname !== 'slotbox.shop') {
    problemas.push(`❌ Domínio incorreto: ${window.location.hostname} (deveria ser slotbox.shop)`);
  } else {
    sucessos.push('✅ Domínio correto: slotbox.shop');
  }
  
  // Verificar localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token) {
    sucessos.push('✅ Token encontrado no localStorage');
    try {
      const userData = JSON.parse(user);
      sucessos.push('✅ Dados do usuário válidos no localStorage');
    } catch (e) {
      problemas.push('❌ Dados do usuário corrompidos no localStorage');
    }
  } else {
    problemas.push('❌ Token não encontrado no localStorage');
  }
  
  // Verificar se a API está configurada
  if (window.api) {
    sucessos.push('✅ API Service encontrado no window');
  } else {
    problemas.push('❌ API Service não encontrado no window');
  }
  
  // Verificar se React Router está funcionando
  if (window.location.pathname) {
    sucessos.push(`✅ Rota atual: ${window.location.pathname}`);
  }
  
  // Verificar se as caixas estão sendo exibidas
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  if (caixas.length === 0) {
    problemas.push('❌ Nenhuma caixa encontrada na página');
  } else {
    sucessos.push(`✅ ${caixas.length} caixas encontradas na página`);
  }
  
  // Verificar se as imagens estão carregando
  const imagens = document.querySelectorAll('img');
  let imagensCarregadas = 0;
  let imagensComErro = 0;
  
  imagens.forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      imagensCarregadas++;
    } else if (img.complete) {
      imagensComErro++;
    }
  });
  
  if (imagensComErro > 0) {
    problemas.push(`❌ ${imagensComErro} imagens com erro de carregamento`);
  } else {
    sucessos.push(`✅ ${imagensCarregadas} imagens carregadas corretamente`);
  }
  
  // Verificar se há erros no console
  const consoleErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Verificar se há warnings no console
  const consoleWarnings = [];
  const originalWarn = console.warn;
  console.warn = function(...args) {
    consoleWarnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };
  
  if (consoleErrors.length > 0) {
    problemas.push(`❌ ${consoleErrors.length} erros no console`);
    consoleErrors.forEach(error => {
      problemas.push(`   - ${error}`);
    });
  } else {
    sucessos.push('✅ Nenhum erro no console');
  }
  
  if (consoleWarnings.length > 0) {
    problemas.push(`⚠️ ${consoleWarnings.length} warnings no console`);
    consoleWarnings.forEach(warning => {
      problemas.push(`   - ${warning}`);
    });
  } else {
    sucessos.push('✅ Nenhum warning no console');
  }
  
  // Restaurar funções originais
  console.error = originalError;
  console.warn = originalWarn;
  
  return { problemas, sucessos };
}

// ===== DIAGNÓSTICO 4: NAVEGAÇÃO =====
function diagnosticarNavegacao() {
  console.log('\n🛣️ === DIAGNÓSTICO DE NAVEGAÇÃO ===');
  
  const problemas = [];
  const sucessos = [];
  
  // Verificar se estamos no Dashboard
  if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
    sucessos.push('✅ Estamos no Dashboard');
    
    // Verificar se as caixas têm onClick
    const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
    if (caixas.length > 0) {
      caixas.forEach((caixa, index) => {
        const hasOnClick = caixa.onclick !== null;
        const hasCursorPointer = window.getComputedStyle(caixa).cursor === 'pointer';
        const hasTransition = caixa.classList.toString().includes('transition') || 
                             caixa.classList.toString().includes('hover');
        
        if (hasOnClick) {
          sucessos.push(`✅ Caixa ${index + 1} tem onClick`);
        } else {
          problemas.push(`❌ Caixa ${index + 1} não tem onClick`);
        }
        
        if (hasCursorPointer) {
          sucessos.push(`✅ Caixa ${index + 1} tem cursor pointer`);
        } else {
          problemas.push(`❌ Caixa ${index + 1} não tem cursor pointer`);
        }
        
        if (hasTransition) {
          sucessos.push(`✅ Caixa ${index + 1} tem transição`);
        } else {
          problemas.push(`❌ Caixa ${index + 1} não tem transição`);
        }
      });
    } else {
      problemas.push('❌ Nenhuma caixa encontrada para testar navegação');
    }
  } else {
    problemas.push(`❌ Não estamos no Dashboard. Rota atual: ${window.location.pathname}`);
  }
  
  return { problemas, sucessos };
}

// ===== DIAGNÓSTICO 5: AUTENTICAÇÃO =====
async function diagnosticarAutenticacao() {
  console.log('\n🔐 === DIAGNÓSTICO DE AUTENTICAÇÃO ===');
  
  const problemas = [];
  const sucessos = [];
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token) {
    problemas.push('❌ Token não encontrado no localStorage');
    return { problemas, sucessos };
  }
  
  sucessos.push('✅ Token encontrado no localStorage');
  
  // Testar autenticação com token
  const headers = { 'Authorization': `Bearer ${token}` };
  
  try {
    const resultado = await diagnosticarAPI('/api/auth/me', 'GET', null, headers);
    
    if (resultado.ok) {
      sucessos.push('✅ Autenticação com token funcionando');
    } else {
      problemas.push(`❌ Autenticação com token falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar autenticação: ${error.message}`);
  }
  
  // Testar outras rotas protegidas
  const rotasProtegidas = [
    { endpoint: '/api/wallet/', name: 'Wallet' },
    { endpoint: '/api/transactions', name: 'Transactions' },
    { endpoint: '/api/affiliate/me', name: 'Affiliate Me' },
    { endpoint: '/api/payments/history', name: 'Payments History' }
  ];
  
  for (const rota of rotasProtegidas) {
    try {
      const resultado = await diagnosticarAPI(rota.endpoint, 'GET', null, headers);
      
      if (resultado.ok) {
        sucessos.push(`✅ ${rota.name} funcionando com token`);
      } else {
        problemas.push(`❌ ${rota.name} falhou com token: ${resultado.status}`);
      }
    } catch (error) {
      problemas.push(`❌ Erro ao testar ${rota.name}: ${error.message}`);
    }
  }
  
  return { problemas, sucessos };
}

// ===== DIAGNÓSTICO 6: SISTEMA DE CAIXAS =====
async function diagnosticarSistemaCaixas() {
  console.log('\n📦 === DIAGNÓSTICO DO SISTEMA DE CAIXAS ===');
  
  const problemas = [];
  const sucessos = [];
  
  try {
    const resultado = await diagnosticarAPI('/api/cases');
    
    if (resultado.ok && resultado.data?.success) {
      sucessos.push('✅ API de caixas funcionando');
      
      const caixas = resultado.data.data || resultado.data;
      if (caixas && caixas.length > 0) {
        sucessos.push(`✅ ${caixas.length} caixas encontradas na API`);
        
        // Verificar se cada caixa tem os campos necessários
        caixas.forEach((caixa, index) => {
          if (caixa.id) {
            sucessos.push(`✅ Caixa ${index + 1} tem ID: ${caixa.id}`);
          } else {
            problemas.push(`❌ Caixa ${index + 1} não tem ID`);
          }
          
          if (caixa.nome) {
            sucessos.push(`✅ Caixa ${index + 1} tem nome: ${caixa.nome}`);
          } else {
            problemas.push(`❌ Caixa ${index + 1} não tem nome`);
          }
          
          if (caixa.preco) {
            sucessos.push(`✅ Caixa ${index + 1} tem preço: R$ ${caixa.preco}`);
          } else {
            problemas.push(`❌ Caixa ${index + 1} não tem preço`);
          }
          
          if (caixa.imagem || caixa.imagem_url) {
            sucessos.push(`✅ Caixa ${index + 1} tem imagem`);
          } else {
            problemas.push(`❌ Caixa ${index + 1} não tem imagem`);
          }
        });
      } else {
        problemas.push('❌ Nenhuma caixa encontrada na API');
      }
    } else {
      problemas.push(`❌ API de caixas falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar API de caixas: ${error.message}`);
  }
  
  return { problemas, sucessos };
}

// ===== DIAGNÓSTICO 7: SISTEMA FINANCEIRO =====
async function diagnosticarSistemaFinanceiro() {
  console.log('\n💰 === DIAGNÓSTICO DO SISTEMA FINANCEIRO ===');
  
  const problemas = [];
  const sucessos = [];
  
  const token = localStorage.getItem('token');
  if (!token) {
    problemas.push('❌ Token não encontrado - pulando testes financeiros');
    return { problemas, sucessos };
  }
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Testar consulta de saldo
  try {
    const resultado = await diagnosticarAPI('/api/wallet/', 'GET', null, headers);
    
    if (resultado.ok) {
      sucessos.push('✅ Consulta de saldo funcionando');
    } else {
      problemas.push(`❌ Consulta de saldo falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar consulta de saldo: ${error.message}`);
  }
  
  // Testar histórico de transações
  try {
    const resultado = await diagnosticarAPI('/api/transactions', 'GET', null, headers);
    
    if (resultado.ok) {
      sucessos.push('✅ Histórico de transações funcionando');
    } else {
      problemas.push(`❌ Histórico de transações falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar histórico de transações: ${error.message}`);
  }
  
  // Testar criação de depósito (simulação)
  try {
    const dadosDeposito = {
      userId: 'test',
      amount: 20.00
    };
    
    const resultado = await diagnosticarAPI('/api/payments/deposit/pix', 'POST', dadosDeposito, headers);
    
    if (resultado.ok) {
      sucessos.push('✅ Criação de depósito PIX funcionando');
    } else {
      problemas.push(`❌ Criação de depósito PIX falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar criação de depósito: ${error.message}`);
  }
  
  // Testar solicitação de saque (simulação)
  try {
    const dadosSaque = {
      valor: 20.00,
      pix_key: 'teste@exemplo.com',
      pix_key_type: 'email'
    };
    
    const resultado = await diagnosticarAPI('/api/payments/withdraw', 'POST', dadosSaque, headers);
    
    if (resultado.ok) {
      sucessos.push('✅ Solicitação de saque funcionando');
    } else {
      problemas.push(`❌ Solicitação de saque falhou: ${resultado.status}`);
    }
  } catch (error) {
    problemas.push(`❌ Erro ao testar solicitação de saque: ${error.message}`);
  }
  
  return { problemas, sucessos };
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarDiagnosticoCompleto() {
  console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DO SLOTBOX...');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    informacoesBasicas: null,
    conectividade: [],
    frontend: null,
    navegacao: null,
    autenticacao: null,
    sistemaCaixas: null,
    sistemaFinanceiro: null,
    problemas: [],
    sucessos: []
  };
  
  try {
    // Diagnóstico 1: Informações básicas
    console.log('\n📋 === DIAGNÓSTICO 1: INFORMAÇÕES BÁSICAS ===');
    resultados.informacoesBasicas = diagnosticarInformacoesBasicas();
    
    // Diagnóstico 2: Conectividade
    console.log('\n🌐 === DIAGNÓSTICO 2: CONECTIVIDADE ===');
    resultados.conectividade = await diagnosticarConectividade();
    
    // Diagnóstico 3: Frontend
    console.log('\n🖥️ === DIAGNÓSTICO 3: FRONTEND ===');
    resultados.frontend = diagnosticarFrontend();
    
    // Diagnóstico 4: Navegação
    console.log('\n🛣️ === DIAGNÓSTICO 4: NAVEGAÇÃO ===');
    resultados.navegacao = diagnosticarNavegacao();
    
    // Diagnóstico 5: Autenticação
    console.log('\n🔐 === DIAGNÓSTICO 5: AUTENTICAÇÃO ===');
    resultados.autenticacao = await diagnosticarAutenticacao();
    
    // Diagnóstico 6: Sistema de Caixas
    console.log('\n📦 === DIAGNÓSTICO 6: SISTEMA DE CAIXAS ===');
    resultados.sistemaCaixas = await diagnosticarSistemaCaixas();
    
    // Diagnóstico 7: Sistema Financeiro
    console.log('\n💰 === DIAGNÓSTICO 7: SISTEMA FINANCEIRO ===');
    resultados.sistemaFinanceiro = await diagnosticarSistemaFinanceiro();
    
    // Análise dos resultados
    console.log('\n📊 === ANÁLISE DOS RESULTADOS ===');
    
    // Coletar todos os problemas e sucessos
    if (resultados.frontend) {
      resultados.problemas.push(...resultados.frontend.problemas);
      resultados.sucessos.push(...resultados.frontend.sucessos);
    }
    
    if (resultados.navegacao) {
      resultados.problemas.push(...resultados.navegacao.problemas);
      resultados.sucessos.push(...resultados.navegacao.sucessos);
    }
    
    if (resultados.autenticacao) {
      resultados.problemas.push(...resultados.autenticacao.problemas);
      resultados.sucessos.push(...resultados.autenticacao.sucessos);
    }
    
    if (resultados.sistemaCaixas) {
      resultados.problemas.push(...resultados.sistemaCaixas.problemas);
      resultados.sucessos.push(...resultados.sistemaCaixas.sucessos);
    }
    
    if (resultados.sistemaFinanceiro) {
      resultados.problemas.push(...resultados.sistemaFinanceiro.problemas);
      resultados.sucessos.push(...resultados.sistemaFinanceiro.sucessos);
    }
    
    // Contar problemas de conectividade
    const rotasComProblema = resultados.conectividade.filter(r => r.status === 'NETWORK_ERROR' || (r.status !== 200 && r.status !== 401));
    if (rotasComProblema.length > 0) {
      console.log(`❌ ${rotasComProblema.length} problemas de conectividade:`);
      rotasComProblema.forEach(problema => {
        console.log(`   - ${problema.endpoint}: ${problema.status} - ${problema.statusText || problema.error}`);
        resultados.problemas.push(`Conectividade: ${problema.endpoint} - ${problema.status}`);
      });
    } else {
      console.log('✅ Conectividade OK!');
      resultados.sucessos.push('Conectividade: Todas as rotas funcionando');
    }
    
    // Resumo final
    console.log('\n🎯 === RESUMO FINAL ===');
    console.log(`✅ Sucessos: ${resultados.sucessos.length}`);
    console.log(`❌ Problemas: ${resultados.problemas.length}`);
    
    if (resultados.problemas.length === 0) {
      console.log('🎉 SISTEMA 100% FUNCIONAL!');
    } else {
      console.log('⚠️ SISTEMA COM PROBLEMAS - VERIFICAR CORREÇÕES NECESSÁRIAS');
      console.log('\n📋 LISTA DE PROBLEMAS:');
      resultados.problemas.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema}`);
      });
    }
    
    // Salvar resultados para análise
    window.diagnosticoCompletoResultados = resultados;
    console.log('\n💾 Resultados salvos em window.diagnosticoCompletoResultados');
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    return { error: error.message };
  }
}

// ===== EXECUTAR DIAGNÓSTICO =====
console.log('🔍 DIAGNÓSTICO COMPLETO DO SLOTBOX PRONTO!');
console.log('📋 Execute: executarDiagnosticoCompleto()');
console.log('📊 Ou execute: await executarDiagnosticoCompleto()');

// Executar automaticamente
executarDiagnosticoCompleto().then(resultados => {
  console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO!');
  console.log('📋 Resumo dos resultados:', resultados);
});
