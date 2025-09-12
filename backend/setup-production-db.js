const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupProductionDatabase() {
  try {
    console.log('🚀 Configurando banco de dados para produção...');
    
    // 1. Verificar conexão
    console.log('📡 Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // 2. Executar migrações
    console.log('🔄 Executando migrações...');
    // As migrações já foram executadas pelo Prisma
    
    // 3. Criar contas essenciais
    console.log('👤 Criando contas essenciais...');
    
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@slotbox.shop' }
    });
    
    if (!existingAdmin) {
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('admin123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@slotbox.shop',
          senha_hash: adminPassword,
          cpf: '00000000000',
          is_admin: true,
          saldo_reais: 10000.00,
          primeiro_deposito_feito: true,
          rollover_liberado: true
        }
      });
      
      // Criar wallet para admin
      await prisma.wallet.create({
        data: {
          user_id: admin.id,
          saldo_reais: 10000.00
        }
      });
      
      console.log('✅ Conta admin criada: admin@slotbox.shop / admin123456');
    } else {
      console.log('ℹ️ Conta admin já existe');
    }
    
    // 4. Verificar caixas
    console.log('📦 Verificando caixas...');
    const cases = await prisma.case.findMany();
    console.log(`✅ ${cases.length} caixas encontradas`);
    
    // 5. Verificar prêmios
    console.log('🎁 Verificando prêmios...');
    const prizes = await prisma.prize.findMany();
    console.log(`✅ ${prizes.length} prêmios encontrados`);
    
    // 6. Estatísticas gerais
    console.log('📊 Estatísticas do banco:');
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.prize.count(),
      prisma.transaction.count()
    ]);
    
    console.log(`   👥 Usuários: ${stats[0]}`);
    console.log(`   📦 Caixas: ${stats[1]}`);
    console.log(`   🎁 Prêmios: ${stats[2]}`);
    console.log(`   💰 Transações: ${stats[3]}`);
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = setupProductionDatabase;
