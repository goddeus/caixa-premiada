const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Ler o arquivo SQL de migração
    const migrationPath = path.join(__dirname, 'migrations', 'add_user_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migração
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📋 Campos adicionados:');
    console.log('   - username (TEXT)');
    console.log('   - telefone (TEXT)');
    console.log('   - Índice para username');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
