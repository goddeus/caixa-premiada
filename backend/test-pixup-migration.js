const axios = require('axios');
const config = require('./src/config/index');

/**
 * Script de teste para verificar a migração Pixup
 */
async function testPixupMigration() {
  console.log('🧪 Iniciando testes da migração Pixup...\n');
  
  const baseUrl = config.api.baseUrl || 'http://localhost:3001';
  const apiUrl = `${baseUrl}/api`;
  
  console.log(`📍 Testando em: ${apiUrl}`);
  console.log(`🔧 Configurações Pixup:`, {
    clientId: config.pixup.clientId ? '***configurado***' : 'NÃO CONFIGURADO',
    clientSecret: config.pixup.clientSecret ? '***configurado***' : 'NÃO CONFIGURADO',
    apiUrl: config.pixup.apiUrl || 'NÃO CONFIGURADO'
  });
  
  const tests = [];
  
  // Teste 1: Health Check
  tests.push({
    name: 'Health Check',
    test: async () => {
      const response = await axios.get(`${apiUrl}/health`);
      return response.data.success === true;
    }
  });
  
  // Teste 2: Verificar se rotas Pixup existem
  tests.push({
    name: 'Rotas Pixup Disponíveis',
    test: async () => {
      try {
        // Testar rota de depósito (deve retornar erro de autenticação, não 404)
        await axios.post(`${apiUrl}/pixup/deposit`, { userId: 'test', amount: 20 });
        return false; // Não deveria chegar aqui
      } catch (error) {
        // Deve retornar 401 (não autenticado) ou 400 (dados inválidos), não 404
        return error.response?.status !== 404;
      }
    }
  });
  
  // Teste 3: Verificar se webhooks Pixup existem
  tests.push({
    name: 'Webhooks Pixup Disponíveis',
    test: async () => {
      try {
        // Testar webhook de pagamento (deve retornar erro de dados, não 404)
        await axios.post(`${apiUrl}/pixup/webhook/payment`, {});
        return false; // Não deveria chegar aqui
      } catch (error) {
        // Deve retornar 400 (dados inválidos), não 404
        return error.response?.status !== 404;
      }
    }
  });
  
  // Teste 4: Verificar se serviço Pixup pode ser instanciado
  tests.push({
    name: 'Serviço Pixup Instanciável',
    test: async () => {
      try {
        const PixupService = require('./src/services/pixupService');
        const service = new PixupService();
        return service !== null && typeof service.createPayment === 'function';
      } catch (error) {
        console.error('Erro ao instanciar PixupService:', error.message);
        return false;
      }
    }
  });
  
  // Teste 5: Verificar se controller Pixup existe
  tests.push({
    name: 'Controller Pixup Disponível',
    test: async () => {
      try {
        const PixupController = require('./src/controllers/pixupController');
        return PixupController !== null && typeof PixupController.createDeposit === 'function';
      } catch (error) {
        console.error('Erro ao carregar PixupController:', error.message);
        return false;
      }
    }
  });
  
  // Executar testes
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}...`);
      const result = await test.test();
      
      if (result) {
        console.log(`✅ ${test.name}: PASSOU`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Resultados dos Testes:`);
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log(`\n🎉 Todos os testes passaram! Migração Pixup está funcionando.`);
  } else {
    console.log(`\n⚠️  Alguns testes falharam. Verifique a implementação.`);
  }
  
  // Verificar configurações necessárias
  console.log(`\n🔧 Verificações de Configuração:`);
  
  const requiredEnvVars = [
    'PIXUP_CLIENT_ID',
    'PIXUP_CLIENT_SECRET', 
    'PIXUP_API_URL'
  ];
  
  let configIssues = 0;
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ ${envVar}: NÃO CONFIGURADO`);
      configIssues++;
    } else {
      console.log(`✅ ${envVar}: CONFIGURADO`);
    }
  }
  
  if (configIssues > 0) {
    console.log(`\n⚠️  ${configIssues} variáveis de ambiente não configuradas.`);
    console.log(`📝 Configure as seguintes variáveis no arquivo .env:`);
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        console.log(`   ${envVar}=sua_chave_aqui`);
      }
    });
  } else {
    console.log(`\n✅ Todas as variáveis de ambiente estão configuradas.`);
  }
  
  console.log(`\n📋 Próximos passos:`);
  console.log(`1. Configure as variáveis de ambiente Pixup`);
  console.log(`2. Teste com dados reais em ambiente sandbox`);
  console.log(`3. Configure webhooks no painel Pixup`);
  console.log(`4. Teste fluxo completo de depósito e saque`);
  console.log(`5. Remover código VizzionPay após validação`);
}

if (require.main === module) {
  testPixupMigration()
    .then(() => {
      console.log('\n🏁 Testes finalizados!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro durante os testes:', error);
      process.exit(1);
    });
}

module.exports = { testPixupMigration };
