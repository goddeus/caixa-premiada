const { PrismaClient } = require('@prisma/client');
const bulkPurchaseService = require('./src/services/bulkPurchaseService');

const prisma = new PrismaClient();

/**
 * Teste Simples de Compra Múltipla
 * 
 * Este script testa apenas o básico do sistema de compras múltiplas
 * para identificar problemas específicos.
 */
async function testSimpleBulkPurchase() {
  console.log('🧪 TESTE SIMPLES DE COMPRA MÚLTIPLA');
  console.log('=' .repeat(50));

  let testUser = null;

  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...');
    testUser = await prisma.user.create({
      data: {
        nome: 'Teste Simples',
        email: `teste.simples.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo: 100.00,
        tipo_conta: 'normal'
      }
    });
    console.log(`✅ Usuário criado: ${testUser.id}`);

    // 2. Buscar uma caixa disponível
    console.log('\n2️⃣ Buscando caixa disponível...');
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      take: 1
    });

    if (cases.length === 0) {
      throw new Error('Nenhuma caixa ativa encontrada');
    }

    const caseData = cases[0];
    console.log(`✅ Caixa encontrada: ${caseData.nome} (R$ ${caseData.preco})`);

    // 3. Testar compra de uma caixa
    console.log('\n3️⃣ Testando compra de uma caixa...');
    const caixaItems = [{ caixaId: caseData.id, quantidade: 1 }];

    const result = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      caixaItems
    );

    console.log('\n📊 RESULTADO DA COMPRA:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Purchase ID: ${result.purchaseId}`);
    console.log(`  Total Debitado: R$ ${result.totalDebitado || 0}`);
    console.log(`  Soma Prêmios: R$ ${result.somaPremios || 0}`);
    console.log(`  Saldo Final: R$ ${result.saldoFinal || 0}`);
    console.log(`  Prêmios: ${result.premios ? result.premios.length : 0}`);

    if (result.success) {
      console.log('\n✅ COMPRA BEM-SUCEDIDA!');
      
      // 4. Verificar transações
      console.log('\n4️⃣ Verificando transações...');
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { criado_em: 'desc' }
      });

      console.log(`📊 Total de transações: ${transactions.length}`);
      transactions.forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.tipo}: R$ ${tx.valor} - ${tx.descricao}`);
      });

      // 5. Verificar auditoria
      console.log('\n5️⃣ Verificando auditoria...');
      const audits = await prisma.purchaseAudit.findMany({
        where: { user_id: testUser.id }
      });

      console.log(`📊 Total de auditorias: ${audits.length}`);
      if (audits.length > 0) {
        const audit = audits[0];
        console.log(`  Purchase ID: ${audit.purchase_id}`);
        console.log(`  Total Preço: R$ ${audit.total_preco}`);
        console.log(`  Soma Prêmios: R$ ${audit.soma_premios}`);
        console.log(`  Saldo Antes: R$ ${audit.saldo_antes}`);
        console.log(`  Saldo Depois: R$ ${audit.saldo_depois}`);
      }

      // 6. Verificar saldo final
      console.log('\n6️⃣ Verificando saldo final...');
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { saldo: true }
      });

      console.log(`💰 Saldo atual: R$ ${updatedUser.saldo}`);
      
      const expectedBalance = 100.00 - result.totalDebitado + result.somaPremios;
      console.log(`💰 Saldo esperado: R$ ${expectedBalance}`);
      
      if (Math.abs(updatedUser.saldo - expectedBalance) < 0.01) {
        console.log('✅ Saldo consistente!');
      } else {
        console.log('❌ Saldo inconsistente!');
      }

    } else {
      console.log('\n❌ COMPRA FALHOU!');
      console.log(`  Erro: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  } finally {
    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    try {
      if (testUser) {
        await prisma.transaction.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.purchaseAudit.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.user.delete({
          where: { id: testUser.id }
        });

        console.log('✅ Dados de teste removidos');
      }
    } catch (cleanupError) {
      console.error('⚠️ Erro na limpeza:', cleanupError.message);
    }

    await prisma.$disconnect();
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testSimpleBulkPurchase()
    .then(() => {
      console.log('\n🏁 Teste simples concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal no teste simples:', error);
      process.exit(1);
    });
}

module.exports = { testSimpleBulkPurchase };



