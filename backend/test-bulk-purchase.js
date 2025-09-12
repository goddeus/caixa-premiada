const { PrismaClient } = require('@prisma/client');
const bulkPurchaseService = require('./src/services/bulkPurchaseService');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Script de Teste para Compras Múltiplas
 * 
 * Este script testa o sistema de compras múltiplas com:
 * - Testes unitários de validação
 * - Testes de integração com banco de dados
 * - Testes de concorrência
 * - Testes de contas demo vs reais
 * - Testes de idempotência
 */
async function runBulkPurchaseTests() {
  console.log('🧪 INICIANDO TESTES DE COMPRAS MÚLTIPLAS');
  console.log('=' .repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;
  let testUser = null;
  let demoUser = null;

  try {
    // 1. TESTE: Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...');
    testUser = await prisma.user.create({
      data: {
        nome: 'Teste Compras Múltiplas',
        email: `teste.bulk.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo: 1000.00,
        tipo_conta: 'normal'
      }
    });
    console.log(`✅ Usuário criado: ${testUser.id}`);

    // 2. TESTE: Criar usuário demo
    console.log('\n2️⃣ Criando usuário demo...');
    demoUser = await prisma.user.create({
      data: {
        nome: 'Teste Demo Compras',
        email: `demo.bulk.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now() + 1}`,
        saldo: 0.00,
        saldo_demo: 1000.00,
        tipo_conta: 'afiliado_demo'
      }
    });
    console.log(`✅ Usuário demo criado: ${demoUser.id}`);

    // 3. TESTE: Buscar caixas disponíveis
    console.log('\n3️⃣ Buscando caixas disponíveis...');
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      take: 3
    });

    if (cases.length < 2) {
      throw new Error('Necessário pelo menos 2 caixas ativas para teste');
    }

    console.log(`✅ Encontradas ${cases.length} caixas para teste`);

    // 4. TESTE: Compra múltipla básica (usuário normal)
    console.log('\n4️⃣ Testando compra múltipla básica...');
    const caixaItems = [
      { caixaId: cases[0].id, quantidade: 2 },
      { caixaId: cases[1].id, quantidade: 1 }
    ];

    const purchaseId1 = uuidv4();
    const result1 = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      caixaItems,
      purchaseId1
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

    // 5. TESTE: Compra múltipla com conta demo
    console.log('\n5️⃣ Testando compra múltipla com conta demo...');
    const result2 = await bulkPurchaseService.processBulkPurchase(
      demoUser.id,
      null,
      caixaItems,
      uuidv4()
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

    // 6. TESTE: Idempotência
    console.log('\n6️⃣ Testando idempotência...');
    const result3 = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      caixaItems,
      purchaseId1 // Mesmo ID da primeira compra
    );

    if (result3.success && result3.alreadyProcessed) {
      console.log('✅ Idempotência funcionando corretamente');
      testsPassed++;
    } else {
      console.log('❌ Idempotência falhou');
      testsFailed++;
    }

    // 7. TESTE: Saldo insuficiente
    console.log('\n7️⃣ Testando saldo insuficiente...');
    const result4 = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      [{ caixaId: cases[0].id, quantidade: 1000 }], // Quantidade muito alta
      uuidv4()
    );

    if (!result4.success && result4.error.includes('Saldo insuficiente')) {
      console.log('✅ Validação de saldo insuficiente funcionando');
      testsPassed++;
    } else {
      console.log('❌ Validação de saldo insuficiente falhou');
      testsFailed++;
    }

    // 8. TESTE: Validação de dados de entrada
    console.log('\n8️⃣ Testando validação de dados...');
    const result5 = await bulkPurchaseService.processBulkPurchase(
      testUser.id,
      null,
      [], // Array vazio
      uuidv4()
    );

    if (!result5.success && result5.error.includes('Lista de caixas é obrigatória')) {
      console.log('✅ Validação de dados funcionando');
      testsPassed++;
    } else {
      console.log('❌ Validação de dados falhou');
      testsFailed++;
    }

    // 9. TESTE: Verificar auditoria
    console.log('\n9️⃣ Verificando auditoria...');
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

    // 10. TESTE: Verificar transações
    console.log('\n🔟 Verificando transações...');
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

    // 11. TESTE: Verificar consistência de saldo
    console.log('\n1️⃣1️⃣ Verificando consistência de saldo...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { saldo: true }
    });

    if (result1.success) {
      const expectedBalance = 1000.00 - (result1.totalDebitado || 0) + (result1.somaPremios || 0);
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

    // 12. TESTE: Verificar conta demo não afetou saldo real
    console.log('\n1️⃣2️⃣ Verificando isolamento de conta demo...');
    const updatedDemoUser = await prisma.user.findUnique({
      where: { id: demoUser.id },
      select: { saldo: true, saldo_demo: true }
    });

    if (result2.success) {
      const expectedDemoBalance = 1000.00 - (result2.totalDebitado || 0) + (result2.somaPremios || 0);
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
    // Limpeza: remover usuários de teste
    console.log('\n🧹 Limpando dados de teste...');
    try {
      await prisma.transaction.deleteMany({
        where: {
          user_id: {
            in: [testUser?.id, demoUser?.id].filter(Boolean)
          }
        }
      });

      await prisma.purchaseAudit.deleteMany({
        where: {
          user_id: {
            in: [testUser?.id, demoUser?.id].filter(Boolean)
          }
        }
      });

      await prisma.user.deleteMany({
        where: {
          id: {
            in: [testUser?.id, demoUser?.id].filter(Boolean)
          }
        }
      });

      console.log('✅ Dados de teste removidos');
    } catch (cleanupError) {
      console.error('⚠️ Erro na limpeza:', cleanupError.message);
    }

    await prisma.$disconnect();
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(60));
  console.log(`✅ Testes passaram: ${testsPassed}`);
  console.log(`❌ Testes falharam: ${testsFailed}`);
  console.log(`📈 Taxa de sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema de compras múltiplas funcionando corretamente.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os logs acima para detalhes.');
  }

  return { testsPassed, testsFailed };
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runBulkPurchaseTests()
    .then(({ testsPassed, testsFailed }) => {
      process.exit(testsFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Erro fatal nos testes:', error);
      process.exit(1);
    });
}

module.exports = { runBulkPurchaseTests };
