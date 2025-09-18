const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script para debugar sincronização de saldo entre user e wallet
 */
class BalanceSyncDebugger {

  async debugSync() {
    console.log('🔍 DEBUGANDO SINCRONIZAÇÃO DE SALDO');
    console.log('===================================\n');

    try {
      // Buscar usuários com diferenças entre user.saldo_reais e wallet.saldo_reais
      const users = await prisma.user.findMany({
        include: {
          wallet: true
        }
      });

      console.log(`👥 Total de usuários: ${users.length}\n`);

      let syncIssues = 0;
      let totalDifference = 0;

      for (const user of users) {
        const userBalance = user.saldo_reais;
        const walletBalance = user.wallet?.saldo_reais || 0;
        const difference = Math.abs(userBalance - walletBalance);

        if (difference > 0.01) {
          syncIssues++;
          totalDifference += difference;
          
          console.log(`❌ Usuário: ${user.nome} (${user.email})`);
          console.log(`   💰 User.saldo_reais: R$ ${userBalance.toFixed(2)}`);
          console.log(`   💰 Wallet.saldo_reais: R$ ${walletBalance.toFixed(2)}`);
          console.log(`   ⚠️ Diferença: R$ ${difference.toFixed(2)}`);
          console.log('');

          // Corrigir sincronização
          await this.fixUserSync(user.id, userBalance);
        }
      }

      console.log(`📊 RESUMO:`);
      console.log(`   👥 Usuários com problemas: ${syncIssues}`);
      console.log(`   💰 Diferença total: R$ ${totalDifference.toFixed(2)}`);

      if (syncIssues === 0) {
        console.log(`✅ Todos os usuários estão sincronizados!`);
      } else {
        console.log(`🔧 ${syncIssues} usuários foram corrigidos!`);
      }

    } catch (error) {
      console.error('❌ Erro no debug:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async fixUserSync(userId, correctBalance) {
    try {
      // Atualizar wallet com o saldo correto do user
      await prisma.wallet.update({
        where: { user_id: userId },
        data: { saldo_reais: correctBalance }
      });
      console.log(`   ✅ Sincronização corrigida para usuário ${userId}`);
    } catch (error) {
      console.log(`   ❌ Erro ao corrigir usuário ${userId}: ${error.message}`);
    }
  }

  async checkTransactionConsistency() {
    console.log('\n🔍 VERIFICANDO CONSISTÊNCIA DAS TRANSAÇÕES');
    console.log('==========================================\n');

    try {
      // Buscar todas as transações de um usuário específico
      const testUser = await prisma.user.findFirst({
        where: { nome: { contains: 'Usuário Teste' } }
      });

      if (!testUser) {
        console.log('❌ Nenhum usuário de teste encontrado');
        return;
      }

      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { criado_em: 'asc' }
      });

      console.log(`👤 Usuário: ${testUser.nome}`);
      console.log(`🎲 Total de transações: ${transactions.length}`);

      let totalDebits = 0;
      let totalCredits = 0;

      const debits = transactions.filter(t => 
        t.tipo === 'abertura_caixa' || t.tipo === 'saque'
      );
      const credits = transactions.filter(t => 
        t.tipo === 'premio' || t.tipo === 'deposito'
      );

      debits.forEach(t => totalDebits += t.valor);
      credits.forEach(t => totalCredits += t.valor);

      console.log(`💸 Total débitos: R$ ${totalDebits.toFixed(2)}`);
      console.log(`🎁 Total créditos: R$ ${totalCredits.toFixed(2)}`);
      console.log(`📊 Saldo calculado: R$ ${(totalCredits - totalDebits).toFixed(2)}`);
      console.log(`💰 Saldo real: R$ ${testUser.saldo.toFixed(2)}`);

      const expectedBalance = 10000 + totalCredits - totalDebits;
      const actualBalance = testUser.saldo;
      const difference = Math.abs(expectedBalance - actualBalance);

      console.log(`\n🔍 ANÁLISE:`);
      console.log(`   💰 Saldo esperado: R$ ${expectedBalance.toFixed(2)}`);
      console.log(`   💰 Saldo real: R$ ${actualBalance.toFixed(2)}`);
      console.log(`   ⚠️ Diferença: R$ ${difference.toFixed(2)}`);

      if (difference < 0.01) {
        console.log(`   ✅ Consistência: CORRETA`);
      } else {
        console.log(`   ❌ Consistência: INCORRETA`);
        
        // Mostrar últimas transações para debug
        console.log(`\n📋 Últimas 10 transações:`);
        const lastTransactions = transactions.slice(-10);
        lastTransactions.forEach((t, i) => {
          const sign = t.tipo === 'premio' || t.tipo === 'deposito' ? '+' : '-';
          console.log(`   ${i + 1}. ${t.tipo}: ${sign}R$ ${t.valor.toFixed(2)} - ${t.descricao}`);
        });
      }

    } catch (error) {
      console.error('❌ Erro na verificação:', error);
    }
  }
}

// Executar debug se chamado diretamente
if (require.main === module) {
  const balanceDebugger = new BalanceSyncDebugger();
  balanceDebugger.debugSync()
    .then(() => balanceDebugger.checkTransactionConsistency())
    .catch(console.error);
}

module.exports = BalanceSyncDebugger;
