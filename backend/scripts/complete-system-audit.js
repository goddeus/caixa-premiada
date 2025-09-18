const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Script de Auditoria Completa do Sistema
 * Verifica todos os aspectos críticos do sistema
 */
class CompleteSystemAudit {
  
  async runAudit() {
    console.log('🔍 AUDITORIA COMPLETA DO SISTEMA');
    console.log('================================\n');
    
    const results = {
      database: { status: 'pending', issues: [] },
      services: { status: 'pending', issues: [] },
      controllers: { status: 'pending', issues: [] },
      schema: { status: 'pending', issues: [] },
      prizes: { status: 'pending', issues: [] },
      users: { status: 'pending', issues: [] }
    };
    
    try {
      // 1. AUDITORIA DO BANCO DE DADOS
      console.log('📊 1. AUDITORIA DO BANCO DE DADOS');
      console.log('================================');
      await this.auditDatabase(results);
      
      // 2. AUDITORIA DOS SERVIÇOS
      console.log('\n🔧 2. AUDITORIA DOS SERVIÇOS');
      console.log('============================');
      await this.auditServices(results);
      
      // 3. AUDITORIA DOS CONTROLLERS
      console.log('\n🎮 3. AUDITORIA DOS CONTROLLERS');
      console.log('==============================');
      await this.auditControllers(results);
      
      // 4. AUDITORIA DO SCHEMA
      console.log('\n📋 4. AUDITORIA DO SCHEMA');
      console.log('=========================');
      await this.auditSchema(results);
      
      // 5. AUDITORIA DOS PRÊMIOS
      console.log('\n🎁 5. AUDITORIA DOS PRÊMIOS');
      console.log('===========================');
      await this.auditPrizes(results);
      
      // 6. AUDITORIA DOS USUÁRIOS
      console.log('\n👥 6. AUDITORIA DOS USUÁRIOS');
      console.log('============================');
      await this.auditUsers(results);
      
      // 7. RELATÓRIO FINAL
      console.log('\n📊 RELATÓRIO FINAL');
      console.log('==================');
      this.generateFinalReport(results);
      
    } catch (error) {
      console.error('❌ Erro durante a auditoria:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  async auditDatabase(results) {
    try {
      // Verificar conexão
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com banco de dados: OK');
      
      // Verificar tabelas essenciais
      const tables = ['users', 'cases', 'prizes', 'transactions', 'wallets'];
      for (const table of tables) {
        try {
          await prisma.$queryRaw`SELECT 1 FROM ${table} LIMIT 1`;
          console.log(`✅ Tabela ${table}: OK`);
        } catch (error) {
          results.database.issues.push(`Tabela ${table} não encontrada`);
          console.log(`❌ Tabela ${table}: ERRO`);
        }
      }
      
      // Verificar campos de saldo
      const userColumns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name LIKE '%saldo%'
      `;
      
      const hasSaldoReais = userColumns.some(col => col.column_name === 'saldo_reais');
      const hasSaldoDemo = userColumns.some(col => col.column_name === 'saldo_demo');
      const hasOldSaldo = userColumns.some(col => col.column_name === 'saldo');
      
      if (hasSaldoReais && hasSaldoDemo) {
        console.log('✅ Campos de saldo: OK (saldo_reais, saldo_demo)');
      } else {
        results.database.issues.push('Campos de saldo inconsistentes');
        console.log('❌ Campos de saldo: INCONSISTENTE');
      }
      
      if (hasOldSaldo) {
        results.database.issues.push('Campo saldo antigo ainda existe');
        console.log('⚠️ Campo saldo antigo ainda existe');
      }
      
      results.database.status = results.database.issues.length === 0 ? 'OK' : 'ISSUES';
      
    } catch (error) {
      results.database.status = 'ERROR';
      results.database.issues.push(`Erro de conexão: ${error.message}`);
      console.log('❌ Erro na auditoria do banco:', error.message);
    }
  }
  
  async auditServices(results) {
    const serviceFiles = [
      'src/services/casesService.js',
      'src/services/walletService.js',
      'src/services/userSessionService.js',
      'src/services/prizeAuditService.js'
    ];
    
    for (const serviceFile of serviceFiles) {
      try {
        const filePath = path.join(__dirname, '..', serviceFile);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Verificar se há serviços comentados
        const commentedServices = content.match(/\/\/ const .*Service.*require/g);
        if (commentedServices && commentedServices.length > 0) {
          results.services.issues.push(`${serviceFile}: ${commentedServices.length} serviços comentados`);
          console.log(`⚠️ ${serviceFile}: ${commentedServices.length} serviços comentados`);
        } else {
          console.log(`✅ ${serviceFile}: OK`);
        }
        
        // Verificar se há validações mock
        const mockValidations = content.match(/success.*true.*message.*não disponível/g);
        if (mockValidations && mockValidations.length > 0) {
          results.services.issues.push(`${serviceFile}: ${mockValidations.length} validações mock`);
          console.log(`⚠️ ${serviceFile}: ${mockValidations.length} validações mock`);
        }
        
      } catch (error) {
        results.services.issues.push(`${serviceFile}: Erro ao ler arquivo`);
        console.log(`❌ ${serviceFile}: Erro ao ler arquivo`);
      }
    }
    
    results.services.status = results.services.issues.length === 0 ? 'OK' : 'ISSUES';
  }
  
  async auditControllers(results) {
    const controllerFiles = [
      'src/controllers/casesController.js',
      'src/controllers/prizeValidationController.js',
      'src/controllers/prizeController.js'
    ];
    
    for (const controllerFile of controllerFiles) {
      try {
        const filePath = path.join(__dirname, '..', controllerFile);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Verificar se há serviços comentados
        const commentedServices = content.match(/\/\/ const .*Service.*require/g);
        if (commentedServices && commentedServices.length > 0) {
          results.controllers.issues.push(`${controllerFile}: ${commentedServices.length} serviços comentados`);
          console.log(`⚠️ ${controllerFile}: ${commentedServices.length} serviços comentados`);
        } else {
          console.log(`✅ ${controllerFile}: OK`);
        }
        
      } catch (error) {
        results.controllers.issues.push(`${controllerFile}: Erro ao ler arquivo`);
        console.log(`❌ ${controllerFile}: Erro ao ler arquivo`);
      }
    }
    
    results.controllers.status = results.controllers.issues.length === 0 ? 'OK' : 'ISSUES';
  }
  
  async auditSchema(results) {
    try {
      // Verificar se o schema é válido
      const { execSync } = require('child_process');
      execSync('npx prisma validate', { cwd: path.join(__dirname, '..') });
      console.log('✅ Schema Prisma: Válido');
      results.schema.status = 'OK';
    } catch (error) {
      results.schema.status = 'ERROR';
      results.schema.issues.push(`Schema inválido: ${error.message}`);
      console.log('❌ Schema Prisma: Inválido');
    }
  }
  
  async auditPrizes(results) {
    try {
      // Verificar se há prêmios ativos
      const activePrizes = await prisma.prize.count({
        where: { ativo: true }
      });
      
      console.log(`✅ Prêmios ativos: ${activePrizes}`);
      
      // Verificar se há prêmios sem probabilidade
      const prizesWithoutProbability = await prisma.prize.count({
        where: {
          ativo: true,
          probabilidade: 0
        }
      });
      
      if (prizesWithoutProbability > 0) {
        results.prizes.issues.push(`${prizesWithoutProbability} prêmios sem probabilidade`);
        console.log(`⚠️ Prêmios sem probabilidade: ${prizesWithoutProbability}`);
      } else {
        console.log('✅ Todos os prêmios têm probabilidade definida');
      }
      
      // Verificar se há prêmios ilustrativos
      const illustrativePrizes = await prisma.prize.count({
        where: {
          ativo: true,
          ilustrativo: true
        }
      });
      
      console.log(`✅ Prêmios ilustrativos: ${illustrativePrizes}`);
      
      results.prizes.status = results.prizes.issues.length === 0 ? 'OK' : 'ISSUES';
      
    } catch (error) {
      results.prizes.status = 'ERROR';
      results.prizes.issues.push(`Erro na auditoria de prêmios: ${error.message}`);
      console.log('❌ Erro na auditoria de prêmios:', error.message);
    }
  }
  
  async auditUsers(results) {
    try {
      // Verificar usuários ativos
      const activeUsers = await prisma.user.count({
        where: { ativo: true }
      });
      
      console.log(`✅ Usuários ativos: ${activeUsers}`);
      
      // Verificar contas demo
      const demoUsers = await prisma.user.count({
        where: {
          ativo: true,
          tipo_conta: 'afiliado_demo'
        }
      });
      
      console.log(`✅ Contas demo: ${demoUsers}`);
      
      // Verificar usuários com saldo inconsistente
      const usersWithInconsistentBalance = await prisma.user.findMany({
        where: {
          ativo: true,
          OR: [
            { saldo_reais: { lt: 0 } },
            { saldo_demo: { lt: 0 } }
          ]
        }
      });
      
      if (usersWithInconsistentBalance.length > 0) {
        results.users.issues.push(`${usersWithInconsistentBalance.length} usuários com saldo negativo`);
        console.log(`⚠️ Usuários com saldo negativo: ${usersWithInconsistentBalance.length}`);
      } else {
        console.log('✅ Todos os usuários têm saldo válido');
      }
      
      results.users.status = results.users.issues.length === 0 ? 'OK' : 'ISSUES';
      
    } catch (error) {
      results.users.status = 'ERROR';
      results.users.issues.push(`Erro na auditoria de usuários: ${error.message}`);
      console.log('❌ Erro na auditoria de usuários:', error.message);
    }
  }
  
  generateFinalReport(results) {
    const totalIssues = Object.values(results).reduce((sum, result) => {
      return sum + (result.issues ? result.issues.length : 0);
    }, 0);
    
    console.log(`\n📊 RESUMO DA AUDITORIA:`);
    console.log(`=======================`);
    console.log(`🔍 Total de problemas encontrados: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.log('🎉 SISTEMA 100% FUNCIONAL!');
      console.log('✅ Todas as verificações passaram com sucesso');
    } else {
      console.log('⚠️ PROBLEMAS ENCONTRADOS:');
      
      Object.entries(results).forEach(([category, result]) => {
        if (result.issues && result.issues.length > 0) {
          console.log(`\n📋 ${category.toUpperCase()}:`);
          result.issues.forEach(issue => {
            console.log(`   - ${issue}`);
          });
        }
      });
    }
    
    // Salvar relatório
    const reportPath = path.join(__dirname, '..', 'logs', 'audit-report.json');
    fs.writeFile(reportPath, JSON.stringify(results, null, 2))
      .then(() => console.log(`\n📄 Relatório salvo em: ${reportPath}`))
      .catch(err => console.log(`⚠️ Erro ao salvar relatório: ${err.message}`));
  }
}

// Executar auditoria
if (require.main === module) {
  const audit = new CompleteSystemAudit();
  audit.runAudit().catch(console.error);
}

module.exports = CompleteSystemAudit;
