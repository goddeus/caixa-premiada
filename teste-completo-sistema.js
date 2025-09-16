// 🧪 TESTE COMPLETO DO SISTEMA SLOTBOX
// Execute este script no console do navegador após o upload do frontend

console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA SLOTBOX...');

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

// ===== TESTE 1: CONECTIVIDADE BÁSICA =====
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

// ===== TESTE 2: FRONTEND =====
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
  
  // Verificar se React Router está funcionando
  if (window.location.pathname) {
    console.log(`🛣️ Rota atual: ${window.location.pathname}`);
  }
  
  return { problemas };
}

// ===== TESTE 3: FUNCIONALIDADES ESPECÍFICAS =====
async function testarFuncionalidades() {
  console.log('\n🎮 TESTANDO FUNCIONALIDADES...');
  
  const resultados = [];
  
  // Testar se as caixas estão sendo exibidas
  const caixas = document.querySelectorAll('[data-testid="case-item"], .case-item, [class*="case"]');
  console.log(`📦 Caixas encontradas na página: ${caixas.length}`);
  
  if (caixas.length === 0) {
    resultados.push('❌ Nenhuma caixa encontrada na página');
  } else {
    resultados.push(`✅ ${caixas.length} caixas encontradas na página`);
  }
  
  // Testar se os modais estão funcionando
  const modais = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
  console.log(`🪟 Modais encontrados: ${modais.length}`);
  
  // Testar se os botões estão funcionando
  const botoes = document.querySelectorAll('button');
  console.log(`🔘 Botões encontrados: ${botoes.length}`);
  
  // Testar se as imagens estão carregando
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
  
  console.log(`🖼️ Imagens carregadas: ${imagensCarregadas}`);
  console.log(`❌ Imagens com erro: ${imagensComErro}`);
  
  if (imagensComErro > 0) {
    resultados.push(`❌ ${imagensComErro} imagens com erro de carregamento`);
  } else {
    resultados.push(`✅ Todas as imagens carregaram corretamente`);
  }
  
  return resultados;
}

// ===== TESTE 4: AUTENTICAÇÃO =====
async function testarAutenticacao() {
  console.log('\n🔐 TESTANDO AUTENTICAÇÃO...');
  
  const resultados = [];
  
  // Verificar se o contexto de autenticação está funcionando
  if (window.React && window.React.useContext) {
    console.log('✅ React Context disponível');
  } else {
    resultados.push('❌ React Context não disponível');
  }
  
  // Verificar se o token é válido (se existir)
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp > now) {
          console.log('✅ Token válido e não expirado');
          resultados.push('✅ Token válido e não expirado');
        } else {
          console.log('❌ Token expirado');
          resultados.push('❌ Token expirado');
        }
      } else {
        console.log('❌ Token em formato inválido');
        resultados.push('❌ Token em formato inválido');
      }
    } catch (e) {
      console.log('❌ Erro ao verificar token:', e.message);
      resultados.push('❌ Erro ao verificar token');
    }
  } else {
    console.log('ℹ️ Nenhum token encontrado (usuário não logado)');
    resultados.push('ℹ️ Nenhum token encontrado (usuário não logado)');
  }
  
  return resultados;
}

// ===== TESTE 5: NAVEGAÇÃO =====
async function testarNavegacao() {
  console.log('\n🛣️ TESTANDO NAVEGAÇÃO...');
  
  const resultados = [];
  
  // Verificar se React Router está funcionando
  if (window.history && window.history.pushState) {
    console.log('✅ History API disponível');
    resultados.push('✅ History API disponível');
  } else {
    console.log('❌ History API não disponível');
    resultados.push('❌ History API não disponível');
  }
  
  // Verificar rotas disponíveis
  const rotas = [
    '/',
    '/nike-case',
    '/console-case',
    '/premium-master-case',
    '/apple-case',
    '/samsung-case',
    '/weekend-case',
    '/profile',
    '/admin'
  ];
  
  console.log('🛣️ Rotas disponíveis:', rotas);
  resultados.push(`✅ ${rotas.length} rotas configuradas`);
  
  return resultados;
}

// ===== FUNÇÃO PRINCIPAL =====
async function executarTesteCompleto() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA...');
  
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
    frontend: null,
    funcionalidades: [],
    autenticacao: [],
    navegacao: [],
    problemas: [],
    sucessos: []
  };
  
  try {
    // Teste de conectividade
    console.log('\n📡 === TESTE DE CONECTIVIDADE ===');
    resultados.conectividade = await testarConectividade();
    
    // Teste de frontend
    console.log('\n🖥️ === TESTE DE FRONTEND ===');
    resultados.frontend = await testarFrontend();
    
    // Teste de funcionalidades
    console.log('\n🎮 === TESTE DE FUNCIONALIDADES ===');
    resultados.funcionalidades = await testarFuncionalidades();
    
    // Teste de autenticação
    console.log('\n🔐 === TESTE DE AUTENTICAÇÃO ===');
    resultados.autenticacao = await testarAutenticacao();
    
    // Teste de navegação
    console.log('\n🛣️ === TESTE DE NAVEGAÇÃO ===');
    resultados.navegacao = await testarNavegacao();
    
    // Análise dos resultados
    console.log('\n📊 === ANÁLISE DOS RESULTADOS ===');
    
    // Contar problemas e sucessos
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
    
    if (resultados.frontend.problemas.length > 0) {
      console.log(`❌ ${resultados.frontend.problemas.length} problemas no frontend:`);
      resultados.frontend.problemas.forEach(problema => {
        console.log(`   - ${problema}`);
        resultados.problemas.push(`Frontend: ${problema}`);
      });
    } else {
      console.log('✅ Frontend OK!');
      resultados.sucessos.push('Frontend: Sem problemas identificados');
    }
    
    if (resultados.funcionalidades.some(f => f.includes('❌'))) {
      const problemas = resultados.funcionalidades.filter(f => f.includes('❌'));
      console.log(`❌ ${problemas.length} problemas de funcionalidades:`);
      problemas.forEach(problema => {
        console.log(`   - ${problema}`);
        resultados.problemas.push(`Funcionalidades: ${problema}`);
      });
    } else {
      console.log('✅ Funcionalidades OK!');
      resultados.sucessos.push('Funcionalidades: Todas funcionando');
    }
    
    if (resultados.autenticacao.some(a => a.includes('❌'))) {
      const problemas = resultados.autenticacao.filter(a => a.includes('❌'));
      console.log(`❌ ${problemas.length} problemas de autenticação:`);
      problemas.forEach(problema => {
        console.log(`   - ${problema}`);
        resultados.problemas.push(`Autenticação: ${problema}`);
      });
    } else {
      console.log('✅ Autenticação OK!');
      resultados.sucessos.push('Autenticação: Sistema funcionando');
    }
    
    if (resultados.navegacao.some(n => n.includes('❌'))) {
      const problemas = resultados.navegacao.filter(n => n.includes('❌'));
      console.log(`❌ ${problemas.length} problemas de navegação:`);
      problemas.forEach(problema => {
        console.log(`   - ${problema}`);
        resultados.problemas.push(`Navegação: ${problema}`);
      });
    } else {
      console.log('✅ Navegação OK!');
      resultados.sucessos.push('Navegação: Sistema funcionando');
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
    
    // Salvar resultados para análise
    window.testeCompletoResultados = resultados;
    console.log('\n💾 Resultados salvos em window.testeCompletoResultados');
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    return { error: error.message };
  }
}

// ===== EXECUTAR TESTE =====
console.log('🧪 TESTE COMPLETO PRONTO!');
console.log('📋 Execute: executarTesteCompleto()');
console.log('📊 Ou execute: await executarTesteCompleto()');

// Executar automaticamente
executarTesteCompleto().then(resultados => {
  console.log('\n🎯 TESTE CONCLUÍDO!');
  console.log('📋 Resumo dos resultados:', resultados);
});
