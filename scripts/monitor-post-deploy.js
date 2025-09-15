/**
 * Script de Monitoramento Pós-Deploy
 * Valida sistema após deploy em produção
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PostDeployMonitor {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
    this.reportDir = path.join(__dirname, '../reports');
    this.apiUrl = 'https://slotbox-api.onrender.com';
    this.frontendUrl = 'https://slotbox.shop';
  }

  /**
   * Executar monitoramento pós-deploy
   */
  async runMonitoring() {
    console.log('🔍 INICIANDO MONITORAMENTO PÓS-DEPLOY');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌍 API: ${this.apiUrl}`);
    console.log(`🌐 Frontend: ${this.frontendUrl}`);
    console.log('=' .repeat(80) + '\n');

    try {
      // Criar diretório de relatórios
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // 1. Teste de conectividade básica
      await this.testBasicConnectivity();

      // 2. Teste de health check da API
      await this.testApiHealth();

      // 3. Teste de rotas críticas da API
      await this.testCriticalApiRoutes();

      // 4. Teste de frontend
      await this.testFrontend();

      // 5. Teste de performance
      await this.testPerformance();

      // 6. Teste de funcionalidades críticas
      await this.testCriticalFeatures();

      // 7. Gerar relatório de monitoramento
      this.generateMonitoringReport();

      // Verificar se todos os testes passaram
      if (this.results.summary.failed > 0) {
        console.log('\n❌ MONITORAMENTO FALHOU!');
        console.log(`   ${this.results.summary.failed} teste(s) falharam`);
        process.exit(1);
      } else {
        console.log('\n✅ MONITORAMENTO CONCLUÍDO COM SUCESSO!');
        console.log('   Sistema funcionando corretamente em produção');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO DURANTE MONITORAMENTO:', error);
      this.generateMonitoringReport();
      process.exit(1);
    }
  }

  /**
   * Teste de conectividade básica
   */
  async testBasicConnectivity() {
    console.log('🌐 Testando conectividade básica...');
    
    try {
      // Testar API
      const apiResponse = await axios.get(`${this.apiUrl}/api/health`, { timeout: 10000 });
      this.addTestResult('connectivity', 'api', true, `API respondendo (${apiResponse.status})`);
      console.log('  ✅ API respondendo');
    } catch (error) {
      this.addTestResult('connectivity', 'api', false, `API não responde: ${error.message}`);
      console.log('  ❌ API não responde:', error.message);
    }

    try {
      // Testar Frontend
      const frontendResponse = await axios.get(this.frontendUrl, { timeout: 10000 });
      this.addTestResult('connectivity', 'frontend', true, `Frontend respondendo (${frontendResponse.status})`);
      console.log('  ✅ Frontend respondendo');
    } catch (error) {
      this.addTestResult('connectivity', 'frontend', false, `Frontend não responde: ${error.message}`);
      console.log('  ❌ Frontend não responde:', error.message);
    }
  }

  /**
   * Teste de health check da API
   */
  async testApiHealth() {
    console.log('🏥 Testando health check da API...');
    
    try {
      const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        this.addTestResult('health', 'api', true, 'Health check passou');
        console.log('  ✅ Health check passou');
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('health', 'api', false, `Health check falhou: ${error.message}`);
      console.log('  ❌ Health check falhou:', error.message);
    }
  }

  /**
   * Teste de rotas críticas da API
   */
  async testCriticalApiRoutes() {
    console.log('🛣️ Testando rotas críticas da API...');
    
    const criticalRoutes = [
      { path: '/api/cases', method: 'GET', name: 'Lista de caixas' },
      { path: '/api/prizes', method: 'GET', name: 'Lista de prêmios' },
      { path: '/api/db-test', method: 'GET', name: 'Teste de banco' }
    ];

    for (const route of criticalRoutes) {
      try {
        const response = await axios({
          method: route.method.toLowerCase(),
          url: `${this.apiUrl}${route.path}`,
          timeout: 10000
        });
        
        this.addTestResult('routes', route.name, true, `Rota ${route.path} funcionando (${response.status})`);
        console.log(`  ✅ ${route.name}: ${route.path}`);
      } catch (error) {
        this.addTestResult('routes', route.name, false, `Rota ${route.path} falhou: ${error.message}`);
        console.log(`  ❌ ${route.name}: ${route.path} - ${error.message}`);
      }
    }
  }

  /**
   * Teste de frontend
   */
  async testFrontend() {
    console.log('🎨 Testando frontend...');
    
    try {
      const response = await axios.get(this.frontendUrl, { timeout: 15000 });
      
      if (response.status === 200) {
        // Verificar se o HTML contém elementos essenciais
        const html = response.data;
        const hasTitle = html.includes('<title>');
        const hasReact = html.includes('react') || html.includes('React');
        
        if (hasTitle && hasReact) {
          this.addTestResult('frontend', 'html', true, 'HTML válido com React');
          console.log('  ✅ HTML válido com React');
        } else {
          this.addTestResult('frontend', 'html', false, 'HTML inválido ou sem React');
          console.log('  ❌ HTML inválido ou sem React');
        }
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('frontend', 'html', false, `Frontend falhou: ${error.message}`);
      console.log('  ❌ Frontend falhou:', error.message);
    }
  }

  /**
   * Teste de performance
   */
  async testPerformance() {
    console.log('⚡ Testando performance...');
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 2000) {
        this.addTestResult('performance', 'api', true, `API rápida (${responseTime}ms)`);
        console.log(`  ✅ API rápida: ${responseTime}ms`);
      } else {
        this.addTestResult('performance', 'api', false, `API lenta (${responseTime}ms)`);
        console.log(`  ❌ API lenta: ${responseTime}ms`);
      }
    } catch (error) {
      this.addTestResult('performance', 'api', false, `Teste de performance falhou: ${error.message}`);
      console.log('  ❌ Teste de performance falhou:', error.message);
    }

    try {
      const startTime = Date.now();
      const response = await axios.get(this.frontendUrl, { timeout: 10000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 3000) {
        this.addTestResult('performance', 'frontend', true, `Frontend rápido (${responseTime}ms)`);
        console.log(`  ✅ Frontend rápido: ${responseTime}ms`);
      } else {
        this.addTestResult('performance', 'frontend', false, `Frontend lento (${responseTime}ms)`);
        console.log(`  ❌ Frontend lento: ${responseTime}ms`);
      }
    } catch (error) {
      this.addTestResult('performance', 'frontend', false, `Teste de performance frontend falhou: ${error.message}`);
      console.log('  ❌ Teste de performance frontend falhou:', error.message);
    }
  }

  /**
   * Teste de funcionalidades críticas
   */
  async testCriticalFeatures() {
    console.log('🔧 Testando funcionalidades críticas...');
    
    try {
      // Testar endpoint de casos
      const casesResponse = await axios.get(`${this.apiUrl}/api/cases`, { timeout: 10000 });
      if (casesResponse.status === 200 && Array.isArray(casesResponse.data)) {
        this.addTestResult('features', 'cases', true, 'Endpoint de casos funcionando');
        console.log('  ✅ Endpoint de casos funcionando');
      } else {
        throw new Error('Resposta inválida do endpoint de casos');
      }
    } catch (error) {
      this.addTestResult('features', 'cases', false, `Endpoint de casos falhou: ${error.message}`);
      console.log('  ❌ Endpoint de casos falhou:', error.message);
    }

    try {
      // Testar endpoint de prêmios
      const prizesResponse = await axios.get(`${this.apiUrl}/api/prizes`, { timeout: 10000 });
      if (prizesResponse.status === 200 && Array.isArray(prizesResponse.data)) {
        this.addTestResult('features', 'prizes', true, 'Endpoint de prêmios funcionando');
        console.log('  ✅ Endpoint de prêmios funcionando');
      } else {
        throw new Error('Resposta inválida do endpoint de prêmios');
      }
    } catch (error) {
      this.addTestResult('features', 'prizes', false, `Endpoint de prêmios falhou: ${error.message}`);
      console.log('  ❌ Endpoint de prêmios falhou:', error.message);
    }
  }

  /**
   * Adicionar resultado de teste
   */
  addTestResult(category, test, passed, message) {
    if (!this.results.tests[category]) {
      this.results.tests[category] = {};
    }
    
    this.results.tests[category][test] = {
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.summary.total++;
    if (passed) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
  }

  /**
   * Gerar relatório de monitoramento
   */
  generateMonitoringReport() {
    console.log('\n📋 Gerando relatório de monitoramento...');
    
    const duration = Date.now() - this.startTime;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Calcular estatísticas
    const totalTests = this.results.summary.total;
    const passedTests = this.results.summary.passed;
    const failedTests = this.results.summary.failed;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    // Adicionar estatísticas ao relatório
    this.results.summary.successRate = parseFloat(successRate);
    this.results.summary.duration = duration;
    
    // Salvar relatório JSON
    const reportFile = path.join(this.reportDir, `post-deploy-monitoring-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    // Gerar relatório em markdown
    const markdownReport = this.generateMarkdownReport();
    const markdownFile = path.join(this.reportDir, `post-deploy-monitoring-${timestamp}.md`);
    fs.writeFileSync(markdownFile, markdownReport);
    
    console.log('\n📊 RELATÓRIO DE MONITORAMENTO PÓS-DEPLOY:');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes passaram: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Duração: ${(duration / 1000).toFixed(2)}s`);
    
    console.log('\n📁 Relatórios gerados:');
    console.log(`   • JSON: ${reportFile}`);
    console.log(`   • Markdown: ${markdownFile}`);
    
    if (failedTests > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      Object.entries(this.results.tests).forEach(([category, tests]) => {
        Object.entries(tests).forEach(([test, result]) => {
          if (!result.passed) {
            console.log(`   • ${category}/${test}: ${result.message}`);
          }
        });
      });
    }
    
    console.log('\n' + '=' .repeat(80));
  }

  /**
   * Gerar relatório em markdown
   */
  generateMarkdownReport() {
    const timestamp = new Date().toLocaleString();
    const totalTests = this.results.summary.total;
    const passedTests = this.results.summary.passed;
    const failedTests = this.results.summary.failed;
    const successRate = this.results.summary.successRate;
    const duration = this.results.summary.duration;
    
    let markdown = `# Relatório de Monitoramento Pós-Deploy - SlotBox\n\n`;
    markdown += `**Data:** ${timestamp}\n`;
    markdown += `**Duração:** ${(duration / 1000).toFixed(2)}s\n`;
    markdown += `**API:** ${this.apiUrl}\n`;
    markdown += `**Frontend:** ${this.frontendUrl}\n\n`;
    
    markdown += `## Resumo Executivo\n\n`;
    markdown += `| Métrica | Valor |\n`;
    markdown += `|---------|-------|\n`;
    markdown += `| Total de Testes | ${totalTests} |\n`;
    markdown += `| Testes Passaram | ${passedTests} |\n`;
    markdown += `| Testes Falharam | ${failedTests} |\n`;
    markdown += `| Taxa de Sucesso | ${successRate}% |\n\n`;
    
    markdown += `## Detalhes dos Testes\n\n`;
    
    Object.entries(this.results.tests).forEach(([category, tests]) => {
      markdown += `### ${category.toUpperCase()}\n\n`;
      
      Object.entries(tests).forEach(([test, result]) => {
        const status = result.passed ? '✅' : '❌';
        markdown += `- ${status} **${test}**: ${result.message}\n`;
      });
      
      markdown += '\n';
    });
    
    if (failedTests > 0) {
      markdown += `## Testes que Falharam\n\n`;
      markdown += `Os seguintes testes falharam e precisam de atenção:\n\n`;
      
      Object.entries(this.results.tests).forEach(([category, tests]) => {
        Object.entries(tests).forEach(([test, result]) => {
          if (!result.passed) {
            markdown += `- **${category}/${test}**: ${result.message}\n`;
          }
        });
      });
    }
    
    markdown += `\n## Conclusão\n\n`;
    
    if (failedTests === 0) {
      markdown += `✅ **Monitoramento concluído com sucesso!** O sistema está funcionando corretamente em produção.\n\n`;
      markdown += `### Status do Sistema:\n`;
      markdown += `- **API:** Funcionando corretamente\n`;
      markdown += `- **Frontend:** Funcionando corretamente\n`;
      markdown += `- **Performance:** Dentro dos parâmetros esperados\n`;
      markdown += `- **Funcionalidades:** Todas operacionais\n`;
    } else {
      markdown += `❌ **${failedTests} teste(s) falharam.** O sistema pode ter problemas que precisam ser investigados.\n\n`;
      markdown += `### Ações Necessárias:\n`;
      markdown += `1. Investigar os testes que falharam\n`;
      markdown += `2. Verificar logs do sistema\n`;
      markdown += `3. Considerar rollback se necessário\n`;
      markdown += `4. Corrigir problemas identificados\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const monitor = new PostDeployMonitor();
  monitor.runMonitoring();
}

module.exports = PostDeployMonitor;
