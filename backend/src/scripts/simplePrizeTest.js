const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Teste simples de creditação de prêmios
 */
class SimplePrizeTest {

  async runTest() {
    console.log('🧪 TESTE SIMPLES DE CREDITAÇÃO');
    console.log('==============================\n');

    try {
      // 1. Criar usuário de teste
      const testUser = await this.createTestUser();
      console.log(`👤 Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);

      // 2. Testar débito simples
      console.log('\n💸 TESTE DE DÉBITO:');
      const balanceBeforeDebit = await this.getUserBalance(testUser.id);
      console.log(`💰 Saldo antes: R$ ${balanceBeforeDebit}`);

      // Debitar R$ 10
      await prisma.user.update({
        where: { id: testUser.id },
        data: { saldo: { decrement: 10 } }
      });

      const balanceAfterDebit = await this.getUserBalance(testUser.id);
      console.log(`💰 Saldo depois: R$ ${balanceAfterDebit}`);
      console.log(`✅ Diferença: R$ ${balanceBeforeDebit - balanceAfterDebit} (esperado: R$ 10)`);

      // Registrar transação de débito
      await prisma.transaction.create({
        data: {
          user_id: testUser.id,
          tipo: 'abertura_caixa',
          valor: 10,
          status: 'concluido',
          descricao: 'Teste de débito'
        }
      });

      // 3. Testar crédito simples
      console.log('\n🎁 TESTE DE CRÉDITO:');
      const balanceBeforeCredit = await this.getUserBalance(testUser.id);
      console.log(`💰 Saldo antes: R$ ${balanceBeforeCredit}`);

      // Creditar R$ 5
      await prisma.user.update({
        where: { id: testUser.id },
        data: { saldo: { increment: 5 } }
      });

      const balanceAfterCredit = await this.getUserBalance(testUser.id);
      console.log(`💰 Saldo depois: R$ ${balanceAfterCredit}`);
      console.log(`✅ Diferença: R$ ${balanceAfterCredit - balanceBeforeCredit} (esperado: R$ 5)`);

      // Registrar transação de crédito
      await prisma.transaction.create({
        data: {
          user_id: testUser.id,
          tipo: 'premio',
          valor: 5,
          status: 'concluido',
          descricao: 'Teste de crédito'
        }
      });

      // 4. Verificar consistência
      console.log('\n🔍 VERIFICAÇÃO DE CONSISTÊNCIA:');
      const finalBalance = await this.getUserBalance(testUser.id);
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id }
      });

      const totalDebits = transactions
        .filter(t => t.tipo === 'abertura_caixa')
        .reduce((sum, t) => sum + t.valor, 0);

      const totalCredits = transactions
        .filter(t => t.tipo === 'premio')
        .reduce((sum, t) => sum + t.valor, 0);

      const expectedBalance = 10000 - totalDebits + totalCredits;

      console.log(`💰 Saldo final: R$ ${finalBalance}`);
      console.log(`💸 Total débitos: R$ ${totalDebits}`);
      console.log(`🎁 Total créditos: R$ ${totalCredits}`);
      console.log(`📊 Saldo esperado: R$ ${expectedBalance}`);
      console.log(`✅ Consistência: ${Math.abs(finalBalance - expectedBalance) < 0.01 ? 'CORRETA' : 'INCORRETA'}`);

      // 5. Limpar dados
      await this.cleanup(testUser.id);
      console.log('\n🧹 Dados de teste limpos');

    } catch (error) {
      console.error('❌ Erro no teste:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async createTestUser() {
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        nome: 'Usuário Teste Simples',
        email: `teste.simples.${timestamp}@teste.com`,
        senha_hash: 'teste123',
        cpf: `${Math.random().toString().substr(2, 11)}`,
        saldo: 10000.00
      }
    });

    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo: 10000.00
      }
    });

    return testUser;
  }

  async getUserBalance(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });
    return user ? user.saldo : 0;
  }

  async cleanup(userId) {
    await prisma.transaction.deleteMany({
      where: { user_id: userId }
    });
    await prisma.wallet.deleteMany({
      where: { user_id: userId }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const test = new SimplePrizeTest();
  test.runTest().catch(console.error);
}

module.exports = SimplePrizeTest;

