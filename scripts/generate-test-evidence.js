/**
 * Script para Gerar Evidências dos Testes
 * Captura screenshots, logs e métricas para auditoria
 */

require('dotenv').config({ path: 'backend/.env.production' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestEvidenceGenerator {
  constructor() {
    this.evidenceDir = path.join(__dirname, '../reports/evidence');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Gerar todas as evidências
   */
  async generateAllEvidence() {
    console.log('📸 Gerando evidências dos testes...\n');

    try {
      // Criar diretório de evidências
      if (!fs.existsSync(this.evidenceDir)) {
        fs.mkdirSync(this.evidenceDir, { recursive: true });
      }

      // 1. Screenshots dos testes E2E
      await this.captureE2EScreenshots();

      // 2. Logs do sistema
      await this.captureSystemLogs();

      // 3. Métricas de performance
      await this.capturePerformanceMetrics();

      // 4. Estado do banco de dados
      await this.captureDatabaseState();

      // 5. Configurações do sistema
      await this.captureSystemConfig();

      // 6. Relatório de vulnerabilidades
      await this.captureVulnerabilityReport();

      // 7. Relatório de dependências
      await this.captureDependencyReport();

      // 8. Relatório de cobertura de testes
      await this.captureTestCoverage();

      // 9. Relatório de auditoria financeira
      await this.captureFinancialAudit();

      // 10. Relatório de RTP
      await this.captureRTPReport();

      console.log('\n✅ Todas as evidências foram geradas com sucesso!');
      console.log(`📁 Diretório: ${this.evidenceDir}`);

    } catch (error) {
      console.error('❌ Erro ao gerar evidências:', error);
      throw error;
    }
  }

  /**
   * Capturar screenshots dos testes E2E
   */
  async captureE2EScreenshots() {
    console.log('📸 Capturando screenshots dos testes E2E...');
    
    try {
      // Executar testes E2E com screenshots
      const output = execSync('cd tests && npm run test:e2e:screenshots', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Copiar screenshots para diretório de evidências
      const screenshotsDir = path.join(this.evidenceDir, 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      
      // Copiar arquivos de screenshot se existirem
      const testScreenshotsDir = path.join(__dirname, '../tests/screenshots');
      if (fs.existsSync(testScreenshotsDir)) {
        execSync(`cp -r "${testScreenshotsDir}"/* "${screenshotsDir}/"`, { stdio: 'pipe' });
      }
      
      console.log('  ✅ Screenshots capturados');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar screenshots:', error.message);
    }
  }

  /**
   * Capturar logs do sistema
   */
  async captureSystemLogs() {
    console.log('📋 Capturando logs do sistema...');
    
    try {
      const logsDir = path.join(this.evidenceDir, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Capturar logs do backend
      const backendLogsDir = path.join(__dirname, '../backend/logs');
      if (fs.existsSync(backendLogsDir)) {
        execSync(`cp -r "${backendLogsDir}"/* "${logsDir}/"`, { stdio: 'pipe' });
      }
      
      // Capturar logs do sistema
      const systemLogs = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'staging',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      fs.writeFileSync(
        path.join(logsDir, 'system-info.json'),
        JSON.stringify(systemLogs, null, 2)
      );
      
      console.log('  ✅ Logs capturados');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar logs:', error.message);
    }
  }

  /**
   * Capturar métricas de performance
   */
  async capturePerformanceMetrics() {
    console.log('⚡ Capturando métricas de performance...');
    
    try {
      const metricsDir = path.join(this.evidenceDir, 'performance');
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }
      
      // Executar testes de performance
      const output = execSync('cd tests && npm run test:performance', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Salvar métricas
      const metrics = {
        timestamp: new Date().toISOString(),
        output: output,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };
      
      fs.writeFileSync(
        path.join(metricsDir, 'performance-metrics.json'),
        JSON.stringify(metrics, null, 2)
      );
      
      console.log('  ✅ Métricas de performance capturadas');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar métricas:', error.message);
    }
  }

  /**
   * Capturar estado do banco de dados
   */
  async captureDatabaseState() {
    console.log('🗄️ Capturando estado do banco de dados...');
    
    try {
      const dbDir = path.join(this.evidenceDir, 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      // Executar script de auditoria financeira
      const output = execSync('node scripts/financial-audit.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Salvar estado do banco
      const dbState = {
        timestamp: new Date().toISOString(),
        auditOutput: output,
        tables: [
          'users', 'transactions', 'payments', 'cases', 'prizes',
          'affiliates', 'wallets', 'rtpConfigs', 'drawDetailedLogs'
        ]
      };
      
      fs.writeFileSync(
        path.join(dbDir, 'database-state.json'),
        JSON.stringify(dbState, null, 2)
      );
      
      console.log('  ✅ Estado do banco capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar estado do banco:', error.message);
    }
  }

  /**
   * Capturar configurações do sistema
   */
  async captureSystemConfig() {
    console.log('⚙️ Capturando configurações do sistema...');
    
    try {
      const configDir = path.join(this.evidenceDir, 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Capturar configurações (sem dados sensíveis)
      const config = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'staging',
        databaseUrl: process.env.DATABASE_URL ? '***configured***' : 'not configured',
        vizzionPublicKey: process.env.VIZZION_PUBLIC_KEY ? '***configured***' : 'not configured',
        vizzionSecretKey: process.env.VIZZION_SECRET_KEY ? '***configured***' : 'not configured',
        jwtSecret: process.env.JWT_SECRET ? '***configured***' : 'not configured',
        frontendUrl: process.env.FRONTEND_URL || 'not configured',
        apiUrl: process.env.API_URL || 'not configured'
      };
      
      fs.writeFileSync(
        path.join(configDir, 'system-config.json'),
        JSON.stringify(config, null, 2)
      );
      
      console.log('  ✅ Configurações capturadas');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar configurações:', error.message);
    }
  }

  /**
   * Capturar relatório de vulnerabilidades
   */
  async captureVulnerabilityReport() {
    console.log('🔒 Capturando relatório de vulnerabilidades...');
    
    try {
      const securityDir = path.join(this.evidenceDir, 'security');
      if (!fs.existsSync(securityDir)) {
        fs.mkdirSync(securityDir, { recursive: true });
      }
      
      // Executar npm audit
      const backendAudit = execSync('cd backend && npm audit --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const frontendAudit = execSync('cd frontend && npm audit --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Salvar relatórios
      fs.writeFileSync(
        path.join(securityDir, 'backend-vulnerabilities.json'),
        backendAudit
      );
      
      fs.writeFileSync(
        path.join(securityDir, 'frontend-vulnerabilities.json'),
        frontendAudit
      );
      
      console.log('  ✅ Relatório de vulnerabilidades capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar relatório de vulnerabilidades:', error.message);
    }
  }

  /**
   * Capturar relatório de dependências
   */
  async captureDependencyReport() {
    console.log('📦 Capturando relatório de dependências...');
    
    try {
      const depsDir = path.join(this.evidenceDir, 'dependencies');
      if (!fs.existsSync(depsDir)) {
        fs.mkdirSync(depsDir, { recursive: true });
      }
      
      // Capturar package.json e package-lock.json
      const backendPackage = fs.readFileSync(path.join(__dirname, '../backend/package.json'), 'utf8');
      const frontendPackage = fs.readFileSync(path.join(__dirname, '../frontend/package.json'), 'utf8');
      
      fs.writeFileSync(
        path.join(depsDir, 'backend-package.json'),
        backendPackage
      );
      
      fs.writeFileSync(
        path.join(depsDir, 'frontend-package.json'),
        frontendPackage
      );
      
      console.log('  ✅ Relatório de dependências capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar relatório de dependências:', error.message);
    }
  }

  /**
   * Capturar relatório de cobertura de testes
   */
  async captureTestCoverage() {
    console.log('📊 Capturando relatório de cobertura de testes...');
    
    try {
      const coverageDir = path.join(this.evidenceDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }
      
      // Executar testes com cobertura
      const output = execSync('cd tests && npm run test:coverage', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Copiar relatório de cobertura se existir
      const coverageReportDir = path.join(__dirname, '../tests/coverage');
      if (fs.existsSync(coverageReportDir)) {
        execSync(`cp -r "${coverageReportDir}"/* "${coverageDir}/"`, { stdio: 'pipe' });
      }
      
      console.log('  ✅ Relatório de cobertura capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar relatório de cobertura:', error.message);
    }
  }

  /**
   * Capturar relatório de auditoria financeira
   */
  async captureFinancialAudit() {
    console.log('💰 Capturando relatório de auditoria financeira...');
    
    try {
      const auditDir = path.join(this.evidenceDir, 'audit');
      if (!fs.existsSync(auditDir)) {
        fs.mkdirSync(auditDir, { recursive: true });
      }
      
      // Executar auditoria financeira
      const output = execSync('node scripts/financial-audit.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Salvar relatório
      fs.writeFileSync(
        path.join(auditDir, 'financial-audit-report.txt'),
        output
      );
      
      console.log('  ✅ Relatório de auditoria financeira capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar relatório de auditoria:', error.message);
    }
  }

  /**
   * Capturar relatório de RTP
   */
  async captureRTPReport() {
    console.log('🎯 Capturando relatório de RTP...');
    
    try {
      const rtpDir = path.join(this.evidenceDir, 'rtp');
      if (!fs.existsSync(rtpDir)) {
        fs.mkdirSync(rtpDir, { recursive: true });
      }
      
      // Executar testes de RTP
      const output = execSync('node scripts/rtp-statistical-test.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Salvar relatório
      fs.writeFileSync(
        path.join(rtpDir, 'rtp-statistical-report.txt'),
        output
      );
      
      console.log('  ✅ Relatório de RTP capturado');
      
    } catch (error) {
      console.log('  ⚠️ Erro ao capturar relatório de RTP:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const generator = new TestEvidenceGenerator();
  generator.generateAllEvidence();
}

module.exports = TestEvidenceGenerator;
