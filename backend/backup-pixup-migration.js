const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups', `pixup_migration_backup_${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('🔄 Iniciando backup do banco de dados...');
    console.log(`📁 Diretório de backup: ${backupDir}`);
    
    // Backup das tabelas principais
    const tables = [
      'User', 'Wallet', 'Transaction', 'Payment', 'Deposit', 'Withdrawal',
      'Case', 'Prize', 'Affiliate', 'AffiliateHistory', 'AffiliateCommission',
      'PurchaseAudit', 'UserBehavior', 'LoginHistory', 'UserRTPSession',
      'UserSession', 'DrawDetailedLog', 'RTPConfig'
    ];
    
    const backupData = {};
    
    for (const table of tables) {
      try {
        const data = await prisma[table.toLowerCase()].findMany();
        backupData[table] = data;
        console.log(`✅ ${table}: ${data.length} registros`);
      } catch (error) {
        console.log(`⚠️ ${table}: Tabela não encontrada ou erro - ${error.message}`);
      }
    }
    
    // Salvar backup em JSON
    const backupFile = path.join(backupDir, 'database_backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    // Salvar metadados do backup
    const metadata = {
      timestamp: new Date().toISOString(),
      branch: 'migration/pixup-fullcomplete-20250120',
      purpose: 'Backup antes da migração VizzionPay -> Pixup',
      tables: Object.keys(backupData),
      totalRecords: Object.values(backupData).reduce((sum, records) => sum + records.length, 0)
    };
    
    const metadataFile = path.join(backupDir, 'backup_metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    console.log('✅ Backup concluído com sucesso!');
    console.log(`📊 Total de registros: ${metadata.totalRecords}`);
    console.log(`📁 Arquivo de backup: ${backupFile}`);
    console.log(`📋 Metadados: ${metadataFile}`);
    
  } catch (error) {
    console.error('❌ Erro durante o backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('🎉 Backup finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha no backup:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };
