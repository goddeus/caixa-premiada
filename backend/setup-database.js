/**
 * Script de setup inicial do banco - EXECUTAR APENAS UMA VEZ
 * Este script deve ser executado manualmente apenas na primeira configuração
 */

require('dotenv').config();
const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔧 SETUP INICIAL DO BANCO DE DADOS');
  console.log('⚠️  ESTE SCRIPT DEVE SER EXECUTADO APENAS UMA VEZ!');
  console.log('=' .repeat(50));

  try {
    // 1. Gerar cliente Prisma
    console.log('🔧 Gerando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma gerado!');

    // 2. Aplicar schema
    console.log('📊 Aplicando schema do Prisma...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schema aplicado com sucesso!');

    // 3. Criar contas essenciais
    console.log('\n👥 Criando contas essenciais...');
    const { createEssentialAccounts } = require('./recreate-essential-accounts');
    await createEssentialAccounts();
    console.log('✅ Contas criadas com sucesso!');

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 SETUP CONCLUÍDO COM SUCESSO!');
    console.log('✅ Banco configurado e populado');
    console.log('✅ Contas admin e demo criadas');
    console.log('✅ Caixas e prêmios configurados');
    console.log('✅ Sistema pronto para uso!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
