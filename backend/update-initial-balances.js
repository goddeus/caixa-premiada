const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateInitialBalances() {
  console.log('🔄 Atualizando saldos iniciais para R$ 100,00...');
  
  try {
    // Atualizar contas admin e demo para ter R$ 100,00
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { is_admin: true },
          { tipo_conta: 'afiliado_demo' }
        ]
      },
      data: {
        saldo_reais: 100.00,
        saldo_demo: 100.00
      }
    });
    
    console.log(`✅ ${result.count} usuários atualizados com saldo inicial de R$ 100,00`);
    
    // Atualizar carteiras correspondentes
    const walletResult = await prisma.wallet.updateMany({
      where: {
        user: {
          OR: [
            { is_admin: true },
            { tipo_conta: 'afiliado_demo' }
          ]
        }
      },
      data: {
        saldo_reais: 100.00,
        saldo_demo: 100.00
      }
    });
    
    console.log(`✅ ${walletResult.count} carteiras atualizadas com saldo inicial de R$ 100,00`);
    
    // Listar usuários atualizados
    const updatedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { is_admin: true },
          { tipo_conta: 'afiliado_demo' }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        is_admin: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });
    
    console.log('\n📊 Usuários atualizados:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - Admin: ${user.is_admin}, Tipo: ${user.tipo_conta}, Saldo Reais: R$ ${user.saldo_reais}, Saldo Demo: R$ ${user.saldo_demo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar saldos iniciais:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateInitialBalances();
