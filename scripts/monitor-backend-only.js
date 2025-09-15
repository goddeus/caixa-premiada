/**
 * Script de Monitoramento do Backend
 * Monitora apenas o backend que já está funcionando
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BackendMonitor {
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
  }

  /**
   * Executar monitoramento do backend
   */
  async runMonitoring() {
    console.log('🔧 MONITORANDO BACKEND - SLOTBOX');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌍 API: ${this.apiUrl}`);
    console.log('=' .repeat(60) + '\n');

    try {
      // Criar diretório de relatórios
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // 1. Teste de conectividade
      await this.testConnectivity();

      // 2. Teste de health check
      await this.testHealthCheck();

      // 3. Teste de rotas públicas
      await this.testPublicRoutes();

      // 4. Teste de performance
      await this.testPerformance();

      // 5. Teste de banco de dados
      await this.testDatabase();

      // 6. Gerar relatório
      this.generateReport();

      // Verificar se todos os testes passaram
      if (this.results.summary.failed > 0) {
        console.log('\n❌ MONITORAMENTO FALHOU!');
        console.log(`   ${this.results.summary.failed} teste(s) falharam`);
        process.exit(1);
      } else {
        console.log('\n✅ BACKEND FUNCIONANDO PERFEITAMENTE!');
        console.log('   Sistema pronto para receber o frontend');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO DURANTE MONITORAMENTO:', error);
      this.generateReport();
      process.exit(1);
    }
  }

  /**
   * Teste de conectividade
   */
  async testConnectivity() {
    console.log('🌐 Testando conectividade...');
    
    try {
      const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 10000 });
      this.addTestResult('connectivity', 'api', true, `API respondendo (${response.status})`);
      console.log(`  ✅ API respondendo: ${response.status}`);
    } catch (error) {
      this.addTestResult('connectivity', 'api', false, `API não responde: ${error.message}`);
      console.log('  ❌ API não responde:', error.message);
    }
  }

  /**
   * Teste de health check
   */
  async testHealthCheck() {
    console.log('🏥 Testando health check...');
    
    try {
      const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        this.addTestResult('health', 'check', true, 'Health check passou');
        console.log('  ✅ Health check passou');
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('health', 'check', false, `Health check falhou: ${error.message}`);
      console.log('  ❌ Health check falhou:', error.message);
    }
  }

  /**
   * Teste de rotas públicas
   */
  async testPublicRoutes() {
    console.log('🛣️ Testando rotas públicas...');
    
    const publicRoutes = [
      { path: '/api/cases', name: 'Lista de caixas' },
      { path: '/api/prizes', name: 'Lista de prêmios' },
      { path: '/api/db-test', name: 'Teste de banco' },
      { path: '/api/vizzionpay-test', name: 'Teste VizzionPay' }
    ];

    for (const route of publicRoutes) {
      try {
        const response = await axios.get(`${this.apiUrl}${route.path}`, { timeout: 10000 });
        
        if (response.status === 200) {
          this.addTestResult('routes', route.name, true, `Rota ${route.path} funcionando`);
          console.log(`  ✅ ${route.name}: ${route.path}`);
        } else {
          throw new Error(`Status inesperado: ${response.status}`);
        }
      } catch (error) {
        this.addTestResult('routes', route.name, false, `Rota ${route.path} falhou: ${error.message}`);
        console.log(`  ❌ ${route.name}: ${route.path} - ${error.message}`);
      }
    }
  }

  /**
   * Teste de performance
   */
  async testPerformance() {
    console.log('⚡ Testando performance...');
    
    const tests = [
      { name: 'Health Check', path: '/api/health', maxTime: 1000 },
      { name: 'Lista de Caixas', path: '/api/cases', maxTime: 2000 },
      { name: 'Lista de Prêmios', path: '/api/prizes', maxTime: 2000 }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.apiUrl}${test.path}`, { timeout: 5000 });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime < test.maxTime) {
          this.addTestResult('performance', test.name, true, `${test.name} rápido (${responseTime}ms)`);
          console.log(`  ✅ ${test.name}: ${responseTime}ms`);
        } else {
          this.addTestResult('performance', test.name, false, `${test.name} lento (${responseTime}ms)`);
          console.log(`  ❌ ${test.name}: ${responseTime}ms (limite: ${test.maxTime}ms)`);
        }
      } catch (error) {
        this.addTestResult('performance', test.name, false, `${test.name} falhou: ${error.message}`);
        console.log(`  ❌ ${test.name} falhou:`, error.message);
      }
    }
  }

  /**
   * Teste de banco de dados
   */
  async testDatabase() {
    console.log('🗄️ Testando banco de dados...');
    
    try {
      const response = await axios.get(`${this.apiUrl}/api/db-test`, { timeout: 10000 });
      
      if (response.status === 200) {
        this.addTestResult('database', 'connection', true, 'Conexão com banco funcionando');
        console.log('  ✅ Conexão com banco funcionando');
        
        // Verificar se retorna dados válidos
        if (response.data && typeof response.data === 'object') {
          this.addTestResult('database', 'data', true, 'Dados do banco válidos');
          console.log('  ✅ Dados do banco válidos');
        } else {
          this.addTestResult('database', 'data', false, 'Dados do banco inválidos');
          console.log('  ❌ Dados do banco inválidos');
        }
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('database', 'connection', false, `Banco de dados falhou: ${error.message}`);
      console.log('  ❌ Banco de dados falhou:', error.message);
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
   * Gerar relatório
   */
  generateReport() {
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
    const reportFile = path.join(this.reportDir, `backend-monitoring-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 RELATÓRIO DE MONITORAMENTO DO BACKEND:');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes passaram: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Duração: ${(duration / 1000).toFixed(2)}s`);
    
    console.log('\n📁 Relatório salvo em:');
    console.log(`   • JSON: ${reportFile}`);
    
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
    
    console.log('\n' + '=' .repeat(60));
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const monitor = new BackendMonitor();
  monitor.runMonitoring();
}

module.exports = BackendMonitor;
