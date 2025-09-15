/**
 * Script de Execução da Suite Completa de Testes
 * Executa todos os testes e gera evidências para auditoria
 */

require('dotenv').config({ path: 'backend/.env.production' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FullTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'staging',
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    this.reportDir = path.join(__dirname, '../reports');
  }

  /**
   * Executar suite completa de testes
   */
  async runFullSuite() {
    console.log('🚀 Iniciando execução da suite completa de testes...\n');

    try {
      // Criar diretório de relatórios
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // 1. Testes de Lint
      await this.runLintTests();

      // 2. Testes Unitários
      await this.runUnitTests();

      // 3. Testes de Integração
      await this.runIntegrationTests();

      // 4. Testes E2E
      await this.runE2ETests();

      // 5. Testes de Stress
      await this.runStressTests();

      // 6. Testes de Auditoria Financeira
      await this.runFinancialAuditTests();

      // 7. Testes de RTP
      await this.runRTPTests();

      // 8. Testes de Sistema de Saques
      await this.runWithdrawTests();

      // 9. Testes de Sincronização
      await this.runSyncTests();

      // 10. Testes de Migração
      await this.runMigrationTests();

      // Gerar relatório final
      this.generateFinalReport();

      // Verificar se todos os testes passaram
      if (this.results.summary.failed > 0) {
        console.log('\n❌ Alguns testes falharam!');
        process.exit(1);
      } else {
        console.log('\n✅ Todos os testes passaram com sucesso!');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 Erro durante execução da suite:', error);
      this.generateFinalReport();
      process.exit(1);
    }
  }

  /**
   * Executar testes de lint
   */
  async runLintTests() {
    console.log('🔍 Executando testes de lint...');
    
    try {
      // Lint do backend
      const backendLint = execSync('cd backend && npm run lint', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('lint', 'backend', true, 'Lint do backend passou');
      
      // Lint do frontend
      const frontendLint = execSync('cd frontend && npm run lint', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('lint', 'frontend', true, 'Lint do frontend passou');
      
    } catch (error) {
      this.addTestResult('lint', 'backend', false, error.message);
    }
  }

  /**
   * Executar testes unitários
   */
  async runUnitTests() {
    console.log('🧪 Executando testes unitários...');
    
    try {
      const output = execSync('cd tests && npm run test:unit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('unit', 'all', true, 'Testes unitários passaram');
      
    } catch (error) {
      this.addTestResult('unit', 'all', false, error.message);
    }
  }

  /**
   * Executar testes de integração
   */
  async runIntegrationTests() {
    console.log('🔗 Executando testes de integração...');
    
    try {
      const output = execSync('cd tests && npm run test:integration', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('integration', 'all', true, 'Testes de integração passaram');
      
    } catch (error) {
      this.addTestResult('integration', 'all', false, error.message);
    }
  }

  /**
   * Executar testes E2E
   */
  async runE2ETests() {
    console.log('🎭 Executando testes E2E...');
    
    try {
      const output = execSync('cd tests && npm run test:e2e', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('e2e', 'all', true, 'Testes E2E passaram');
      
    } catch (error) {
      this.addTestResult('e2e', 'all', false, error.message);
    }
  }

  /**
   * Executar testes de stress
   */
  async runStressTests() {
    console.log('💪 Executando testes de stress...');
    
    try {
      const output = execSync('cd tests && npm run test:stress', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('stress', 'all', true, 'Testes de stress passaram');
      
    } catch (error) {
      this.addTestResult('stress', 'all', false, error.message);
    }
  }

  /**
   * Executar testes de auditoria financeira
   */
  async runFinancialAuditTests() {
    console.log('💰 Executando testes de auditoria financeira...');
    
    try {
      const output = execSync('node scripts/financial-audit.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('financial', 'audit', true, 'Auditoria financeira passou');
      
    } catch (error) {
      this.addTestResult('financial', 'audit', false, error.message);
    }
  }

  /**
   * Executar testes de RTP
   */
  async runRTPTests() {
    console.log('🎯 Executando testes de RTP...');
    
    try {
      const output = execSync('node scripts/rtp-statistical-test.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('rtp', 'statistical', true, 'Testes de RTP passaram');
      
    } catch (error) {
      this.addTestResult('rtp', 'statistical', false, error.message);
    }
  }

  /**
   * Executar testes de sistema de saques
   */
  async runWithdrawTests() {
    console.log('💳 Executando testes de sistema de saques...');
    
    try {
      const output = execSync('node scripts/test-withdraw-system.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('withdraw', 'system', true, 'Testes de saques passaram');
      
    } catch (error) {
      this.addTestResult('withdraw', 'system', false, error.message);
    }
  }

  /**
   * Executar testes de sincronização
   */
  async runSyncTests() {
    console.log('🔄 Executando testes de sincronização...');
    
    try {
      const output = execSync('node scripts/sync-prizes-images.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('sync', 'prizes-images', true, 'Sincronização passou');
      
    } catch (error) {
      this.addTestResult('sync', 'prizes-images', false, error.message);
    }
  }

  /**
   * Executar testes de migração
   */
  async runMigrationTests() {
    console.log('🗄️ Executando testes de migração...');
    
    try {
      const output = execSync('node scripts/apply-migrations-staging.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('migration', 'staging', true, 'Testes de migração passaram');
      
    } catch (error) {
      this.addTestResult('migration', 'staging', false, error.message);
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
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${category}/${test}: ${message}`);
  }

  /**
   * Gerar relatório final
   */
  generateFinalReport() {
    console.log('\n📋 Gerando relatório final...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.reportDir, `full-test-suite-report-${timestamp}.json`);
    
    // Calcular estatísticas
    const totalTests = this.results.summary.total;
    const passedTests = this.results.summary.passed;
    const failedTests = this.results.summary.failed;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    // Adicionar estatísticas ao relatório
    this.results.summary.successRate = parseFloat(successRate);
    this.results.summary.duration = Date.now() - new Date(this.results.timestamp).getTime();
    
    // Salvar relatório
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    // Gerar relatório em markdown
    const markdownReport = this.generateMarkdownReport();
    const markdownFile = path.join(this.reportDir, `full-test-suite-report-${timestamp}.md`);
    fs.writeFileSync(markdownFile, markdownReport);
    
    console.log('\n📊 RELATÓRIO FINAL DA SUITE DE TESTES:');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌍 Ambiente: ${this.results.environment}`);
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes passaram: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Duração: ${(this.results.summary.duration / 1000).toFixed(2)}s`);
    
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
    
    console.log('\n' + '=' .repeat(60));
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
    
    let markdown = `# Relatório da Suite Completa de Testes\n\n`;
    markdown += `**Data:** ${timestamp}\n`;
    markdown += `**Ambiente:** ${this.results.environment}\n`;
    markdown += `**Duração:** ${(this.results.summary.duration / 1000).toFixed(2)}s\n\n`;
    
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
      markdown += `✅ **Todos os testes passaram com sucesso!** O sistema está pronto para produção.\n`;
    } else {
      markdown += `❌ **${failedTests} teste(s) falharam.** Corrija os problemas antes de prosseguir para produção.\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const testSuite = new FullTestSuite();
  testSuite.runFullSuite();
}

module.exports = FullTestSuite;
