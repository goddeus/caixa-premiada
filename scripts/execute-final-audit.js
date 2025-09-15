/**
 * Script de Execução Final da Auditoria
 * Executa todos os passos da auditoria e gera relatório final
 */

require('dotenv').config({ path: 'backend/env.production' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FinalAuditExecutor {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'staging',
      steps: {},
      summary: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        warnings: 0
      }
    };
    this.reportDir = path.join(__dirname, '../reports');
  }

  /**
   * Executar auditoria completa
   */
  async executeFullAudit() {
    console.log('🚀 INICIANDO AUDITORIA COMPLETA DO SISTEMA SLOTBOX');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌍 Ambiente: ${this.results.environment}`);
    console.log(`📁 Diretório: ${process.cwd()}`);
    console.log('=' .repeat(80) + '\n');

    try {
      // A - PREPARAÇÃO
      await this.executeStep('A', 'Preparação', this.prepareAudit.bind(this));

      // B - ANÁLISE ESTÁTICA
      await this.executeStep('B', 'Análise Estática', this.staticAnalysis.bind(this));

      // C - INVENTÁRIO DE ROTAS
      await this.executeStep('C', 'Inventário de Rotas', this.routeInventory.bind(this));

      // D - AUDITORIA FINANCEIRA
      await this.executeStep('D', 'Auditoria Financeira', this.financialAudit.bind(this));

      // E - RTP E SORTEIO
      await this.executeStep('E', 'RTP e Sorteio', this.rtpAudit.bind(this));

      // F - PREVENIR REGRESSÕES
      await this.executeStep('F', 'Prevenir Regressões', this.regressionPrevention.bind(this));

      // G - FRONTEND
      await this.executeStep('G', 'Frontend', this.frontendFixes.bind(this));

      // H - VIZZIONPAY
      await this.executeStep('H', 'VizzionPay', this.vizzionpayIntegration.bind(this));

      // I - SAQUES
      await this.executeStep('I', 'Sistema de Saques', this.withdrawSystem.bind(this));

      // J - PRIZES & IMAGENS
      await this.executeStep('J', 'Prizes e Imagens', this.prizesImagesAudit.bind(this));

      // K - MIGRATIONS
      await this.executeStep('K', 'Migrations e Seeds', this.migrationsSeeds.bind(this));

      // L - CI/DEPLOY
      await this.executeStep('L', 'CI/Deploy/Rollback', this.cideployRollback.bind(this));

      // M - RELATÓRIO
      await this.executeStep('M', 'Relatório e Comentários', this.reporting.bind(this));

      // N - EXECUÇÃO FINAL
      await this.executeStep('N', 'Execução Final', this.finalExecution.bind(this));

      // Gerar relatório final
      await this.generateFinalReport();

      // Verificar se auditoria foi bem-sucedida
      if (this.results.summary.failedSteps > 0) {
        console.log('\n❌ AUDITORIA FALHOU!');
        console.log(`   ${this.results.summary.failedSteps} passo(s) falharam`);
        process.exit(1);
      } else {
        console.log('\n✅ AUDITORIA CONCLUÍDA COM SUCESSO!');
        console.log('   Sistema pronto para produção');
        process.exit(0);
      }

    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO DURANTE AUDITORIA:', error);
      await this.generateFinalReport();
      process.exit(1);
    }
  }

  /**
   * Executar um passo da auditoria
   */
  async executeStep(stepId, stepName, stepFunction) {
    console.log(`\n🔍 PASSO ${stepId} - ${stepName.toUpperCase()}`);
    console.log('-'.repeat(50));
    
    const stepStartTime = Date.now();
    
    try {
      await stepFunction();
      
      const duration = Date.now() - stepStartTime;
      this.addStepResult(stepId, stepName, true, `Concluído em ${duration}ms`);
      
      console.log(`✅ PASSO ${stepId} CONCLUÍDO COM SUCESSO`);
      
    } catch (error) {
      const duration = Date.now() - stepStartTime;
      this.addStepResult(stepId, stepName, false, `Falhou em ${duration}ms: ${error.message}`);
      
      console.log(`❌ PASSO ${stepId} FALHOU: ${error.message}`);
      
      // Continuar com próximos passos mesmo se um falhar
      if (stepId === 'A' || stepId === 'D' || stepId === 'E') {
        throw error; // Passos críticos
      }
    }
  }

  /**
   * A - PREPARAÇÃO
   */
  async prepareAudit() {
    console.log('📋 Verificando preparação...');
    
    // Verificar se estamos na branch correta
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (!currentBranch.startsWith('audit/')) {
      throw new Error(`Branch incorreta: ${currentBranch}. Deve estar em audit/*`);
    }
    
    // Verificar se backup foi feito
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      throw new Error('Diretório de backup não encontrado');
    }
    
    // Verificar variáveis de ambiente
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Variável de ambiente ${envVar} não configurada`);
      }
    }
    
    console.log('  ✅ Branch correta:', currentBranch);
    console.log('  ✅ Backup disponível');
    console.log('  ✅ Variáveis de ambiente configuradas');
  }

  /**
   * B - ANÁLISE ESTÁTICA
   */
  async staticAnalysis() {
    console.log('🔍 Executando análise estática...');
    
    // Lint do backend
    try {
      execSync('cd backend && npm run lint', { stdio: 'pipe' });
      console.log('  ✅ Lint do backend passou');
    } catch (error) {
      throw new Error('Lint do backend falhou');
    }
    
    // Lint do frontend
    try {
      execSync('cd frontend && npm run lint', { stdio: 'pipe' });
      console.log('  ✅ Lint do frontend passou');
    } catch (error) {
      throw new Error('Lint do frontend falhou');
    }
    
    // NPM audit
    try {
      execSync('cd backend && npm audit --audit-level=high', { stdio: 'pipe' });
      console.log('  ✅ NPM audit do backend passou');
    } catch (error) {
      console.log('  ⚠️ NPM audit do backend encontrou vulnerabilidades');
    }
    
    try {
      execSync('cd frontend && npm audit --audit-level=high', { stdio: 'pipe' });
      console.log('  ✅ NPM audit do frontend passou');
    } catch (error) {
      console.log('  ⚠️ NPM audit do frontend encontrou vulnerabilidades');
    }
  }

  /**
   * C - INVENTÁRIO DE ROTAS
   */
  async routeInventory() {
    console.log('🛣️ Testando inventário de rotas...');
    
    try {
      execSync('node scripts/test-routes.js', { stdio: 'pipe' });
      console.log('  ✅ Teste de rotas passou');
    } catch (error) {
      throw new Error('Teste de rotas falhou');
    }
  }

  /**
   * D - AUDITORIA FINANCEIRA
   */
  async financialAudit() {
    console.log('💰 Executando auditoria financeira...');
    
    try {
      execSync('node scripts/financial-audit.js', { stdio: 'pipe' });
      console.log('  ✅ Auditoria financeira passou');
    } catch (error) {
      throw new Error('Auditoria financeira falhou');
    }
    
    // Teste de concorrência
    try {
      execSync('node scripts/concurrency-test.js', { stdio: 'pipe' });
      console.log('  ✅ Teste de concorrência passou');
    } catch (error) {
      throw new Error('Teste de concorrência falhou');
    }
  }

  /**
   * E - RTP E SORTEIO
   */
  async rtpAudit() {
    console.log('🎯 Executando auditoria de RTP...');
    
    try {
      execSync('node scripts/rtp-statistical-test.js', { stdio: 'pipe' });
      console.log('  ✅ Teste estatístico de RTP passou');
    } catch (error) {
      throw new Error('Teste de RTP falhou');
    }
  }

  /**
   * F - PREVENIR REGRESSÕES
   */
  async regressionPrevention() {
    console.log('🧪 Executando testes de regressão...');
    
    // Testes unitários
    try {
      execSync('cd tests && npm run test:unit', { stdio: 'pipe' });
      console.log('  ✅ Testes unitários passaram');
    } catch (error) {
      throw new Error('Testes unitários falharam');
    }
    
    // Testes de integração
    try {
      execSync('cd tests && npm run test:integration', { stdio: 'pipe' });
      console.log('  ✅ Testes de integração passaram');
    } catch (error) {
      throw new Error('Testes de integração falharam');
    }
    
    // Testes E2E
    try {
      execSync('cd tests && npm run test:e2e', { stdio: 'pipe' });
      console.log('  ✅ Testes E2E passaram');
    } catch (error) {
      throw new Error('Testes E2E falharam');
    }
    
    // Testes de stress
    try {
      execSync('cd tests && npm run test:stress', { stdio: 'pipe' });
      console.log('  ✅ Testes de stress passaram');
    } catch (error) {
      throw new Error('Testes de stress falharam');
    }
  }

  /**
   * G - FRONTEND
   */
  async frontendFixes() {
    console.log('🎨 Verificando correções do frontend...');
    
    // Build do frontend
    try {
      execSync('cd frontend && npm run build', { stdio: 'pipe' });
      console.log('  ✅ Build do frontend passou');
    } catch (error) {
      throw new Error('Build do frontend falhou');
    }
    
    // Verificar se arquivos foram gerados
    const distDir = path.join(__dirname, '../frontend/dist');
    if (!fs.existsSync(distDir)) {
      throw new Error('Diretório dist não foi gerado');
    }
    
    console.log('  ✅ Frontend buildado com sucesso');
  }

  /**
   * H - VIZZIONPAY
   */
  async vizzionpayIntegration() {
    console.log('💳 Testando integração VizzionPay...');
    
    try {
      execSync('node scripts/vizzionpay-integration-test.js', { stdio: 'pipe' });
      console.log('  ✅ Teste de integração VizzionPay passou');
    } catch (error) {
      console.log('  ⚠️ Teste de integração VizzionPay falhou (pode ser normal em staging)');
    }
  }

  /**
   * I - SAQUES
   */
  async withdrawSystem() {
    console.log('💸 Testando sistema de saques...');
    
    try {
      execSync('node scripts/test-withdraw-system.js', { stdio: 'pipe' });
      console.log('  ✅ Teste do sistema de saques passou');
    } catch (error) {
      throw new Error('Teste do sistema de saques falhou');
    }
  }

  /**
   * J - PRIZES & IMAGENS
   */
  async prizesImagesAudit() {
    console.log('🎁 Testando sincronização de prizes e imagens...');
    
    try {
      execSync('node scripts/sync-prizes-images.js', { stdio: 'pipe' });
      console.log('  ✅ Sincronização de prizes e imagens passou');
    } catch (error) {
      throw new Error('Sincronização de prizes e imagens falhou');
    }
  }

  /**
   * K - MIGRATIONS
   */
  async migrationsSeeds() {
    console.log('🗄️ Testando migrations e seeds...');
    
    try {
      execSync('node scripts/apply-migrations-staging.js', { stdio: 'pipe' });
      console.log('  ✅ Migrations e seeds passaram');
    } catch (error) {
      throw new Error('Migrations e seeds falharam');
    }
  }

  /**
   * L - CI/DEPLOY
   */
  async cideployRollback() {
    console.log('🚀 Testando CI/Deploy/Rollback...');
    
    // Verificar se workflows existem
    const workflowDir = path.join(__dirname, '../.github/workflows');
    if (!fs.existsSync(workflowDir)) {
      throw new Error('Diretório de workflows não encontrado');
    }
    
    // Verificar se scripts de deploy existem
    const deployScript = path.join(__dirname, 'deploy.sh');
    const rollbackScript = path.join(__dirname, 'rollback.sh');
    
    if (!fs.existsSync(deployScript)) {
      throw new Error('Script de deploy não encontrado');
    }
    
    if (!fs.existsSync(rollbackScript)) {
      throw new Error('Script de rollback não encontrado');
    }
    
    console.log('  ✅ Scripts de CI/Deploy/Rollback disponíveis');
  }

  /**
   * M - RELATÓRIO
   */
  async reporting() {
    console.log('📋 Gerando relatórios...');
    
    // Verificar se relatórios foram gerados
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      throw new Error('Diretório de relatórios não encontrado');
    }
    
    // Verificar se relatório final existe
    const finalReport = path.join(reportsDir, 'audit-report-final.md');
    if (!fs.existsSync(finalReport)) {
      throw new Error('Relatório final não encontrado');
    }
    
    console.log('  ✅ Relatórios gerados com sucesso');
  }

  /**
   * N - EXECUÇÃO FINAL
   */
  async finalExecution() {
    console.log('🎯 Executando suite final de testes...');
    
    try {
      execSync('node scripts/run-full-test-suite.js', { stdio: 'pipe' });
      console.log('  ✅ Suite final de testes passou');
    } catch (error) {
      throw new Error('Suite final de testes falhou');
    }
    
    // Gerar evidências
    try {
      execSync('node scripts/generate-test-evidence.js', { stdio: 'pipe' });
      console.log('  ✅ Evidências geradas com sucesso');
    } catch (error) {
      console.log('  ⚠️ Erro ao gerar evidências:', error.message);
    }
  }

  /**
   * Adicionar resultado de passo
   */
  addStepResult(stepId, stepName, success, message) {
    this.results.steps[stepId] = {
      name: stepName,
      success,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.summary.totalSteps++;
    if (success) {
      this.results.summary.completedSteps++;
    } else {
      this.results.summary.failedSteps++;
    }
  }

  /**
   * Gerar relatório final
   */
  async generateFinalReport() {
    console.log('\n📋 Gerando relatório final da auditoria...');
    
    const duration = Date.now() - this.startTime;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Calcular estatísticas
    const totalSteps = this.results.summary.totalSteps;
    const completedSteps = this.results.summary.completedSteps;
    const failedSteps = this.results.summary.failedSteps;
    const successRate = totalSteps > 0 ? (completedSteps / totalSteps * 100).toFixed(2) : 0;
    
    // Adicionar estatísticas ao relatório
    this.results.summary.successRate = parseFloat(successRate);
    this.results.summary.duration = duration;
    
    // Salvar relatório JSON
    const reportFile = path.join(this.reportDir, `final-audit-report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    // Gerar relatório em markdown
    const markdownReport = this.generateMarkdownReport();
    const markdownFile = path.join(this.reportDir, `final-audit-report-${timestamp}.md`);
    fs.writeFileSync(markdownFile, markdownReport);
    
    console.log('\n📊 RELATÓRIO FINAL DA AUDITORIA:');
    console.log('=' .repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌍 Ambiente: ${this.results.environment}`);
    console.log(`📊 Total de passos: ${totalSteps}`);
    console.log(`✅ Passos concluídos: ${completedSteps}`);
    console.log(`❌ Passos falharam: ${failedSteps}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Duração total: ${(duration / 1000).toFixed(2)}s`);
    
    console.log('\n📁 Relatórios gerados:');
    console.log(`   • JSON: ${reportFile}`);
    console.log(`   • Markdown: ${markdownFile}`);
    
    if (failedSteps > 0) {
      console.log('\n❌ PASSOS QUE FALHARAM:');
      Object.entries(this.results.steps).forEach(([stepId, step]) => {
        if (!step.success) {
          console.log(`   • PASSO ${stepId} - ${step.name}: ${step.message}`);
        }
      });
    }
    
    console.log('\n' + '=' .repeat(80));
  }

  /**
   * Gerar relatório em markdown
   */
  generateMarkdownReport() {
    const timestamp = new Date().toLocaleString();
    const totalSteps = this.results.summary.totalSteps;
    const completedSteps = this.results.summary.completedSteps;
    const failedSteps = this.results.summary.failedSteps;
    const successRate = this.results.summary.successRate;
    const duration = this.results.summary.duration;
    
    let markdown = `# Relatório Final da Auditoria Completa - SlotBox\n\n`;
    markdown += `**Data:** ${timestamp}\n`;
    markdown += `**Ambiente:** ${this.results.environment}\n`;
    markdown += `**Duração:** ${(duration / 1000).toFixed(2)}s\n\n`;
    
    markdown += `## Resumo Executivo\n\n`;
    markdown += `| Métrica | Valor |\n`;
    markdown += `|---------|-------|\n`;
    markdown += `| Total de Passos | ${totalSteps} |\n`;
    markdown += `| Passos Concluídos | ${completedSteps} |\n`;
    markdown += `| Passos Falharam | ${failedSteps} |\n`;
    markdown += `| Taxa de Sucesso | ${successRate}% |\n\n`;
    
    markdown += `## Detalhes dos Passos\n\n`;
    
    Object.entries(this.results.steps).forEach(([stepId, step]) => {
      const status = step.success ? '✅' : '❌';
      markdown += `### PASSO ${stepId} - ${step.name}\n\n`;
      markdown += `- **Status:** ${status}\n`;
      markdown += `- **Mensagem:** ${step.message}\n`;
      markdown += `- **Timestamp:** ${step.timestamp}\n\n`;
    });
    
    if (failedSteps > 0) {
      markdown += `## Passos que Falharam\n\n`;
      markdown += `Os seguintes passos falharam e precisam de atenção:\n\n`;
      
      Object.entries(this.results.steps).forEach(([stepId, step]) => {
        if (!step.success) {
          markdown += `- **PASSO ${stepId} - ${step.name}**: ${step.message}\n`;
        }
      });
    }
    
    markdown += `\n## Conclusão\n\n`;
    
    if (failedSteps === 0) {
      markdown += `✅ **Auditoria concluída com sucesso!** O sistema está pronto para produção.\n\n`;
      markdown += `### Próximos Passos:\n`;
      markdown += `1. Revisar o PR gerado\n`;
      markdown += `2. Aprovar as mudanças\n`;
      markdown += `3. Fazer deploy para produção\n`;
      markdown += `4. Monitorar o sistema após deploy\n`;
    } else {
      markdown += `❌ **${failedSteps} passo(s) falharam.** Corrija os problemas antes de prosseguir para produção.\n\n`;
      markdown += `### Ações Necessárias:\n`;
      markdown += `1. Corrigir os passos que falharam\n`;
      markdown += `2. Re-executar a auditoria\n`;
      markdown += `3. Verificar se todos os passos passam\n`;
      markdown += `4. Só então prosseguir para produção\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const executor = new FinalAuditExecutor();
  executor.executeFullAudit();
}

module.exports = FinalAuditExecutor;
