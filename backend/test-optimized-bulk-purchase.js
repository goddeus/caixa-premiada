const { PrismaClient } = require('@prisma/client');
const bulkPurchaseService = require('./src/services/bulkPurchaseServiceOptimized');

const prisma = new PrismaClient();

/**
 * Teste da Versão Otimizada de Compras Múltiplas
 */
async function testOptimizedBulkPurchase() {
  console.log('🚀 TESTE DA VERSÃO OTIMIZADA DE COMPRAS MÚLTIPLAS');
  console.log('=' .repeat(60));

  let testUser = null;
  let demoUser = null;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...');
    testUser = await prisma.user.create({
      data: {
        nome: 'Teste Otimizado',
        email: `teste.otimizado.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo: 100.00,
        tipo_conta: 'normal'
      }
    });
    console.log(`✅ Usuário criado: ${testUser.id}`);

    // 2. Criar usuário demo
    console.log('\n2️⃣ Criando usuário demo...');
    demoUser = await prisma.user.create({
      data: {
        nome: 'Teste Demo Otimizado',
        email: `demo.otimizado.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now() + 1}`,
        saldo: 0.00,
        saldo_demo: 100.00,
        tipo_conta: 'afiliado_demo'
      }
    });
    console.log(`✅ Usuário demo criado: ${demoUser.id}`);

    // 3. Buscar caixas disponíveis
    console.log('\n3️⃣ Buscando caixas disponíveis...');
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      take: 2
    });

    if (cases.length < 2) {
      throw new Error('Necessário pelo menos 2 caixas ativas para teste');
    }

    console.log(`✅ Encontradas ${cases.length} caixas para teste`);

    // 4. Teste: Compra múltipla básica (usuário normal)
    console.log('\n4️⃣ Testando compra múltipla básica...');
    const caixaItems = [
      { caixaId: cases[0].id, quantidade: 2 },
      { caixaId: cases[1].id, quantidade: 1 }
    ];

    const result1 = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      caixaItems
    );

    if (result1.success) {
      console.log('✅ Compra múltipla básica bem-sucedida');
      console.log(`   Total debitado: R$ ${result1.totalDebitado.toFixed(2)}`);
      console.log(`   Prêmios: R$ ${result1.somaPremios.toFixed(2)}`);
      console.log(`   Saldo final: R$ ${result1.saldoFinal.toFixed(2)}`);
      testsPassed++;
    } else {
      console.log('❌ Compra múltipla básica falhou:', result1.error);
      testsFailed++;
    }

    // 5. Teste: Compra múltipla com conta demo
    console.log('\n5️⃣ Testando compra múltipla com conta demo...');
    const result2 = await bulkPurchaseService.processBulkPurchase(
      demoUser.id,
      null,
      caixaItems
    );

    if (result2.success && result2.isDemoAccount) {
      console.log('✅ Compra múltipla demo bem-sucedida');
      console.log(`   Total debitado: R$ ${result2.totalDebitado.toFixed(2)}`);
      console.log(`   Prêmios: R$ ${result2.somaPremios.toFixed(2)}`);
      console.log(`   Saldo final: R$ ${result2.saldoFinal.toFixed(2)}`);
      testsPassed++;
    } else {
      console.log('❌ Compra múltipla demo falhou:', result2.error);
      testsFailed++;
    }

    // 6. Teste: Verificar transações
    console.log('\n6️⃣ Verificando transações...');
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: testUser.id,
        tipo: {
          in: ['abertura_caixa_multipla', 'premio', 'premio_visual']
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    if (transactions.length > 0) {
      console.log(`✅ ${transactions.length} transações registradas`);
      testsPassed++;
    } else {
      console.log('❌ Nenhuma transação registrada');
      testsFailed++;
    }

    // 7. Teste: Verificar auditoria
    console.log('\n7️⃣ Verificando auditoria...');
    const audits = await prisma.purchaseAudit.findMany({
      where: {
        user_id: testUser.id
      },
      orderBy: { criado_em: 'desc' }
    });

    if (audits.length > 0) {
      console.log(`✅ ${audits.length} compras registradas na auditoria`);
      testsPassed++;
    } else {
      console.log('❌ Nenhuma compra registrada na auditoria');
      testsFailed++;
    }

    // 8. Teste: Verificar consistência de saldo
    console.log('\n8️⃣ Verificando consistência de saldo...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { saldo: true }
    });

    if (result1.success) {
      const expectedBalance = 100.00 - result1.totalDebitado + result1.somaPremios;
      if (Math.abs(updatedUser.saldo - expectedBalance) < 0.01) {
        console.log('✅ Consistência de saldo verificada');
        testsPassed++;
      } else {
        console.log(`❌ Inconsistência de saldo: esperado ${expectedBalance}, atual ${updatedUser.saldo}`);
        testsFailed++;
      }
    } else {
      console.log('⚠️ Pulando verificação de saldo - compra falhou');
      testsFailed++;
    }

    // 9. Teste: Verificar conta demo não afetou saldo real
    console.log('\n9️⃣ Verificando isolamento de conta demo...');
    const updatedDemoUser = await prisma.user.findUnique({
      where: { id: demoUser.id },
      select: { saldo: true, saldo_demo: true }
    });

    if (result2.success) {
      const expectedDemoBalance = 100.00 - result2.totalDebitado + result2.somaPremios;
      if (updatedDemoUser.saldo === 0.00 && Math.abs(updatedDemoUser.saldo_demo - expectedDemoBalance) < 0.01) {
        console.log('✅ Conta demo isolada corretamente');
        testsPassed++;
      } else {
        console.log(`❌ Conta demo: saldo real ${updatedDemoUser.saldo}, saldo_demo ${updatedDemoUser.saldo_demo}, esperado ${expectedDemoBalance}`);
        testsFailed++;
      }
    } else {
      console.log('⚠️ Pulando verificação de conta demo - compra falhou');
      testsFailed++;
    }

  } catch (error) {
    console.error('❌ ERRO NOS TESTES:', error);
    testsFailed++;
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

        await prisma.userSession.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.user.delete({
          where: { id: testUser.id }
        });
      }

      if (demoUser) {
        await prisma.transaction.deleteMany({
          where: { user_id: demoUser.id }
        });

        await prisma.purchaseAudit.deleteMany({
          where: { user_id: demoUser.id }
        });

        await prisma.userSession.deleteMany({
          where: { user_id: demoUser.id }
        });

        await prisma.user.delete({
          where: { id: demoUser.id }
        });
      }

      console.log('✅ Dados de teste removidos');
    } catch (cleanupError) {
      console.error('⚠️ Erro na limpeza:', cleanupError.message);
    }

    await prisma.$disconnect();
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES OTIMIZADOS');
  console.log('=' .repeat(60));
  console.log(`✅ Testes passaram: ${testsPassed}`);
  console.log(`❌ Testes falharam: ${testsFailed}`);
  console.log(`📈 Taxa de sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Versão otimizada funcionando perfeitamente.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os logs acima para detalhes.');
  }

  return { testsPassed, testsFailed };
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testOptimizedBulkPurchase()
    .then(({ testsPassed, testsFailed }) => {
      process.exit(testsFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Erro fatal no teste otimizado:', error);
      process.exit(1);
    });
}

module.exports = { testOptimizedBulkPurchase };



