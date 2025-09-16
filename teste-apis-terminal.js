// 🧪 TESTE DE APIs VIA TERMINAL - SLOTBOX
// Execute: node teste-apis-terminal.js

const https = require('https');
const http = require('http');

// ===== CONFIGURAÇÕES =====
const API_BASE = 'https://slotbox-api.onrender.com';

// ===== FUNÇÕES DE TESTE =====
function fazerRequisicao(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: parsedData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// ===== TESTE 1: ROTAS PÚBLICAS =====
async function testarRotasPublicas() {
  console.log('\n🌐 === TESTANDO ROTAS PÚBLICAS ===');
  
  const rotas = [
    { endpoint: '/api/health', name: 'Health Check', expected: 200 },
    { endpoint: '/api/cases', name: 'Lista de Caixas', expected: 200 },
    { endpoint: '/api/auth/me', name: 'Auth Me (sem token)', expected: 401 },
    { endpoint: '/api/wallet/', name: 'Wallet (sem token)', expected: 401 },
    { endpoint: '/api/profile/', name: 'Profile (sem token)', expected: 401 },
    { endpoint: '/api/transactions', name: 'Transactions (sem token)', expected: 401 },
    { endpoint: '/api/prizes/stats', name: 'Prize Stats (sem token)', expected: 401 },
    { endpoint: '/api/admin/dashboard/stats', name: 'Admin Stats (sem token)', expected: 401 },
    { endpoint: '/api/affiliate/me', name: 'Affiliate Me (sem token)', expected: 401 },
    { endpoint: '/api/payments/history', name: 'Payments History (sem token)', expected: 401 }
  ];
  
  const resultados = [];
  
  for (const rota of rotas) {
    try {
      console.log(`🔍 Testando: ${rota.name} (${rota.endpoint})`);
      const resultado = await fazerRequisicao(`${API_BASE}${rota.endpoint}`);
      resultados.push({ ...rota, ...resultado });
      
      if (resultado.ok) {
        console.log(`✅ ${rota.name}: ${resultado.status} - OK`);
      } else if (resultado.status === 401) {
        console.log(`🔒 ${rota.name}: ${resultado.status} - UNAUTHORIZED (esperado sem token)`);
      } else if (resultado.status === 404) {
        console.log(`❌ ${rota.name}: ${resultado.status} - NOT FOUND`);
      } else {
        console.log(`⚠️ ${rota.name}: ${resultado.status} - ${resultado.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${rota.name}: ERRO - ${error.message}`);
      resultados.push({ ...rota, error: error.message, status: 'NETWORK_ERROR' });
    }
  }
  
  return resultados;
}

// ===== TESTE 2: SISTEMA DE AUTENTICAÇÃO =====
async function testarSistemaAutenticacao() {
  console.log('\n🔐 === TESTANDO SISTEMA DE AUTENTICAÇÃO ===');
  
  const resultados = [];
  
  // Teste de registro
  console.log('🔍 Testando registro de usuário...');
  const dadosRegistro = {
    nome: 'Teste Usuario',
    email: `teste${Date.now()}@exemplo.com`,
    senha: '123456789',
    confirmarSenha: '123456789',
    cpf: '12345678901'
  };
  
  try {
    const resultadoRegistro = await fazerRequisicao(`${API_BASE}/api/auth/register`, 'POST', dadosRegistro);
    resultados.push({ ...resultadoRegistro, tipo: 'registro' });
    
    if (resultadoRegistro.ok && resultadoRegistro.data?.success) {
      console.log('✅ Registro funcionando');
      
      // Teste de login
      console.log('🔍 Testando login...');
      const dadosLogin = {
        email: dadosRegistro.email,
        senha: dadosRegistro.senha
      };
      
      const resultadoLogin = await fazerRequisicao(`${API_BASE}/api/auth/login`, 'POST', dadosLogin);
      resultados.push({ ...resultadoLogin, tipo: 'login' });
      
      if (resultadoLogin.ok && resultadoLogin.data?.success) {
        console.log('✅ Login funcionando');
        
        // Salvar token para testes autenticados
        const token = resultadoLogin.data.data?.token || resultadoLogin.data.token;
        if (token) {
          global.testToken = token;
          global.testUser = resultadoLogin.data.data?.user || resultadoLogin.data.user;
          console.log('✅ Token salvo para testes autenticados');
        }
      } else {
        console.log('❌ Login falhou:', resultadoLogin.data?.message || 'Erro desconhecido');
      }
    } else {
      console.log('❌ Registro falhou:', resultadoRegistro.data?.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.log('❌ Erro no teste de autenticação:', error.message);
    resultados.push({ error: error.message, tipo: 'erro_autenticacao' });
  }
  
  return resultados;
}

// ===== TESTE 3: SISTEMA DE CAIXAS =====
async function testarSistemaCaixas() {
  console.log('\n📦 === TESTANDO SISTEMA DE CAIXAS ===');
  
  const resultados = [];
  
  try {
    // Teste de listagem de caixas
    console.log('🔍 Testando listagem de caixas...');
    const resultadoCaixas = await fazerRequisicao(`${API_BASE}/api/cases`);
    resultados.push({ ...resultadoCaixas, tipo: 'listagem_caixas' });
    
    if (resultadoCaixas.ok && resultadoCaixas.data?.success) {
      console.log('✅ Listagem de caixas funcionando');
      
      const caixas = resultadoCaixas.data.data || resultadoCaixas.data;
      if (caixas && caixas.length > 0) {
        console.log(`✅ ${caixas.length} caixas encontradas`);
        
        // Teste de busca de caixa específica
        const primeiraCaixa = caixas[0];
        console.log(`🔍 Testando busca de caixa específica: ${primeiraCaixa.id}`);
        
        const resultadoCaixaEspecifica = await fazerRequisicao(`${API_BASE}/api/cases/${primeiraCaixa.id}`);
        resultados.push({ ...resultadoCaixaEspecifica, tipo: 'caixa_especifica' });
        
        if (resultadoCaixaEspecifica.ok) {
          console.log('✅ Busca de caixa específica funcionando');
        } else {
          console.log('❌ Busca de caixa específica falhou');
        }
      } else {
        console.log('⚠️ Nenhuma caixa encontrada');
      }
    } else {
      console.log('❌ Listagem de caixas falhou');
    }
  } catch (error) {
    console.log('❌ Erro no teste de caixas:', error.message);
    resultados.push({ error: error.message, tipo: 'erro_caixas' });
  }
  
  return resultados;
}

// ===== TESTE 4: SISTEMA FINANCEIRO =====
async function testarSistemaFinanceiro() {
  console.log('\n💰 === TESTANDO SISTEMA FINANCEIRO ===');
  
  const resultados = [];
  
  if (!global.testToken) {
    console.log('⚠️ Token não disponível - pulando testes financeiros autenticados');
    return resultados;
  }
  
  const headers = { 'Authorization': `Bearer ${global.testToken}` };
  
  try {
    // Teste de saldo
    console.log('🔍 Testando consulta de saldo...');
    const resultadoSaldo = await fazerRequisicao(`${API_BASE}/api/wallet/`, 'GET', null, headers);
    resultados.push({ ...resultadoSaldo, tipo: 'consulta_saldo' });
    
    if (resultadoSaldo.ok) {
      console.log('✅ Consulta de saldo funcionando');
    } else {
      console.log('❌ Consulta de saldo falhou');
    }
    
    // Teste de depósito (simulação)
    console.log('🔍 Testando criação de depósito PIX...');
    const dadosDeposito = {
      userId: global.testUser?.id,
      amount: 20.00
    };
    
    const resultadoDeposito = await fazerRequisicao(`${API_BASE}/api/payments/deposit/pix`, 'POST', dadosDeposito, headers);
    resultados.push({ ...resultadoDeposito, tipo: 'criacao_deposito' });
    
    if (resultadoDeposito.ok) {
      console.log('✅ Criação de depósito PIX funcionando');
    } else {
      console.log('❌ Criação de depósito PIX falhou:', resultadoDeposito.data?.message || 'Erro desconhecido');
    }
    
    // Teste de saque (simulação)
    console.log('🔍 Testando solicitação de saque...');
    const dadosSaque = {
      valor: 20.00,
      pix_key: 'teste@exemplo.com',
      pix_key_type: 'email'
    };
    
    const resultadoSaque = await fazerRequisicao(`${API_BASE}/api/payments/withdraw`, 'POST', dadosSaque, headers);
    resultados.push({ ...resultadoSaque, tipo: 'solicitacao_saque' });
    
    if (resultadoSaque.ok) {
      console.log('✅ Solicitação de saque funcionando');
    } else {
      console.log('❌ Solicitação de saque falhou:', resultadoSaque.data?.message || 'Erro desconhecido');
    }
    
    // Teste de histórico de transações
    console.log('🔍 Testando histórico de transações...');
    const resultadoTransacoes = await fazerRequisicao(`${API_BASE}/api/transactions`, 'GET', null, headers);
    resultados.push({ ...resultadoTransacoes, tipo: 'historico_transacoes' });
    
    if (resultadoTransacoes.ok) {
      console.log('✅ Histórico de transações funcionando');
    } else {
      console.log('❌ Histórico de transações falhou');
    }
  } catch (error) {
    console.log('❌ Erro no teste financeiro:', error.message);
    resultados.push({ error: error.message, tipo: 'erro_financeiro' });
  }
  
  return resultados;
}

// ===== TESTE 5: SISTEMA DE AFILIADOS =====
async function testarSistemaAfiliados() {
  console.log('\n🤝 === TESTANDO SISTEMA DE AFILIADOS ===');
  
  const resultados = [];
  
  if (!global.testToken) {
    console.log('⚠️ Token não disponível - pulando testes de afiliados');
    return resultados;
  }
  
  const headers = { 'Authorization': `Bearer ${global.testToken}` };
  
  try {
    // Teste de criação de afiliado
    console.log('🔍 Testando criação de afiliado...');
    const resultadoCriacaoAfiliado = await fazerRequisicao(`${API_BASE}/api/affiliate/create`, 'POST', {}, headers);
    resultados.push({ ...resultadoCriacaoAfiliado, tipo: 'criacao_afiliado' });
    
    if (resultadoCriacaoAfiliado.ok) {
      console.log('✅ Criação de afiliado funcionando');
    } else {
      console.log('❌ Criação de afiliado falhou:', resultadoCriacaoAfiliado.data?.message || 'Erro desconhecido');
    }
    
    // Teste de informações do afiliado
    console.log('🔍 Testando informações do afiliado...');
    const resultadoInfoAfiliado = await fazerRequisicao(`${API_BASE}/api/affiliate/me`, 'GET', null, headers);
    resultados.push({ ...resultadoInfoAfiliado, tipo: 'info_afiliado' });
    
    if (resultadoInfoAfiliado.ok) {
      console.log('✅ Informações do afiliado funcionando');
    } else {
      console.log('❌ Informações do afiliado falhou');
    }
    
    // Teste de estatísticas do afiliado
    console.log('🔍 Testando estatísticas do afiliado...');
    const resultadoStatsAfiliado = await fazerRequisicao(`${API_BASE}/api/affiliate/stats`, 'GET', null, headers);
    resultados.push({ ...resultadoStatsAfiliado, tipo: 'stats_afiliado' });
    
    if (resultadoStatsAfiliado.ok) {
      console.log('✅ Estatísticas do afiliado funcionando');
    } else {
      console.log('❌ Estatísticas do afiliado falhou');
    }
  } catch (error) {
    console.log('❌ Erro no teste de afiliados:', error.message);
    resultados.push({ error: error.message, tipo: 'erro_afiliados' });
  }
  
  return resultados;
}

// ===== TESTE 6: PAINEL ADMINISTRATIVO =====
async function testarPainelAdmin() {
  console.log('\n👑 === TESTANDO PAINEL ADMINISTRATIVO ===');
  
  const resultados = [];
  
  if (!global.testToken) {
    console.log('⚠️ Token não disponível - pulando testes de admin');
    return resultados;
  }
  
  const headers = { 'Authorization': `Bearer ${global.testToken}` };
  
  try {
    // Teste de estatísticas do admin
    console.log('🔍 Testando estatísticas do admin...');
    const resultadoStatsAdmin = await fazerRequisicao(`${API_BASE}/api/admin/dashboard/stats`, 'GET', null, headers);
    resultados.push({ ...resultadoStatsAdmin, tipo: 'stats_admin' });
    
    if (resultadoStatsAdmin.ok) {
      console.log('✅ Estatísticas do admin funcionando');
    } else if (resultadoStatsAdmin.status === 403) {
      console.log('🔒 Estatísticas do admin: Acesso negado (usuário não é admin)');
    } else {
      console.log('❌ Estatísticas do admin falhou:', resultadoStatsAdmin.data?.message || 'Erro desconhecido');
    }
    
    // Teste de listagem de usuários
    console.log('🔍 Testando listagem de usuários...');
    const resultadoUsuarios = await fazerRequisicao(`${API_BASE}/api/admin/users`, 'GET', null, headers);
    resultados.push({ ...resultadoUsuarios, tipo: 'listagem_usuarios' });
    
    if (resultadoUsuarios.ok) {
      console.log('✅ Listagem de usuários funcionando');
    } else if (resultadoUsuarios.status === 403) {
      console.log('🔒 Listagem de usuários: Acesso negado (usuário não é admin)');
    } else {
      console.log('❌ Listagem de usuários falhou');
    }
  } catch (error) {
    console.log('❌ Erro no teste de admin:', error.message);
    resultados.push({ error: error.message, tipo: 'erro_admin' });
  }
  
  return resultados;
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteCompleto() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE TODAS AS APIs...');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    rotas_publicas: [],
    autenticacao: [],
    caixas: [],
    financeiro: [],
    afiliados: [],
    admin: [],
    problemas: [],
    sucessos: []
  };
  
  try {
    // Teste de rotas públicas
    console.log('\n🌐 === TESTE DE ROTAS PÚBLICAS ===');
    resultados.rotas_publicas = await testarRotasPublicas();
    
    // Teste de autenticação
    console.log('\n🔐 === TESTE DE AUTENTICAÇÃO ===');
    resultados.autenticacao = await testarSistemaAutenticacao();
    
    // Teste de caixas
    console.log('\n📦 === TESTE DE CAIXAS ===');
    resultados.caixas = await testarSistemaCaixas();
    
    // Teste financeiro
    console.log('\n💰 === TESTE FINANCEIRO ===');
    resultados.financeiro = await testarSistemaFinanceiro();
    
    // Teste de afiliados
    console.log('\n🤝 === TESTE DE AFILIADOS ===');
    resultados.afiliados = await testarSistemaAfiliados();
    
    // Teste de admin
    console.log('\n👑 === TESTE DE ADMIN ===');
    resultados.admin = await testarPainelAdmin();
    
    // Análise dos resultados
    console.log('\n📊 === ANÁLISE DOS RESULTADOS ===');
    
    // Contar problemas e sucessos
    const rotasComProblema = resultados.rotas_publicas.filter(r => r.status === 'NETWORK_ERROR' || (r.status !== 200 && r.status !== 401));
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
    
    // Verificar autenticação
    const authComProblema = resultados.autenticacao.filter(a => !a.ok);
    if (authComProblema.length > 0) {
      console.log(`❌ ${authComProblema.length} problemas de autenticação:`);
      authComProblema.forEach(problema => {
        console.log(`   - ${problema.tipo}: ${problema.status} - ${problema.data?.message || problema.error}`);
        resultados.problemas.push(`Autenticação: ${problema.tipo} - ${problema.status}`);
      });
    } else {
      console.log('✅ Autenticação OK!');
      resultados.sucessos.push('Autenticação: Sistema funcionando');
    }
    
    // Verificar caixas
    const caixasComProblema = resultados.caixas.filter(c => !c.ok);
    if (caixasComProblema.length > 0) {
      console.log(`❌ ${caixasComProblema.length} problemas de caixas:`);
      caixasComProblema.forEach(problema => {
        console.log(`   - ${problema.tipo}: ${problema.status} - ${problema.data?.message || problema.error}`);
        resultados.problemas.push(`Caixas: ${problema.tipo} - ${problema.status}`);
      });
    } else {
      console.log('✅ Sistema de caixas OK!');
      resultados.sucessos.push('Caixas: Sistema funcionando');
    }
    
    // Verificar financeiro
    const financeiroComProblema = resultados.financeiro.filter(f => !f.ok);
    if (financeiroComProblema.length > 0) {
      console.log(`❌ ${financeiroComProblema.length} problemas financeiros:`);
      financeiroComProblema.forEach(problema => {
        console.log(`   - ${problema.tipo}: ${problema.status} - ${problema.data?.message || problema.error}`);
        resultados.problemas.push(`Financeiro: ${problema.tipo} - ${problema.status}`);
      });
    } else {
      console.log('✅ Sistema financeiro OK!');
      resultados.sucessos.push('Financeiro: Sistema funcionando');
    }
    
    // Verificar afiliados
    const afiliadosComProblema = resultados.afiliados.filter(a => !a.ok);
    if (afiliadosComProblema.length > 0) {
      console.log(`❌ ${afiliadosComProblema.length} problemas de afiliados:`);
      afiliadosComProblema.forEach(problema => {
        console.log(`   - ${problema.tipo}: ${problema.status} - ${problema.data?.message || problema.error}`);
        resultados.problemas.push(`Afiliados: ${problema.tipo} - ${problema.status}`);
      });
    } else {
      console.log('✅ Sistema de afiliados OK!');
      resultados.sucessos.push('Afiliados: Sistema funcionando');
    }
    
    // Verificar admin
    const adminComProblema = resultados.admin.filter(a => !a.ok && a.status !== 403);
    if (adminComProblema.length > 0) {
      console.log(`❌ ${adminComProblema.length} problemas de admin:`);
      adminComProblema.forEach(problema => {
        console.log(`   - ${problema.tipo}: ${problema.status} - ${problema.data?.message || problema.error}`);
        resultados.problemas.push(`Admin: ${problema.tipo} - ${problema.status}`);
      });
    } else {
      console.log('✅ Sistema de admin OK!');
      resultados.sucessos.push('Admin: Sistema funcionando');
    }
    
    // Resumo final
    console.log('\n🎯 === RESUMO FINAL ===');
    console.log(`✅ Sucessos: ${resultados.sucessos.length}`);
    console.log(`❌ Problemas: ${resultados.problemas.length}`);
    
    if (resultados.problemas.length === 0) {
      console.log('🎉 SISTEMA 100% FUNCIONAL!');
    } else {
      console.log('⚠️ SISTEMA COM PROBLEMAS - VERIFICAR CORREÇÕES NECESSÁRIAS');
    }
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    return { error: error.message };
  }
}

// ===== EXECUTAR TESTE =====
if (require.main === module) {
  console.log('🧪 TESTE DE APIs VIA TERMINAL PRONTO!');
  console.log('📋 Executando teste completo...');
  
  executarTesteCompleto().then(resultados => {
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('📋 Resumo dos resultados:', resultados);
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { executarTesteCompleto };
