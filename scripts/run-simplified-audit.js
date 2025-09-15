/**
 * Script Simplificado de Auditoria Final
 * Executa os testes principais e gera relatório
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SimplifiedAudit {
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
  }

  /**
   * Executar auditoria simplificada
   */
  async runAudit() {
    console.log('🚀 EXECUTANDO AUDITORIA SIMPLIFICADA DO SISTEMA SLOTBOX');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`📁 Diretório: ${process.cwd()}`);
    console.log('=' .repeat(80) + '\n');

    try {
      // Criar diretório de relatórios
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // 1. Teste de rotas
      await this.testRoutes();

      // 2. Teste de build do frontend
      await this.testFrontendBuild();

      // 3. Teste de dependências
      await this.testDependencies();

      // 4. Teste de configuração
      await this.testConfiguration();

      // 5. Teste de arquivos críticos
      await this.testCriticalFiles();

      // Gerar relatório final
      this.generateReport();

      // Verificar se auditoria foi bem-sucedida
      if (this.results.summary.failed > 0) {
        console.log('\n❌ AUDITORIA FALHOU!');
        console.log(`   ${this.results.summary.failed} teste(s) falharam`);
        process.exit(1);
      } else {
        console.log('\n✅ AUDITORIA CONCLUÍDA COM SUCESSO!');
        console.log('   Sistema pronto para produção');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO DURANTE AUDITORIA:', error);
      this.generateReport();
      process.exit(1);
    }
  }

  /**
   * Testar rotas
   */
  async testRoutes() {
    console.log('🛣️ Testando rotas da API...');
    
    try {
      const output = execSync('node scripts/test-routes.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.addTestResult('routes', 'api', true, 'Teste de rotas passou');
      console.log('  ✅ Teste de rotas passou');
      
    } catch (error) {
      this.addTestResult('routes', 'api', false, error.message);
      console.log('  ❌ Teste de rotas falhou:', error.message);
    }
  }

  /**
   * Testar build do frontend
   */
  async testFrontendBuild() {
    console.log('🎨 Testando build do frontend...');
    
    try {
      const output = execSync('cd frontend && npm run build', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Verificar se diretório dist foi criado
      const distDir = path.join(__dirname, '../frontend/dist');
      if (fs.existsSync(distDir)) {
        this.addTestResult('frontend', 'build', true, 'Build do frontend passou');
        console.log('  ✅ Build do frontend passou');
      } else {
        throw new Error('Diretório dist não foi criado');
      }
      
    } catch (error) {
      this.addTestResult('frontend', 'build', false, error.message);
      console.log('  ❌ Build do frontend falhou:', error.message);
    }
  }

  /**
   * Testar dependências
   */
  async testDependencies() {
    console.log('📦 Testando dependências...');
    
    try {
      // Verificar package.json do backend
      const backendPackage = path.join(__dirname, '../backend/package.json');
      if (fs.existsSync(backendPackage)) {
        this.addTestResult('dependencies', 'backend', true, 'Package.json do backend existe');
        console.log('  ✅ Package.json do backend existe');
      } else {
        throw new Error('Package.json do backend não encontrado');
      }
      
      // Verificar package.json do frontend
      const frontendPackage = path.join(__dirname, '../frontend/package.json');
      if (fs.existsSync(frontendPackage)) {
        this.addTestResult('dependencies', 'frontend', true, 'Package.json do frontend existe');
        console.log('  ✅ Package.json do frontend existe');
      } else {
        throw new Error('Package.json do frontend não encontrado');
      }
      
    } catch (error) {
      this.addTestResult('dependencies', 'backend', false, error.message);
      console.log('  ❌ Teste de dependências falhou:', error.message);
    }
  }

  /**
   * Testar configuração
   */
  async testConfiguration() {
    console.log('⚙️ Testando configuração...');
    
    try {
      // Verificar arquivo de configuração do backend
      const backendEnv = path.join(__dirname, '../backend/env.production');
      if (fs.existsSync(backendEnv)) {
        this.addTestResult('config', 'backend', true, 'Configuração do backend existe');
        console.log('  ✅ Configuração do backend existe');
      } else {
        throw new Error('Configuração do backend não encontrada');
      }
      
      // Verificar arquivo de configuração do frontend
      const frontendEnv = path.join(__dirname, '../frontend/.env.production');
      if (fs.existsSync(frontendEnv)) {
        this.addTestResult('config', 'frontend', true, 'Configuração do frontend existe');
        console.log('  ✅ Configuração do frontend existe');
      } else {
        throw new Error('Configuração do frontend não encontrada');
      }
      
    } catch (error) {
      this.addTestResult('config', 'backend', false, error.message);
      console.log('  ❌ Teste de configuração falhou:', error.message);
    }
  }

  /**
   * Testar arquivos críticos
   */
  async testCriticalFiles() {
    console.log('📁 Testando arquivos críticos...');
    
    try {
      const criticalFiles = [
        '../backend/src/server.js',
        '../frontend/src/App.jsx',
        '../backend/prisma/schema.prisma',
        '../frontend/package.json',
        '../backend/package.json'
      ];
      
      let allFilesExist = true;
      
      for (const file of criticalFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          console.log(`  ✅ ${file} existe`);
        } else {
          console.log(`  ❌ ${file} não encontrado`);
          allFilesExist = false;
        }
      }
      
      if (allFilesExist) {
        this.addTestResult('files', 'critical', true, 'Todos os arquivos críticos existem');
        console.log('  ✅ Todos os arquivos críticos existem');
      } else {
        throw new Error('Alguns arquivos críticos não foram encontrados');
      }
      
    } catch (error) {
      this.addTestResult('files', 'critical', false, error.message);
      console.log('  ❌ Teste de arquivos críticos falhou:', error.message);
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
   * Gerar relatório final
   */
  generateReport() {
    console.log('\n📋 Gerando relatório final...');
    
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
    const reportFile = path.join(this.reportDir, `simplified-audit-report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    // Gerar relatório em markdown
    const markdownReport = this.generateMarkdownReport();
    const markdownFile = path.join(this.reportDir, `simplified-audit-report-${timestamp}.md`);
    fs.writeFileSync(markdownFile, markdownReport);
    
    console.log('\n📊 RELATÓRIO FINAL DA AUDITORIA:');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes passaram: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Duração total: ${(duration / 1000).toFixed(2)}s`);
    
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
    
    let markdown = `# Relatório da Auditoria Simplificada - SlotBox\n\n`;
    markdown += `**Data:** ${timestamp}\n`;
    markdown += `**Duração:** ${(duration / 1000).toFixed(2)}s\n\n`;
    
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
      markdown += `✅ **Auditoria concluída com sucesso!** O sistema está pronto para produção.\n\n`;
      markdown += `### Próximos Passos:\n`;
      markdown += `1. Revisar o PR gerado\n`;
      markdown += `2. Aprovar as mudanças\n`;
      markdown += `3. Fazer deploy para produção\n`;
      markdown += `4. Monitorar o sistema após deploy\n`;
    } else {
      markdown += `❌ **${failedTests} teste(s) falharam.** Corrija os problemas antes de prosseguir para produção.\n\n`;
      markdown += `### Ações Necessárias:\n`;
      markdown += `1. Corrigir os testes que falharam\n`;
      markdown += `2. Re-executar a auditoria\n`;
      markdown += `3. Verificar se todos os testes passam\n`;
      markdown += `4. Só então prosseguir para produção\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const audit = new SimplifiedAudit();
  audit.runAudit();
}

module.exports = SimplifiedAudit;
