// 🔍 DIAGNÓSTICO COMPLETO DO SLOTBOX - COLE NO CONSOLE DO NAVEGADOR
// Execute este código no console do navegador para descobrir todos os problemas

console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DO SLOTBOX...');

// ===== CONFIGURAÇÕES =====
const API_BASE = 'https://slotbox-api.onrender.com';
const FRONTEND_BASE = 'https://slotbox.shop';

// ===== FUNÇÕES DE TESTE =====
async function testarEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
      
      // Tentar parsear como JSON
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

// ===== TESTES DE CONECTIVIDADE =====
async function testarConectividade() {
  console.log('\n📡 TESTANDO CONECTIVIDADE...');
  
  const testes = [
    { endpoint: '/api/health', name: 'Health Check' },
    { endpoint: '/api/cases', name: 'Lista de Caixas' },
    { endpoint: '/api/auth/me', name: 'Auth Me (sem token)' },
    { endpoint: '/api/wallet/', name: 'Wallet (sem token)' },
    { endpoint: '/api/profile/', name: 'Profile (sem token)' },
    { endpoint: '/api/transactions', name: 'Transactions (sem token)' },
    { endpoint: '/api/prizes/stats', name: 'Prize Stats (sem token)' },
    { endpoint: '/api/admin/dashboard/stats', name: 'Admin Stats (sem token)' },
    { endpoint: '/api/affiliate/me', name: 'Affiliate Me (sem token)' },
    { endpoint: '/api/payments/history', name: 'Payments History (sem token)' }
  ];
  
  const resultados = [];
  
  for (const teste of testes) {
    console.log(`🔍 Testando: ${teste.name} (${teste.endpoint})`);
    const resultado = await testarEndpoint(teste.endpoint);
    resultados.push({ ...teste, ...resultado });
    
    // Log do resultado
    if (resultado.ok) {
      console.log(`✅ ${teste.name}: ${resultado.status} - OK`);
    } else if (resultado.status === 401) {
      console.log(`🔒 ${teste.name}: ${resultado.status} - UNAUTHORIZED (esperado sem token)`);
    } else if (resultado.status === 404) {
      console.log(`❌ ${teste.name}: ${resultado.status} - NOT FOUND`);
    } else {
      console.log(`⚠️ ${teste.name}: ${resultado.status} - ${resultado.statusText}`);
    }
  }
  
  return resultados;
}

// ===== TESTES DE FRONTEND =====
async function testarFrontend() {
  console.log('\n🖥️ TESTANDO FRONTEND...');
  
  const problemas = [];
  
  // Verificar se está no domínio correto
  if (window.location.hostname !== 'slotbox.shop') {
    problemas.push(`❌ Domínio incorreto: ${window.location.hostname} (deveria ser slotbox.shop)`);
  }
  
  // Verificar localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log(`🔑 Token no localStorage: ${token ? 'Presente' : 'Ausente'}`);
  console.log(`👤 Usuário no localStorage: ${user ? 'Presente' : 'Ausente'}`);
  
  if (token) {
    try {
      const userData = JSON.parse(user);
      console.log(`👤 Dados do usuário:`, userData);
    } catch (e) {
      problemas.push('❌ Dados do usuário corrompidos no localStorage');
    }
  }
  
  // Verificar se a API está configurada corretamente
  if (window.api) {
    console.log('🔧 API Service encontrado no window');
  } else {
    problemas.push('❌ API Service não encontrado no window');
  }
  
  // Verificar erros no console
  const consoleErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  return { problemas, consoleErrors };
}

// ===== TESTES DE ROTAS ESPECÍFICAS =====
async function testarRotasEspecificas() {
  console.log('\n🛣️ TESTANDO ROTAS ESPECÍFICAS...');
  
  const rotas = [
    // Rotas públicas
    { endpoint: '/api/health', expected: 200 },
    { endpoint: '/api/cases', expected: 200 },
    
    // Rotas que precisam de auth
    { endpoint: '/api/auth/me', expected: 401 },
    { endpoint: '/api/wallet/', expected: 401 },
    { endpoint: '/api/profile/', expected: 401 },
    { endpoint: '/api/transactions', expected: 401 },
    { endpoint: '/api/prizes/stats', expected: 401 },
    
    // Rotas admin
    { endpoint: '/api/admin/dashboard/stats', expected: 401 },
    { endpoint: '/api/admin/users', expected: 401 },
    
    // Rotas de afiliado
    { endpoint: '/api/affiliate/me', expected: 401 },
    { endpoint: '/api/affiliate/stats', expected: 401 },
    
    // Rotas de pagamento
    { endpoint: '/api/payments/history', expected: 401 },
    { endpoint: '/api/payments/deposit', method: 'POST', expected: 401 },
    { endpoint: '/api/payments/withdraw', method: 'POST', expected: 401 }
  ];
  
  const resultados = [];
  
  for (const rota of rotas) {
    const resultado = await testarEndpoint(rota.endpoint, rota.method || 'GET');
    const statusEsperado = rota.expected;
    const statusReal = resultado.status;
    
    let status = '✅';
    if (statusReal !== statusEsperado) {
      status = '❌';
    }
    
    console.log(`${status} ${rota.endpoint}: ${statusReal} (esperado: ${statusEsperado})`);
    
    resultados.push({
      ...rota,
      ...resultado,
      statusEsperado,
      correto: statusReal === statusEsperado
    });
  }
  
  return resultados;
}

// ===== TESTES DE CORS =====
async function testarCORS() {
  console.log('\n🌐 TESTANDO CORS...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_BASE,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
    };
    
    console.log('🔧 CORS Headers:', corsHeaders);
    
    return {
      ok: response.ok,
      status: response.status,
      headers: corsHeaders
    };
  } catch (error) {
    console.log('❌ Erro no teste CORS:', error.message);
    return { error: error.message };
  }
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarDiagnosticoCompleto() {
  console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    frontend: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      localStorage: {
        token: !!localStorage.getItem('token'),
        user: !!localStorage.getItem('user')
      }
    },
    conectividade: [],
    rotas: [],
    cors: null,
    problemas: []
  };
  
  try {
    // Teste de conectividade
    resultados.conectividade = await testarConectividade();
    
    // Teste de rotas específicas
    resultados.rotas = await testarRotasEspecificas();
    
    // Teste de CORS
    resultados.cors = await testarCORS();
    
    // Teste de frontend
    const frontendTest = await testarFrontend();
    resultados.problemas = frontendTest.problemas;
    
    // Análise dos resultados
    console.log('\n📊 ANÁLISE DOS RESULTADOS:');
    
    const rotasComProblema = resultados.rotas.filter(r => !r.correto);
    if (rotasComProblema.length > 0) {
      console.log(`❌ ${rotasComProblema.length} rotas com problemas:`);
      rotasComProblema.forEach(rota => {
        console.log(`   - ${rota.endpoint}: ${rota.status} (esperado: ${rota.statusEsperado})`);
      });
    } else {
      console.log('✅ Todas as rotas estão funcionando corretamente!');
    }
    
    const problemasConectividade = resultados.conectividade.filter(r => r.status === 'NETWORK_ERROR' || (r.status !== 200 && r.status !== 401));
    if (problemasConectividade.length > 0) {
      console.log(`❌ ${problemasConectividade.length} problemas de conectividade:`);
      problemasConectividade.forEach(problema => {
        console.log(`   - ${problema.endpoint}: ${problema.status} - ${problema.statusText || problema.error}`);
      });
    } else {
      console.log('✅ Conectividade OK!');
    }
    
    if (resultados.problemas.length > 0) {
      console.log(`❌ ${resultados.problemas.length} problemas no frontend:`);
      resultados.problemas.forEach(problema => {
        console.log(`   - ${problema}`);
      });
    } else {
      console.log('✅ Frontend OK!');
    }
    
    // Salvar resultados para análise
    window.diagnosticoResultados = resultados;
    console.log('\n💾 Resultados salvos em window.diagnosticoResultados');
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    return { error: error.message };
  }
}

// ===== EXECUTAR DIAGNÓSTICO =====
console.log('🔍 DIAGNÓSTICO COMPLETO PRONTO!');
console.log('📋 Execute: executarDiagnosticoCompleto()');
console.log('📊 Ou execute: await executarDiagnosticoCompleto()');

// Executar automaticamente
executarDiagnosticoCompleto().then(resultados => {
  console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO!');
  console.log('📋 Resumo dos resultados:', resultados);
});
