/**
 * Script para testar todas as rotas da API
 * Uso: node scripts/test-routes.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = process.env.API_BASE_URL || 'https://slotbox-api.onrender.com';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token';

// Lista de rotas para testar
const routes = [
  // Rotas públicas
  { method: 'GET', path: '/', auth: false, description: 'Rota raiz' },
  { method: 'GET', path: '/api/health', auth: false, description: 'Health check' },
  { method: 'GET', path: '/api/cases', auth: false, description: 'Listar caixas' },
  { method: 'GET', path: '/api/prizes', auth: false, description: 'Listar prêmios' },
  
  // Rotas de autenticação
  { method: 'POST', path: '/api/auth/register', auth: false, description: 'Registrar usuário', body: { nome: 'Test', email: 'test@test.com', senha: '123456', cpf: '12345678901' } },
  { method: 'POST', path: '/api/auth/login', auth: false, description: 'Login', body: { email: 'test@test.com', senha: '123456' } },
  
  // Rotas protegidas (requerem token)
  { method: 'GET', path: '/api/wallet', auth: true, description: 'Consultar saldo' },
  { method: 'GET', path: '/api/profile', auth: true, description: 'Dados do perfil' },
  { method: 'GET', path: '/api/transactions', auth: true, description: 'Histórico de transações' },
  { method: 'GET', path: '/api/transactions/demo', auth: true, description: 'Histórico de transações demo' },
  { method: 'GET', path: '/api/payments/history', auth: true, description: 'Histórico de pagamentos' },
  
  // Rotas de depósito e saque
  { method: 'POST', path: '/api/deposit/pix', auth: true, description: 'Criar depósito PIX', body: { amount: 50 } },
  { method: 'POST', path: '/api/withdraw/pix', auth: true, description: 'Criar saque PIX', body: { amount: 50 } },
  
  // Rotas de caixas
  { method: 'GET', path: '/api/cases/premios', auth: false, description: 'Listar prêmios de todas as caixas' },
  { method: 'GET', path: '/api/cases/history', auth: true, description: 'Histórico de aberturas' },
  { method: 'GET', path: '/api/cases/rtp/stats', auth: true, description: 'Estatísticas RTP' },
  
  // Rotas admin (requerem admin)
  { method: 'GET', path: '/api/admin/dashboard/stats', auth: true, admin: true, description: 'Estatísticas do dashboard' },
  { method: 'GET', path: '/api/admin/users', auth: true, admin: true, description: 'Listar usuários' },
  { method: 'GET', path: '/api/admin/deposits', auth: true, admin: true, description: 'Listar depósitos' },
  { method: 'GET', path: '/api/admin/withdrawals', auth: true, admin: true, description: 'Listar saques' },
  { method: 'GET', path: '/api/admin/affiliates', auth: true, admin: true, description: 'Listar afiliados' },
  { method: 'GET', path: '/api/admin/logs', auth: true, admin: true, description: 'Logs administrativos' },
  { method: 'GET', path: '/api/admin/login-history', auth: true, admin: true, description: 'Histórico de login' },
  { method: 'GET', path: '/api/admin/settings', auth: true, admin: true, description: 'Configurações do sistema' },
  { method: 'GET', path: '/api/admin/rtp/config', auth: true, admin: true, description: 'Configuração RTP' },
  { method: 'GET', path: '/api/admin/cashflow/liquido', auth: true, admin: true, description: 'Caixa líquido' },
  { method: 'GET', path: '/api/admin/cashflow/stats', auth: true, admin: true, description: 'Estatísticas de fluxo de caixa' },
  { method: 'GET', path: '/api/admin/audit/logs', auth: true, admin: true, description: 'Logs de auditoria' },
  
  // Rotas de webhook
  { method: 'POST', path: '/api/webhook/pix', auth: false, description: 'Webhook PIX', body: { test: 'data' } },
  { method: 'POST', path: '/api/webhook/withdraw', auth: false, description: 'Webhook saque', body: { test: 'data' } },
  
  // Rotas de teste
  { method: 'GET', path: '/api/db-test', auth: false, description: 'Teste de conexão com banco' },
  { method: 'GET', path: '/api/vizzionpay-test', auth: false, description: 'Teste VizzionPay' },
  { method: 'POST', path: '/api/init-db', auth: false, description: 'Inicializar banco' },
  { method: 'POST', path: '/api/init-demo-accounts', auth: false, description: 'Inicializar contas demo' },
];

// Função para fazer requisição
async function testRoute(route) {
  const startTime = Date.now();
  
  try {
    const config = {
      method: route.method,
      url: `${BASE_URL}${route.path}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Adicionar token se necessário
    if (route.auth) {
      config.headers['Authorization'] = `Bearer ${TEST_TOKEN}`;
    }
    
    // Adicionar body se necessário
    if (route.body) {
      config.data = route.body;
    }
    
    const response = await axios(config);
    const endTime = Date.now();
    
    return {
      success: true,
      status: response.status,
      responseTime: endTime - startTime,
      data: response.data,
      error: null
    };
    
  } catch (error) {
    const endTime = Date.now();
    
    return {
      success: false,
      status: error.response?.status || 0,
      responseTime: endTime - startTime,
      data: null,
      error: {
        message: error.message,
        code: error.code,
        response: error.response?.data
      }
    };
  }
}

// Função principal
async function testAllRoutes() {
  console.log('🧪 Iniciando teste de rotas...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 Test Token: ${TEST_TOKEN ? 'Configurado' : 'Não configurado'}`);
  console.log('');
  
  const results = [];
  const timestamp = new Date().toISOString();
  
  for (const route of routes) {
    console.log(`Testing ${route.method} ${route.path}...`);
    
    const result = await testRoute(route);
    results.push({
      ...route,
      result,
      timestamp
    });
    
    // Log do resultado
    if (result.success) {
      console.log(`  ✅ ${result.status} - ${result.responseTime}ms`);
    } else {
      console.log(`  ❌ ${result.status} - ${result.responseTime}ms - ${result.error.message}`);
    }
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Gerar relatório
  const report = {
    timestamp,
    baseUrl: BASE_URL,
    totalRoutes: routes.length,
    successful: results.filter(r => r.result.success).length,
    failed: results.filter(r => !r.result.success).length,
    averageResponseTime: results.reduce((sum, r) => sum + r.result.responseTime, 0) / results.length,
    results: results.map(r => ({
      method: r.method,
      path: r.path,
      description: r.description,
      auth: r.auth,
      admin: r.admin,
      status: r.result.status,
      success: r.result.success,
      responseTime: r.result.responseTime,
      error: r.result.error?.message || null
    }))
  };
  
  // Salvar relatório
  const reportPath = path.join(__dirname, '../reports/routes-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Gerar relatório em markdown
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(__dirname, '../reports/routes.md');
  fs.writeFileSync(markdownPath, markdownReport);
  
  // Resumo
  console.log('\n📊 Resumo dos Testes:');
  console.log(`Total de rotas: ${report.totalRoutes}`);
  console.log(`Sucessos: ${report.successful}`);
  console.log(`Falhas: ${report.failed}`);
  console.log(`Tempo médio de resposta: ${Math.round(report.averageResponseTime)}ms`);
  console.log(`\n📄 Relatórios salvos em:`);
  console.log(`  - ${reportPath}`);
  console.log(`  - ${markdownPath}`);
  
  return report;
}

// Função para gerar relatório em markdown
function generateMarkdownReport(report) {
  let markdown = `# Inventário de Rotas - SlotBox API\n\n`;
  markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
  markdown += `**Base URL:** ${report.baseUrl}\n\n`;
  
  markdown += `## Resumo\n\n`;
  markdown += `- **Total de rotas:** ${report.totalRoutes}\n`;
  markdown += `- **Sucessos:** ${report.successful}\n`;
  markdown += `- **Falhas:** ${report.failed}\n`;
  markdown += `- **Tempo médio de resposta:** ${Math.round(report.averageResponseTime)}ms\n\n`;
  
  markdown += `## Detalhes das Rotas\n\n`;
  markdown += `| Método | Rota | Descrição | Auth | Admin | Status | Tempo (ms) | Erro |\n`;
  markdown += `|--------|------|-----------|------|-------|--------|------------|------|\n`;
  
  report.results.forEach(route => {
    const status = route.success ? `✅ ${route.status}` : `❌ ${route.status}`;
    const auth = route.auth ? '✅' : '❌';
    const admin = route.admin ? '✅' : '❌';
    const error = route.error ? route.error.substring(0, 50) + '...' : '-';
    
    markdown += `| ${route.method} | ${route.path} | ${route.description} | ${auth} | ${admin} | ${status} | ${route.responseTime} | ${error} |\n`;
  });
  
  markdown += `\n## Rotas por Categoria\n\n`;
  
  // Agrupar por categoria
  const categories = {
    'Públicas': report.results.filter(r => !r.auth),
    'Autenticadas': report.results.filter(r => r.auth && !r.admin),
    'Admin': report.results.filter(r => r.admin)
  };
  
  Object.entries(categories).forEach(([category, routes]) => {
    markdown += `### ${category}\n\n`;
    routes.forEach(route => {
      const status = route.success ? '✅' : '❌';
      markdown += `- ${status} **${route.method}** ${route.path} - ${route.description}\n`;
    });
    markdown += '\n';
  });
  
  markdown += `## Problemas Identificados\n\n`;
  
  const failedRoutes = report.results.filter(r => !r.success);
  if (failedRoutes.length === 0) {
    markdown += `✅ Nenhum problema identificado!\n`;
  } else {
    failedRoutes.forEach(route => {
      markdown += `- **${route.method} ${route.path}**: ${route.error}\n`;
    });
  }
  
  return markdown;
}

// Executar se chamado diretamente
if (require.main === module) {
  testAllRoutes().catch(console.error);
}

module.exports = { testAllRoutes, testRoute };
