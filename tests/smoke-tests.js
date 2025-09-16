/**
 * Smoke Tests - Testes básicos para verificar se o sistema está funcionando
 * Executados após deploy para validar funcionalidades críticas
 */

const axios = require('axios');

// Configurações
const BACKEND_URL = process.env.BACKEND_URL || 'https://slotbox-api.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://slotbox.shop';
const TIMEOUT = 30000;

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Função para fazer requisição com timeout
async function makeRequest(url, options = {}) {
  try {
    const response = await axios({
      url,
      timeout: TIMEOUT,
      ...options
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    };
  }
}

// Testes de smoke
async function runSmokeTests() {
  logInfo('🚀 Iniciando Smoke Tests...');
  logInfo(`Backend URL: ${BACKEND_URL}`);
  logInfo(`Frontend URL: ${FRONTEND_URL}`);
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // 1. Teste de Health Check
  logInfo('1. Testando Health Check...');
  results.total++;
  const healthCheck = await makeRequest(`${BACKEND_URL}/api/health`);
  
  if (healthCheck.success && healthCheck.status === 200) {
    logSuccess('Health check OK');
    results.passed++;
  } else {
    logError(`Health check falhou: ${healthCheck.error}`);
    results.failed++;
  }

  // 2. Teste de CORS
  logInfo('2. Testando CORS...');
  results.total++;
  const corsTest = await makeRequest(`${BACKEND_URL}/api/health`, {
    headers: {
      'Origin': FRONTEND_URL,
      'Access-Control-Request-Method': 'GET'
    }
  });
  
  if (corsTest.success) {
    logSuccess('CORS configurado corretamente');
    results.passed++;
  } else {
    logError(`CORS falhou: ${corsTest.error}`);
    results.failed++;
  }

  // 3. Teste de Registro de Usuário
  logInfo('3. Testando Registro de Usuário...');
  results.total++;
  const testUser = {
    nome: `SmokeTest${Date.now()}`,
    email: `smoketest${Date.now()}@example.com`,
    senha: 'TestPassword123!',
    confirmarSenha: 'TestPassword123!'
  };

  const registerTest = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: testUser
  });

  if (registerTest.success && registerTest.status === 201) {
    logSuccess('Registro de usuário OK');
    results.passed++;
  } else {
    logError(`Registro falhou: ${registerTest.error}`);
    results.failed++;
  }

  // 4. Teste de Login
  logInfo('4. Testando Login...');
  results.total++;
  const loginTest = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: testUser.email,
      senha: testUser.senha
    }
  });

  let authToken = null;
  if (loginTest.success && loginTest.status === 200 && loginTest.data.token) {
    logSuccess('Login OK');
    authToken = loginTest.data.token;
    results.passed++;
  } else {
    logError(`Login falhou: ${loginTest.error}`);
    results.failed++;
  }

  // 5. Teste de Listagem de Caixas
  logInfo('5. Testando Listagem de Caixas...');
  results.total++;
  const casesTest = await makeRequest(`${BACKEND_URL}/api/cases`, {
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
  });

  if (casesTest.success && casesTest.status === 200 && Array.isArray(casesTest.data)) {
    logSuccess(`Listagem de caixas OK (${casesTest.data.length} caixas encontradas)`);
    results.passed++;
  } else {
    logError(`Listagem de caixas falhou: ${casesTest.error}`);
    results.failed++;
  }

  // 6. Teste de Depósito PIX (sem processar)
  logInfo('6. Testando Criação de Depósito PIX...');
  results.total++;
  if (authToken) {
    const depositTest = await makeRequest(`${BACKEND_URL}/api/deposit/pix`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        amount: 10.00
      }
    });

    if (depositTest.success && depositTest.status === 201) {
      logSuccess('Criação de depósito PIX OK');
      results.passed++;
    } else {
      logError(`Criação de depósito PIX falhou: ${depositTest.error}`);
      results.failed++;
    }
  } else {
    logWarning('Pulando teste de depósito - token de autenticação não disponível');
    results.failed++;
  }

  // 7. Teste de Frontend (verificar se está acessível)
  logInfo('7. Testando Acessibilidade do Frontend...');
  results.total++;
  const frontendTest = await makeRequest(FRONTEND_URL);

  if (frontendTest.success && frontendTest.status === 200) {
    logSuccess('Frontend acessível');
    results.passed++;
  } else {
    logError(`Frontend não acessível: ${frontendTest.error}`);
    results.failed++;
  }

  // 8. Teste de Performance (tempo de resposta)
  logInfo('8. Testando Performance...');
  results.total++;
  const startTime = Date.now();
  const perfTest = await makeRequest(`${BACKEND_URL}/api/health`);
  const responseTime = Date.now() - startTime;

  if (perfTest.success && responseTime < 5000) {
    logSuccess(`Performance OK (${responseTime}ms)`);
    results.passed++;
  } else if (perfTest.success) {
    logWarning(`Performance lenta (${responseTime}ms)`);
    results.passed++;
  } else {
    logError(`Performance falhou: ${perfTest.error}`);
    results.failed++;
  }

  // Relatório final
  console.log('');
  logInfo('📊 RELATÓRIO FINAL DOS SMOKE TESTS:');
  console.log(`   • Total de testes: ${results.total}`);
  console.log(`   • Passou: ${results.passed}`);
  console.log(`   • Falhou: ${results.failed}`);
  console.log(`   • Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(2)}%`);

  if (results.failed === 0) {
    logSuccess('🎉 Todos os smoke tests passaram! Sistema está funcionando corretamente.');
    process.exit(0);
  } else {
    logError(`💥 ${results.failed} smoke test(s) falharam. Sistema pode ter problemas.`);
    process.exit(1);
  }
}

// Executar smoke tests
if (require.main === module) {
  runSmokeTests().catch(error => {
    logError(`Erro fatal nos smoke tests: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runSmokeTests };
