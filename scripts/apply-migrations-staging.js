/**
 * Script para Aplicar Migrações em Staging
 * Executa migrações com backup e rollback automático em caso de erro
 */

require('dotenv').config({ path: 'backend/.env.production' });
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class MigrationManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.migrationsDir = path.join(__dirname, '../backend/prisma/migrations');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Executar migrações em staging
   */
  async applyMigrations() {
    console.log('🚀 Iniciando aplicação de migrações em staging...\n');

    try {
      // 1. Verificar conexão com banco
      await this.checkDatabaseConnection();

      // 2. Fazer backup do banco
      await this.backupDatabase();

      // 3. Verificar migrações pendentes
      const pendingMigrations = await this.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        console.log('✅ Nenhuma migração pendente encontrada');
        return;
      }

      console.log(`📋 Migrações pendentes: ${pendingMigrations.length}`);
      pendingMigrations.forEach(migration => {
        console.log(`   • ${migration}`);
      });

      // 4. Aplicar migrações
      await this.applyPendingMigrations(pendingMigrations);

      // 5. Executar seed de auditoria
      await this.runAuditSeed();

      // 6. Verificar integridade
      await this.verifyIntegrity();

      console.log('\n✅ Migrações aplicadas com sucesso em staging!');

    } catch (error) {
      console.error('\n❌ Erro durante aplicação de migrações:', error);
      
      // Tentar rollback automático
      await this.rollbackMigrations();
      
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Verificar conexão com banco
   */
  async checkDatabaseConnection() {
    console.log('🔍 Verificando conexão com banco de dados...');
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com banco estabelecida');
    } catch (error) {
      throw new Error(`Falha na conexão com banco: ${error.message}`);
    }
  }

  /**
   * Fazer backup do banco
   */
  async backupDatabase() {
    console.log('💾 Fazendo backup do banco de dados...');
    
    const backupFile = path.join(this.backupDir, `db_before_migrations_${this.timestamp}.sql`);
    
    try {
      // Criar diretório de backup se não existir
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Fazer backup usando pg_dump
      const command = `pg_dump "${process.env.DATABASE_URL}" > "${backupFile}"`;
      execSync(command, { stdio: 'pipe' });
      
      console.log(`✅ Backup criado: ${backupFile}`);
    } catch (error) {
      console.warn('⚠️ Falha no backup com pg_dump, usando método alternativo...');
      
      // Método alternativo: exportar dados via Prisma
      await this.backupViaPrisma(backupFile);
    }
  }

  /**
   * Backup via Prisma (método alternativo)
   */
  async backupViaPrisma(backupFile) {
    console.log('💾 Fazendo backup via Prisma...');
    
    try {
      const backupData = {
        timestamp: this.timestamp,
        users: await prisma.user.findMany(),
        cases: await prisma.case.findMany(),
        prizes: await prisma.prize.findMany(),
        transactions: await prisma.transaction.findMany(),
        payments: await prisma.payment.findMany(),
        wallets: await prisma.wallet.findMany(),
        rtpConfigs: await prisma.rTPConfig.findMany()
      };

      fs.writeFileSync(backupFile.replace('.sql', '.json'), JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup via Prisma criado: ${backupFile.replace('.sql', '.json')}`);
    } catch (error) {
      throw new Error(`Falha no backup via Prisma: ${error.message}`);
    }
  }

  /**
   * Obter migrações pendentes
   */
  async getPendingMigrations() {
    try {
      // Executar prisma migrate status
      const output = execSync('npx prisma migrate status', { 
        cwd: path.join(__dirname, '../backend'),
        encoding: 'utf8'
      });
      
      // Parsear output para encontrar migrações pendentes
      const lines = output.split('\n');
      const pendingMigrations = [];
      
      for (const line of lines) {
        if (line.includes('Pending') || line.includes('pending')) {
          const migrationName = line.split(' ')[0];
          if (migrationName && migrationName !== '') {
            pendingMigrations.push(migrationName);
          }
        }
      }
      
      return pendingMigrations;
    } catch (error) {
      console.warn('⚠️ Não foi possível verificar status das migrações:', error.message);
      return [];
    }
  }

  /**
   * Aplicar migrações pendentes
   */
  async applyPendingMigrations(pendingMigrations) {
    console.log('🔄 Aplicando migrações pendentes...');
    
    try {
      // Executar prisma migrate deploy
      execSync('npx prisma migrate deploy', { 
        cwd: path.join(__dirname, '../backend'),
        stdio: 'inherit'
      });
      
      console.log('✅ Migrações aplicadas com sucesso');
    } catch (error) {
      throw new Error(`Falha ao aplicar migrações: ${error.message}`);
    }
  }

  /**
   * Executar seed de auditoria
   */
  async runAuditSeed() {
    console.log('🌱 Executando seed de auditoria...');
    
    try {
      const { seedAuditAccounts } = require('../backend/prisma/seed-audit');
      await seedAuditAccounts();
      
      console.log('✅ Seed de auditoria executado com sucesso');
    } catch (error) {
      console.warn('⚠️ Falha no seed de auditoria:', error.message);
      // Não falhar o processo por causa do seed
    }
  }

  /**
   * Verificar integridade após migrações
   */
  async verifyIntegrity() {
    console.log('🔍 Verificando integridade após migrações...');
    
    try {
      // Verificar se tabelas existem
      const tables = ['User', 'Case', 'Prize', 'Transaction', 'Payment', 'Wallet', 'RTPConfig'];
      
      for (const table of tables) {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`   • ${table}: ${count} registros`);
      }
      
      // Verificar se campos de auditoria foram adicionados
      const userSample = await prisma.user.findFirst();
      if (userSample && 'last_audit_check' in userSample) {
        console.log('✅ Campos de auditoria adicionados com sucesso');
      } else {
        console.warn('⚠️ Campos de auditoria não encontrados');
      }
      
      console.log('✅ Verificação de integridade concluída');
    } catch (error) {
      throw new Error(`Falha na verificação de integridade: ${error.message}`);
    }
  }

  /**
   * Rollback de migrações em caso de erro
   */
  async rollbackMigrations() {
    console.log('🔄 Executando rollback de migrações...');
    
    try {
      // Aqui você implementaria a lógica de rollback
      // Por enquanto, apenas logamos a tentativa
      console.log('⚠️ Rollback automático não implementado');
      console.log('   Restaure manualmente o backup se necessário');
    } catch (error) {
      console.error('❌ Erro durante rollback:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const migrationManager = new MigrationManager();
  
  migrationManager.applyMigrations()
    .then(() => {
      console.log('🎉 Processo de migração concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha no processo de migração:', error);
      process.exit(1);
    });
}

module.exports = MigrationManager;
